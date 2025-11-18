// Three.js Hero Background Animation
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js';

class HeroAnimation {
    constructor() {
        this.container = document.getElementById('hero-three-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.particles = [];
        this.spheres = [];
        
        this.init();
        this.createParticles();
        this.createFloatingSpheres();
        this.animate();
        this.setupResize();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        this.camera.position.z = 5;
    }

    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500; // Reduced from 2000 for better performance
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);

        const colorPalette = [
            new THREE.Color(0x9333EA), // Purple
            new THREE.Color(0xEC4899), // Pink
            new THREE.Color(0x6366F1), // Indigo
        ];

        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 15;
            positions[i + 1] = (Math.random() - 0.5) * 15;
            positions[i + 2] = (Math.random() - 0.5) * 15;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.5, // Reduced opacity for subtlety
            blending: THREE.AdditiveBlending,
        });

        this.particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particlesMesh);
    }

    createFloatingSpheres() {
        const sphereGeometry = new THREE.IcosahedronGeometry(0.3, 1);
        
        const sphereConfigs = [
            { color: 0x9333EA, position: [-3, 2, -3], scale: 1.0 },
            { color: 0xEC4899, position: [3, -2, -3], scale: 1.2 },
        ];

        sphereConfigs.forEach(config => {
            const material = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.1, // More subtle
                wireframe: true,
            });

            const sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.position.set(...config.position);
            sphere.scale.setScalar(config.scale);
            this.spheres.push(sphere);
            this.scene.add(sphere);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.0001;

        // Rotate particles very slowly for subtle effect
        if (this.particlesMesh) {
            this.particlesMesh.rotation.y = time * 0.3;
            this.particlesMesh.rotation.x = time * 0.2;
        }

        // Animate spheres slowly
        this.spheres.forEach((sphere, index) => {
            sphere.rotation.x += 0.005 * (index + 1);
            sphere.rotation.y += 0.005 * (index + 1);
            
            // Gentle floating motion
            sphere.position.y += Math.sin(time * 1.5 + index) * 0.001;
            sphere.position.x += Math.cos(time * 1 + index) * 0.001;
        });

        this.renderer.render(this.scene, this.camera);
    }

    setupResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HeroAnimation();
    });
} else {
    new HeroAnimation();
}
