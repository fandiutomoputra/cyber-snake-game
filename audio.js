// ⚡ CYBER SNAKE AUDIO MANAGER ⚡

class CyberAudio {
    constructor() {
        this.audioEnabled = false;
        this.sounds = {};
        this.init();
    }
    
    init() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Initialize sounds
        this.createSounds();
        
        // Check if audio is supported
        if (!this.audioContext) {
            console.warn('Web Audio API not supported');
            this.audioEnabled = false;
        } else {
            this.audioEnabled = true;
        }
    }
    
    createSounds() {
        // Food collection sound (beep)
        this.sounds.food = this.createBeepSound(800, 0.1);
        
        // Game over sound (low beep)
        this.sounds.gameOver = this.createBeepSound(300, 0.3);
        
        // Level up sound (rising tone)
        this.sounds.levelUp = this.createRisingTone();
        
        // Move sound (short click)
        this.sounds.move = this.createBeepSound(100, 0.05);
    }
    
    createBeepSound(frequency, duration) {
        return {
            frequency: frequency,
            duration: duration,
            play: () => {
                if (!this.audioEnabled) return;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }
        };
    }
    
    createRisingTone() {
        return {
            play: () => {
                if (!this.audioEnabled) return;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
                
                oscillator.type = 'sawtooth';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
            }
        };
    }
    
    playFoodSound() {
        if (this.sounds.food) this.sounds.food.play();
    }
    
    playGameOverSound() {
        if (this.sounds.gameOver) this.sounds.gameOver.play();
    }
    
    playLevelUpSound() {
        if (this.sounds.levelUp) this.sounds.levelUp.play();
    }
    
    playMoveSound() {
        if (this.sounds.move) this.sounds.move.play();
    }
    
    toggle() {
        this.audioEnabled = !this.audioEnabled;
        
        if (this.audioEnabled && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        return this.audioEnabled;
    }
}

// Export for use in game.js
window.CyberAudio = CyberAudio;