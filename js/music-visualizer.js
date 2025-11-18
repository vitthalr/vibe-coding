// Audio-Reactive Music Visualizer for Thank You Section
// Creates beautiful, dynamic visualizations synced to music

class MusicVisualizer {
    constructor(containerId, audioElementId) {
        this.container = document.getElementById(containerId);
        this.audio = document.getElementById(audioElementId);
        this.canvas = null;
        this.ctx = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.animationId = null;
        this.isRunning = false;
        
        // Visual parameters
        this.particles = [];
        this.waveforms = [];
        this.colorPalette = [
            { r: 119, g: 117, b: 214 },  // purple
            { r: 233, g: 53, b: 193 },   // pink
            { r: 79, g: 70, b: 229 },    // indigo
            { r: 6, g: 182, b: 212 },    // cyan
            { r: 167, g: 139, b: 250 }   // light purple
        ];
    }
    
    init() {
        if (!this.container || !this.audio) return;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Setup audio context and analyser
        this.setupAudio();
        
        // Create particles
        this.createParticles();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }
    
    setupAudio() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        // Connect audio element to analyser
        const source = this.audioContext.createMediaElementSource(this.audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }
    
    resize() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }
    
    createParticles() {
        const particleCount = 150;
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 1,
                colorIndex: Math.floor(Math.random() * this.colorPalette.length),
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate average frequency for overall energy
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += this.dataArray[i];
        }
        const avgFrequency = sum / this.bufferLength;
        const energyLevel = avgFrequency / 255;
        
        // Clear canvas with trailing effect
        this.ctx.fillStyle = 'rgba(17, 24, 39, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw circular frequency bars
        this.drawCircularBars(energyLevel);
        
        // Draw particles
        this.drawParticles(energyLevel);
        
        // Draw center glow
        this.drawCenterGlow(energyLevel);
        
        // Draw waveform
        this.drawWaveform();
    }
    
    drawCircularBars(energyLevel) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.15;
        const barCount = 64;
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * this.bufferLength / barCount);
            const barHeight = (this.dataArray[dataIndex] / 255) * 150;
            const angle = (i / barCount) * Math.PI * 2;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);
            
            // Rainbow color based on angle
            const colorIndex = Math.floor((i / barCount) * this.colorPalette.length);
            const color = this.colorPalette[colorIndex];
            const alpha = 0.6 + energyLevel * 0.4;
            
            this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }
    
    drawParticles(energyLevel) {
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx * (1 + energyLevel);
            particle.y += particle.vy * (1 + energyLevel);
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Pulsing effect
            particle.pulsePhase += 0.05;
            const pulse = Math.sin(particle.pulsePhase) * 0.5 + 0.5;
            const particleRadius = particle.radius * (1 + pulse * energyLevel);
            
            // Draw particle
            const color = this.colorPalette[particle.colorIndex];
            const alpha = 0.4 + energyLevel * 0.4;
            
            this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particleRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particleRadius * 3
            );
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                particle.x - particleRadius * 3,
                particle.y - particleRadius * 3,
                particleRadius * 6,
                particleRadius * 6
            );
        });
    }
    
    drawCenterGlow(energyLevel) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const glowRadius = 100 + energyLevel * 100;
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, glowRadius
        );
        
        const color = this.colorPalette[Math.floor(Date.now() / 1000) % this.colorPalette.length];
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${energyLevel * 0.3})`);
        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${energyLevel * 0.1})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            centerX - glowRadius,
            centerY - glowRadius,
            glowRadius * 2,
            glowRadius * 2
        );
    }
    
    drawWaveform() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const sliceWidth = this.canvas.width / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 255.0;
            const y = this.canvas.height / 2 + (v - 0.5) * this.canvas.height * 0.4;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
    }
}

// Initialize visualizer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.musicVisualizer = new MusicVisualizer('thankYouThreeContainer', 'thankYouMusic');
    window.musicVisualizer.init();
});
