// ⚡ CYBER EFFECTS - PARTICLE SYSTEM ⚡

class CyberEffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.effectsEnabled = true;
    }
    
    createFoodParticles(x, y, color = '#ff00ff') {
        if (!this.effectsEnabled) return;
        
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1.0,
                decay: 0.02,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    }
    
    createLevelUpParticles() {
        if (!this.effectsEnabled) return;
        
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                decay: 0.01,
                color: '#00f3ff',
                size: Math.random() * 4 + 2
            });
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity/friction
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            // Update life
            p.life -= p.decay;
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render() {
        this.ctx.save();
        
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    clear() {
        this.particles = [];
    }
    
    toggle() {
        this.effectsEnabled = !this.effectsEnabled;
        return this.effectsEnabled;
    }
}

// Export for use in game.js
window.CyberEffects = CyberEffects;