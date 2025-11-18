// Three.js Thank You Background Animation - Slow with Vibrant Colors
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

class ThankYouAnimation {
    constructor() {
        this.container = document.getElementById('thankYouThreeContainer');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.particles = [];
        this.waves = [];
        this.isRunning = false;
        this.time = 0;
        
        this.init();
        this.createParticles();
        this.createWaves();
        this.createStarField();
        this.setupResize();
    }

    init() {
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        this.camera.position.z = 8;
    }

    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 600;
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);
        const sizes = new Float32Array(particlesCount);

        // Vibrant but sophisticated - NOT pastel!
        const colorPalette = [
            new THREE.Color(0xFFD700), // Bright Gold
            new THREE.Color(0xFF6B9D), // Hot Pink (vivid)
            new THREE.Color(0x00CED1), // Turquoise (bright)
            new THREE.Color(0xFF4500), // Orange Red (vibrant)
            new THREE.Color(0x9370DB), // Medium Purple (rich)
            new THREE.Color(0xFFFFFF), // Pure White
            new THREE.Color(0x1E90FF), // Dodger Blue (bright)
        ];

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 0.1 + 0.03;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.8, // More visible
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        this.particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particlesMesh);
    }

    createWaves() {
        // Create vibrant flowing wave lines
        const points = [];
        for (let i = 0; i < 50; i++) {
            const x = (i / 50) * 10 - 5;
            points.push(new THREE.Vector3(x, 0, 0));
        }

        const waveGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const waveConfigs = [
            { color: 0xFFD700, position: [0, 1.5, -3] },   // Bright Gold
            { color: 0xFF6B9D, position: [0, 0, -3] },     // Hot Pink
            { color: 0x1E90FF, position: [0, -1.5, -3] },  // Dodger Blue
        ];

        waveConfigs.forEach(config => {
            const material = new THREE.LineBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.4, // More visible
                linewidth: 2,
            });

            const wave = new THREE.Line(waveGeometry, material);
            wave.position.set(...config.position);
            this.waves.push(wave);
            this.scene.add(wave);
        });
    }

    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 150;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        // Colorful stars - not just white!
        const starColors = [
            new THREE.Color(0xFFFFFF), // White
            new THREE.Color(0xFFD700), // Gold
            new THREE.Color(0x00CED1), // Turquoise
            new THREE.Color(0xFF6B9D), // Pink
            new THREE.Color(0x9370DB), // Purple
        ];

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = (Math.random() - 0.5) * 30;
            positions[i3 + 2] = (Math.random() - 0.5) * 30;

            const color = starColors[Math.floor(Math.random() * starColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.6, // More visible
            blending: THREE.AdditiveBlending,
        });

        this.starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starField);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        this.time += 0.004; // Slow but not too slow

        // Slow, graceful particle motion
        if (this.particlesMesh) {
            const positions = this.particlesMesh.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const angle = this.time * 0.4 + i * 0.008;
                positions[i] += Math.sin(angle) * 0.01;
                positions[i + 1] += 0.008;
                positions[i + 2] += Math.cos(angle) * 0.01;
                
                if (positions[i + 1] > 10) {
                    positions[i + 1] = -10;
                }
            }
            
            this.particlesMesh.geometry.attributes.position.needsUpdate = true;
            this.particlesMesh.rotation.y = this.time * 0.04;
        }

        // Slow, elegant wave motion
        this.waves.forEach((wave, index) => {
            const positions = wave.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                positions[i + 1] = Math.sin(x * 0.5 + this.time * 1.5 + index * 0.6) * 0.5;
            }
            wave.geometry.attributes.position.needsUpdate = true;
        });

        // Slow star field rotation with twinkling
        if (this.starField) {
            this.starField.rotation.y = this.time * 0.025;
            this.starField.rotation.x = this.time * 0.018;
            
            // Gentle twinkling effect
            const opacity = this.starField.material.opacity;
            this.starField.material.opacity = 0.6 + Math.sin(this.time * 3) * 0.2;
        }

        this.renderer.render(this.scene, this.camera);
    }

    setupResize() {
        window.addEventListener('resize', () => {
            if (!this.container) return;
            
            this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        });
    }
}

// Initialize and expose globally
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ThankYouThreeJS = new ThankYouAnimation();
    });
} else {
    window.ThankYouThreeJS = new ThankYouAnimation();
}
