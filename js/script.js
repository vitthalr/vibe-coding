$(document).ready(function() {
    // ===== DOM ELEMENTS & CONSTANTS =====
    const sections = $('.snap-section');
    const navDots = $('.nav-dot');
    const progressBar = $('#progressBar');
    const container = $('#mainContainer');
    const ANIMATION_DURATION = 600;
    
    // ===== STATE MANAGEMENT =====
    let isAnimating = false;
    let previousSection = null;
    let sectionOffsets = [];
    
    // Calculate actual section positions
    function calculateSectionOffsets() {
        sectionOffsets = [];
        sections.each(function(index) {
            sectionOffsets.push($(this).offset().top - container.offset().top + container.scrollTop());
        });
    }
    
    // Get current section based on scroll position
    function getCurrentSectionIndex(scrollTop) {
        for (let i = sectionOffsets.length - 1; i >= 0; i--) {
            if (scrollTop >= sectionOffsets[i] - 50) {
                return i;
            }
        }
        return 0;
    }
    
    // ===== HELPER FUNCTIONS =====
    
    /**
     * Manages scroll-snap behavior during animations
     */
    function disableScrollSnap() {
        container.css('scroll-snap-type', 'none');
    }
    
    function enableScrollSnap() {
        container.css('scroll-snap-type', 'y mandatory');
    }
    
    /**
     * Smoothly scrolls to a target position
     */
    function scrollToPosition(targetScroll, duration = ANIMATION_DURATION) {
        if (isAnimating) {
            container.stop(true, true);
        }
        
        isAnimating = true;
        disableScrollSnap();
        
        container.animate({
            scrollTop: targetScroll
        }, duration, 'swing', function() {
            enableScrollSnap();
            isAnimating = false;
        });
    }
    
    // ===== PROGRESS BAR & NAVIGATION DOTS =====
    
    container.on('scroll', function() {
        const scrollTop = container.scrollTop();
        const scrollHeight = container[0].scrollHeight - container.height();
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        
        // Update progress bar
        progressBar.css('width', scrollPercentage + '%');
        
        // Update active nav dot based on actual section positions
        const currentSection = getCurrentSectionIndex(scrollTop);
        navDots.removeClass('active');
        navDots.eq(currentSection).addClass('active');
        
        // Update active sections
        checkActiveSection();
        const currentSectionObj = getActiveSection();
        previousSection = currentSectionObj;
    });
    
    // Navigation dot click handler
    navDots.on('click', function() {
        const sectionIndex = $(this).data('section');
        const targetScroll = sectionOffsets[sectionIndex] || 0;
        scrollToPosition(targetScroll, 800);
        
        // After scrolling, reveal all content for reveal sections
        setTimeout(function() {
            const section = getActiveSection();
            if (section && !section.hasBeenRevealed) {
                // Reveal all items in the section
                while (!section.isComplete()) {
                    section.revealNext();
                }
            }
        }, 900); // Wait for scroll animation to complete
    });
    
    // ===== MODULAR REVEAL SYSTEM =====
    
    /**
     * RevealSection Class - A reusable class for creating reveal animations
     */
    class RevealSection {
        constructor(config) {
            this.sectionId = config.sectionId;
            this.containerId = config.containerId;
            this.headerId = config.headerId;
            this.contentId = config.contentId;
            this.itemsClass = config.itemsClass;
            this.currentIndex = -1;
            this.isActive = false;
            this.hasBeenRevealed = false;
            this.onFirstReveal = config.onFirstReveal || null;
            this.onItemReveal = config.onItemReveal || null;
            this.customElements = config.customElements || [];
        }
        
        checkActive(scrollTop, containerOffset) {
            const sectionElement = $('#' + this.sectionId);
            if (sectionElement.length) {
                const sectionTop = sectionElement.offset().top - containerOffset + scrollTop;
                const sectionHeight = sectionElement.outerHeight();
                this.isActive = scrollTop >= sectionTop - 100 && scrollTop < sectionTop + sectionHeight - 100;
            }
            return this.isActive;
        }
        
        revealNext() {
            const items = $(this.itemsClass);
            
            if (this.currentIndex < items.length - 1) {
                this.currentIndex++;
                
                if (this.currentIndex === 0) {
                    this.hasBeenRevealed = true;
                    this.performFirstReveal();
                }
                
                // Call onItemReveal BEFORE showing the item (so it can be prevented/delayed)
                if (this.onItemReveal) {
                    const shouldShowImmediately = this.onItemReveal(this.currentIndex);
                    // If onItemReveal returns false, don't show the item yet
                    if (shouldShowImmediately === false) {
                        return true;
                    }
                }
                
                $(items[this.currentIndex])
                    .removeClass('opacity-0 translate-x-8 translate-y-8')
                    .addClass('opacity-100 translate-x-0 translate-y-0');
                
                return true;
            }
            return false;
        }
        
        performFirstReveal() {
            $('#' + this.contentId).css({
                'max-height': '2000px',
                'opacity': '1'
            });
            
            if (this.onFirstReveal) {
                this.onFirstReveal();
            }
            
            // Trigger recalculation of section offsets
            $(document).trigger('revealUpdated');
        }
        
        isComplete() {
            return this.currentIndex >= $(this.itemsClass).length - 1;
        }
        
        hideLastItem() {
            const items = $(this.itemsClass);
            
            if (this.currentIndex >= 0) {
                // Hide the current item
                $(items[this.currentIndex])
                    .removeClass('opacity-100 translate-x-0 translate-y-0')
                    .addClass('opacity-0 translate-y-8');
                
                this.currentIndex--;
                
                // If we've hidden all items, hide the container too
                if (this.currentIndex < 0) {
                    $('#' + this.contentId).css({
                        'max-height': '0',
                        'opacity': '0'
                    });
                    this.hasBeenRevealed = false;
                    
                    // Reset custom elements if any
                    if (this.onFirstReveal) {
                        $('#journeyTimelineLeft, #journeyTimelineRight').css('opacity', '0');
                    }
                    
                    // Trigger recalculation of section offsets
                    $(document).trigger('revealUpdated');
                }
                
                return true;
            }
            return false;
        }
        
        hasContent() {
            return this.currentIndex >= 0;
        }
    }
    
    // ===== REVEAL SECTIONS CONFIGURATION =====
    
    const revealSections = {
        jsMagic: new RevealSection({
            sectionId: 'jsMagicSection',
            containerId: 'jsMagicContainer',
            headerId: 'jsMagicHeader',
            contentId: 'jsMagicContent',
            itemsClass: '.js-magic-card'
        }),
        
        showTime: new RevealSection({
            sectionId: 'showTimeSection',
            containerId: 'showTimeContainer',
            headerId: 'showTimeHeader',
            contentId: 'showTimeContent',
            itemsClass: '.show-time-card'
        }),
        
        beyondWeb: new RevealSection({
            sectionId: 'beyondWebSection',
            containerId: 'beyondWebContainer',
            headerId: 'beyondWebHeader',
            contentId: 'beyondWebContent',
            itemsClass: '.beyond-web-card'
        }),
        
        journey: new RevealSection({
            sectionId: 'journeySection',
            containerId: 'journeyContainer',
            headerId: 'journeyHeader',
            contentId: 'timelineContainer',
            itemsClass: '.timeline-item',
            onFirstReveal: function() {
                $('#journeyTimelineLeft').css('opacity', '1');
            },
            onItemReveal: function(index) {
                if (index === 4) {
                    $('#journeyTimelineRight').css('opacity', '1');
                }
            },
            customElements: [
                { selector: '#journeyTimelineLeft', resetStyles: { 'opacity': '0' } },
                { selector: '#journeyTimelineRight', resetStyles: { 'opacity': '0' } }
            ]
        }),
        
        webFundamentals: new RevealSection({
            sectionId: 'webFundamentalsSection',
            containerId: 'webFundamentalsContainer',
            headerId: 'webFundamentalsHeader',
            contentId: 'webBlocksContainer',
            itemsClass: '.web-block'
        }),
        
        whatsNext: new RevealSection({
            sectionId: 'whatsNextSection',
            containerId: 'whatsNextContainer',
            headerId: 'whatsNextHeader',
            contentId: 'whatsNextContent',
            itemsClass: '.possibility-card'
        }),
        
        blenderMcp: new RevealSection({
            sectionId: 'blenderMcpSection',
            containerId: 'blenderMcpContainer',
            headerId: 'blenderMcpHeader',
            contentId: 'blenderMcpContent',
            itemsClass: '.blender-mcp-card'
        }),
        
        tailwindSolution: new RevealSection({
            sectionId: 'tailwindSection',
            containerId: 'tailwindContainer',
            headerId: 'tailwindHeader',
            contentId: 'tailwindContent',
            itemsClass: '.tailwind-item'
        }),
        
        copilotIntro: new RevealSection({
            sectionId: 'copilotSection',
            containerId: 'copilotContainer',
            headerId: 'copilotHeader',
            contentId: 'copilotContent',
            itemsClass: '.copilot-item'
        }),
        
        thankYou: new RevealSection({
            sectionId: 'thankYouSection',
            containerId: 'thankYouContainer',
            headerId: 'thankYouHeader',
            contentId: 'thankYouContent',
            itemsClass: '.thank-you-card',
            onItemReveal: function(index) {
                // When "Keep vibing, keep coding!" (item 1) is revealed
                if (index === 1) {
                    const thankYouMusic = $('#thankYouMusic')[0];
                    const musicContainer = $('#thankYouMusicContainer');
                    const playIcon = $('#thankYouPlayIcon');
                    const pauseIcon = $('#thankYouPauseIcon');
                    const visualizerContainer = $('#thankYouThreeContainer');
                    
                    // Show music player with fade in
                    musicContainer.css({
                        'opacity': '1',
                        'pointer-events': 'auto'
                    });
                    
                    // Auto-play music
                    thankYouMusic.volume = 1.0;
                    thankYouMusic.play().then(() => {
                        playIcon.addClass('hidden');
                        pauseIcon.removeClass('hidden');
                        
                        // Start Three.js animation after music starts
                        if (window.ThankYouThreeJS) {
                            window.ThankYouThreeJS.start();
                            visualizerContainer.css('opacity', '1');
                        }
                    }).catch(err => {
                        console.log('Thank you music autoplay failed:', err);
                    });
                }
            }
        })
    };
    
    // ===== REVEAL SECTION HELPERS =====
    
    function checkActiveSection() {
        const scrollTop = container.scrollTop();
        const containerOffset = container.offset().top;
        
        Object.keys(revealSections).forEach(key => {
            revealSections[key].checkActive(scrollTop, containerOffset);
        });
    }
    
    function getActiveSection() {
        for (let key in revealSections) {
            if (revealSections[key].isActive) {
                return revealSections[key];
            }
        }
        return null;
    }
    
    function revealNextItem() {
        const section = getActiveSection();
        if (section) {
            section.revealNext();
        }
    }
    
    // ===== KEYBOARD NAVIGATION =====
    
    $(document).on('keydown', function(e) {
        const activeSection = getActiveSection();
        const actualScroll = container.scrollTop();
        const currentSectionIndex = getCurrentSectionIndex(actualScroll);
        
        // Handle Down/Right/Space keys - Move to next section
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            
            // If on reveal section and not complete, reveal next item
            if (activeSection && !activeSection.isComplete()) {
                revealNextItem();
                return;
            }
            
            // Don't scroll past last section
            if (currentSectionIndex >= sections.length - 1) {
                return;
            }
            
            const targetScroll = sectionOffsets[currentSectionIndex + 1];
            scrollToPosition(targetScroll);
        }
        
        // Handle Left key - Hide content in reveal sections
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            
            // If on reveal section and has content, hide last item
            if (activeSection && activeSection.hasContent()) {
                activeSection.hideLastItem();
                return;
            }
            
            // Otherwise move to previous section
            if (currentSectionIndex <= 0) {
                return;
            }
            
            const targetScroll = sectionOffsets[currentSectionIndex - 1];
            scrollToPosition(targetScroll);
        }
        
        // Handle Up key - Always move to previous section
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            
            // Don't scroll before first section
            if (currentSectionIndex <= 0) {
                return;
            }
            
            const targetScroll = sectionOffsets[currentSectionIndex - 1];
            scrollToPosition(targetScroll);
        }
    });
    
    // ===== COPY BUTTON FUNCTIONALITY =====
    
    // Add copy buttons to all code blocks
    $('pre code').each(function() {
        const codeBlock = $(this);
        const pre = codeBlock.parent();
        
        // Wrap in a container if not already wrapped
        if (!pre.parent().hasClass('code-block-wrapper')) {
            pre.wrap('<div class="code-block-wrapper"></div>');
        }
        
        const wrapper = pre.parent();
        const codeText = codeBlock.text();
        
        // Create copy button for code blocks
        const copyBtn = $(`
            <button class="copy-btn" data-code="${codeText.replace(/"/g, '&quot;')}">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
            </button>
        `);
        
        wrapper.append(copyBtn);
    });
    
    // Handle all copy button clicks
    $(document).on('click', '.copy-btn', function(e) {
        e.preventDefault();
        const button = $(this);
        let textToCopy;
        
        // Check if it's a prompt or code block
        if (button.data('prompt')) {
            textToCopy = button.data('prompt');
        } else if (button.data('code')) {
            textToCopy = button.data('code');
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy).then(function() {
            // Update button state with checkmark
            const originalSVG = button.html();
            button.addClass('copied');
            button.html(`
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            `);
            
            // Reset after 2 seconds
            setTimeout(function() {
                button.removeClass('copied');
                button.html(originalSVG);
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy:', err);
        });
    });
    
    // ===== BREAK TIMER FUNCTIONALITY =====
    
    let timerInterval = null;
    let timeRemaining = 600; // 10 minutes in seconds
    let isTimerRunning = false;
    
    const playIcon = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    `;
    
    const pauseIcon = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    `;
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        $('#timerDisplay').text(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        // Change color based on time remaining
        if (timeRemaining <= 60) {
            $('#timerDisplay').css('color', '#ef4444'); // Red
        } else if (timeRemaining <= 180) {
            $('#timerDisplay').css('color', '#f59e0b'); // Orange
        } else {
            $('#timerDisplay').css('color', 'white');
        }
    }
    
    function updatePlayPauseButton(isPaused) {
        const $btn = $('#startTimer');
        if (isPaused) {
            $btn.html(playIcon);
            $btn.removeClass('bg-red-600 hover:bg-red-500').addClass('bg-green-600 hover:bg-green-500');
        } else {
            $btn.html(pauseIcon);
            $btn.removeClass('bg-green-600 hover:bg-green-500').addClass('bg-red-600 hover:bg-red-500');
        }
    }
    
    $('#startTimer').on('click', function() {
        if (!isTimerRunning) {
            // Start timer
            isTimerRunning = true;
            updatePlayPauseButton(false);
            
            timerInterval = setInterval(function() {
                if (timeRemaining > 0) {
                    timeRemaining--;
                    updateTimerDisplay();
                } else {
                    // Timer finished
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    updatePlayPauseButton(true);
                    
                    $('#timerDisplay').text('00:00');
                    $('#timerDisplay').css('color', '#ef4444');
                    
                    // Flash the display
                    let flashCount = 0;
                    const flashInterval = setInterval(function() {
                        $('#timerDisplay').toggleClass('opacity-0');
                        flashCount++;
                        if (flashCount >= 6) {
                            clearInterval(flashInterval);
                            $('#timerDisplay').removeClass('opacity-0');
                        }
                    }, 500);
                }
            }, 1000);
        } else {
            // Pause timer
            clearInterval(timerInterval);
            isTimerRunning = false;
            updatePlayPauseButton(true);
        }
    });
    
    $('#resetTimer').on('click', function() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeRemaining = 600;
        updateTimerDisplay();
        updatePlayPauseButton(true);
    });
    
    // ===== BACKGROUND MUSIC PLAYERS =====
    
    // Hero Music Player
    const musicToggle = $('#musicToggle');
    const heroMusic = $('#heroMusic')[0];
    const musicPlayIcon = $('#playIcon');
    const musicPauseIcon = $('#pauseIcon');
    let musicFadeInterval = null;
    
    // Thank You Music Player
    const thankYouMusicToggle = $('#thankYouMusicToggle');
    const thankYouMusic = $('#thankYouMusic')[0];
    const thankYouPlayIcon = $('#thankYouPlayIcon');
    const thankYouPauseIcon = $('#thankYouPauseIcon');
    const thankYouMusicContainer = $('#thankYouMusicContainer');
    
    if (musicToggle.length && heroMusic) {
        musicToggle.on('click', function() {
            if (heroMusic.paused) {
                heroMusic.play().then(() => {
                    musicPlayIcon.addClass('hidden');
                    musicPauseIcon.removeClass('hidden');
                }).catch(err => {
                    console.log('Audio play failed:', err);
                });
            } else {
                heroMusic.pause();
                musicPlayIcon.removeClass('hidden');
                musicPauseIcon.addClass('hidden');
            }
        });
        
        // Set initial volume to 100%
        heroMusic.volume = 1.0;
        
        // Fade in/out music based on scroll position
        function fadeMusic() {
            const scrollTop = container.scrollTop();
            const heroSectionHeight = sections.first().outerHeight();
            
            // If on hero section (first section)
            if (scrollTop < heroSectionHeight * 0.8) {
                // Fade in - resume playing if paused
                if (heroMusic.paused) {
                    heroMusic.play().then(() => {
                        musicPlayIcon.addClass('hidden');
                        musicPauseIcon.removeClass('hidden');
                    }).catch(err => {
                        console.log('Audio play failed:', err);
                    });
                }
                
                const targetVolume = 1.0;
                const fadeInDuration = 800; // ms
                const steps = 20;
                const stepTime = fadeInDuration / steps;
                const volumeStep = (targetVolume - heroMusic.volume) / steps;
                
                if (musicFadeInterval) clearInterval(musicFadeInterval);
                
                musicFadeInterval = setInterval(function() {
                    if (heroMusic.volume < targetVolume - 0.05) {
                        heroMusic.volume = Math.min(targetVolume, heroMusic.volume + volumeStep);
                    } else {
                        heroMusic.volume = targetVolume;
                        clearInterval(musicFadeInterval);
                    }
                }, stepTime);
            } else {
                // Fade out when leaving hero section
                const fadeOutDuration = 600; // ms
                const steps = 20;
                const stepTime = fadeOutDuration / steps;
                const volumeStep = heroMusic.volume / steps;
                
                if (musicFadeInterval) clearInterval(musicFadeInterval);
                
                musicFadeInterval = setInterval(function() {
                    if (heroMusic.volume > 0.05) {
                        heroMusic.volume = Math.max(0, heroMusic.volume - volumeStep);
                    } else {
                        heroMusic.volume = 0;
                        heroMusic.pause();
                        musicPlayIcon.removeClass('hidden');
                        musicPauseIcon.addClass('hidden');
                        clearInterval(musicFadeInterval);
                    }
                }, stepTime);
            }
        }
        
        // Monitor scroll for fade effect
        container.on('scroll', fadeMusic);
    }
    
    // Thank You Music Toggle
    if (thankYouMusicToggle.length && thankYouMusic) {
        thankYouMusicToggle.on('click', function() {
            if (thankYouMusic.paused) {
                thankYouMusic.play().then(() => {
                    thankYouPlayIcon.addClass('hidden');
                    thankYouPauseIcon.removeClass('hidden');
                }).catch(err => {
                    console.log('Thank you music play failed:', err);
                });
            } else {
                thankYouMusic.pause();
                thankYouPlayIcon.removeClass('hidden');
                thankYouPauseIcon.addClass('hidden');
            }
        });
        
        // Monitor section changes to hide/stop music AND animation when leaving Thank You section
        container.on('scroll', function() {
            const scrollTop = container.scrollTop();
            const thankYouSection = $('#thankYouSection');
            
            if (thankYouSection.length) {
                const sectionTop = thankYouSection.offset().top - container.offset().top + scrollTop;
                const sectionHeight = thankYouSection.outerHeight();
                const isOnThankYouSection = scrollTop >= sectionTop - 100 && scrollTop < sectionTop + sectionHeight - 100;
                
                // If not on Thank You section, hide and stop music + animation
                if (!isOnThankYouSection && thankYouMusicContainer.css('opacity') !== '0') {
                    // Hide and stop music
                    thankYouMusicContainer.css({
                        'opacity': '0',
                        'pointer-events': 'none'
                    });
                    
                    if (!thankYouMusic.paused) {
                        thankYouMusic.pause();
                        thankYouMusic.currentTime = 0; // Reset to start
                        thankYouPlayIcon.removeClass('hidden');
                        thankYouPauseIcon.addClass('hidden');
                    }
                    
                    // Stop and hide Three.js animation
                    const visualizerContainer = $('#thankYouThreeContainer');
                    if (window.ThankYouThreeJS) {
                        window.ThankYouThreeJS.stop();
                        visualizerContainer.css('opacity', '0');
                    }
                }
            }
        });
    }
    
    // ===== INITIALIZATION =====
    
    // Calculate section offsets on load
    calculateSectionOffsets();
    
    // Recalculate on window resize
    $(window).on('resize', function() {
        calculateSectionOffsets();
    });
    
    // Recalculate when reveal sections expand
    $(document).on('revealUpdated', function() {
        setTimeout(calculateSectionOffsets, 100);
    });
    
    // Initialize syntax highlighting
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
});
