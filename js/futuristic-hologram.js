// Futuristic Holographic Display - Professional Audio-Reactive Visualization
// Sleek, sophisticated design for design professionals

class FuturisticHologram {
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
        this.time = 0;
        
        // Professional color scheme
        this.colors = {
            primary: { r: 0, g: 230, b: 255 },      // Cyan
            secondary: { r: 138, g: 43, b: 226 },   // Purple
            accent: { r: 255, g: 0, b: 128 },       // Magenta
            glow: { r: 100, g: 200, b: 255 }        // Light blue
        };
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
        
        // Setup audio
        this.setupAudio();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }
    
    setupAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.8;
        
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
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
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
        this.time += 0.01;
        
        // Get audio data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate energy
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += this.dataArray[i];
        }
        const avgEnergy = sum / this.bufferLength / 255;
        
        // Clear with dark background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Draw holographic grid
        this.drawHolographicGrid(centerX, centerY, avgEnergy);
        
        // Draw audio spectrum rings
        this.drawSpectrumRings(centerX, centerY, avgEnergy);
        
        // Draw hexagonal frame
        this.drawHexagonalFrame(centerX, centerY, avgEnergy);
        
        // Draw data streams
        this.drawDataStreams(centerX, centerY, avgEnergy);
        
        // Draw center core
        this.drawCore(centerX, centerY, avgEnergy);
        
        // Draw text hologram
        this.drawTextHologram(centerX, centerY, avgEnergy);
    }
    
    drawHolographicGrid(cx, cy, energy) {
        this.ctx.strokeStyle = `rgba(0, 230, 255, ${0.1 + energy * 0.15})`;
        this.ctx.lineWidth = 1;
        
        const gridSize = 40;
        const range = 600;
        
        // Vertical lines
        for (let x = -range; x <= range; x += gridSize) {
            const offset = Math.sin(this.time + x * 0.01) * 10;
            this.ctx.beginPath();
            this.ctx.moveTo(cx + x, cy - range + offset);
            this.ctx.lineTo(cx + x, cy + range + offset);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = -range; y <= range; y += gridSize) {
            const offset = Math.sin(this.time + y * 0.01) * 10;
            this.ctx.beginPath();
            this.ctx.moveTo(cx - range + offset, cy + y);
            this.ctx.lineTo(cx + range + offset, cy + y);
            this.ctx.stroke();
        }
    }
    
    drawSpectrumRings(cx, cy, energy) {
        const rings = 5;
        const baseRadius = 80;
        
        for (let ring = 0; ring < rings; ring++) {
            const radius = baseRadius + ring * 40;
            const segments = 60;
            
            for (let i = 0; i < segments; i++) {
                const dataIndex = Math.floor((i / segments) * this.bufferLength);
                const value = this.dataArray[dataIndex] / 255;
                const angle = (i / segments) * Math.PI * 2;
                const nextAngle = ((i + 1) / segments) * Math.PI * 2;
                
                const height = value * 30 * (1 + energy);
                const innerR = radius;
                const outerR = radius + height;
                
                const x1 = cx + Math.cos(angle) * innerR;
                const y1 = cy + Math.sin(angle) * innerR;
                const x2 = cx + Math.cos(nextAngle) * innerR;
                const y2 = cy + Math.sin(nextAngle) * innerR;
                const x3 = cx + Math.cos(nextAngle) * outerR;
                const y3 = cy + Math.sin(nextAngle) * outerR;
                const x4 = cx + Math.cos(angle) * outerR;
                const y4 = cy + Math.sin(angle) * outerR;
                
                const gradient = this.ctx.createLinearGradient(x1, y1, x4, y4);
                gradient.addColorStop(0, `rgba(0, 230, 255, ${value * 0.3})`);
                gradient.addColorStop(1, `rgba(138, 43, 226, ${value * 0.6})`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.lineTo(x3, y3);
                this.ctx.lineTo(x4, y4);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }
    
    drawHexagonalFrame(cx, cy, energy) {
        const sides = 6;
        const radius = 350 + Math.sin(this.time * 2) * 20;
        
        this.ctx.strokeStyle = `rgba(0, 230, 255, ${0.6 + energy * 0.4})`;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'rgba(0, 230, 255, 0.8)';
        
        this.ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        // Corner accents
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 15);
            gradient.addColorStop(0, `rgba(255, 0, 128, ${0.8 + energy * 0.2})`);
            gradient.addColorStop(1, 'rgba(255, 0, 128, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawDataStreams(cx, cy, energy) {
        const streams = 8;
        
        for (let s = 0; s < streams; s++) {
            const angle = (s / streams) * Math.PI * 2 + this.time * 0.5;
            const distance = 250;
            
            for (let i = 0; i < 20; i++) {
                const offset = i * 15 + this.time * 50;
                const x = cx + Math.cos(angle) * (distance + offset % 200);
                const y = cy + Math.sin(angle) * (distance + offset % 200);
                
                const alpha = 1 - (offset % 200) / 200;
                const size = 2 + energy * 3;
                
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 2);
                gradient.addColorStop(0, `rgba(0, 230, 255, ${alpha * 0.8})`);
                gradient.addColorStop(1, `rgba(0, 230, 255, 0)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawCore(cx, cy, energy) {
        const coreRadius = 50 + energy * 30;
        
        // Outer glow
        const glowGradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 3);
        glowGradient.addColorStop(0, `rgba(100, 200, 255, ${energy * 0.3})`);
        glowGradient.addColorStop(0.5, `rgba(138, 43, 226, ${energy * 0.2})`);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, coreRadius * 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Core
        const coreGradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 + energy * 0.2})`);
        coreGradient.addColorStop(0.5, `rgba(0, 230, 255, ${0.6 + energy * 0.4})`);
        coreGradient.addColorStop(1, `rgba(138, 43, 226, ${0.3 + energy * 0.3})`);
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.shadowBlur = 40;
        this.ctx.shadowColor = 'rgba(0, 230, 255, 1)';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawTextHologram(cx, cy, energy) {
        const text = 'KNOWLEDGE UNLOCKED';
        this.ctx.font = 'bold 24px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const y = cy + 420;
        
        // Glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'rgba(0, 230, 255, 0.8)';
        
        // Main text
        this.ctx.fillStyle = `rgba(0, 230, 255, ${0.8 + energy * 0.2})`;
        this.ctx.fillText(text, cx, y);
        
        // Underline
        this.ctx.strokeStyle = `rgba(138, 43, 226, ${0.6 + energy * 0.4})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 150, y + 20);
        this.ctx.lineTo(cx + 150, y + 20);
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        
        // Subtitle
        this.ctx.font = '16px "Courier New", monospace';
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + energy * 0.3})`;
        this.ctx.fillText('Your Journey Continues', cx, y + 50);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.futuristicHologram = new FuturisticHologram('thankYouThreeContainer', 'thankYouMusic');
    window.futuristicHologram.init();
});
