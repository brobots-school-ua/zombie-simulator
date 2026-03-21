// Procedural music generator using Web Audio API (no audio files needed)
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private menuNodes: AudioNode[] = [];
  private gameNodes: AudioNode[] = [];
  private menuActive = false;
  private gameActive = false;
  private beatInterval: number | null = null;
  private stingInterval: number | null = null;

  // Initialize AudioContext (must be called after user interaction)
  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
  }

  // Resume context if suspended (browser autoplay policy)
  async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // ===================== MENU MUSIC =====================
  startMenuMusic() {
    this.init();
    if (this.menuActive || !this.ctx) return;
    this.menuActive = true;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Master bus for menu
    const menuBus = ctx.createGain();
    menuBus.gain.setValueAtTime(0, now);
    menuBus.gain.linearRampToValueAtTime(0.6, now + 3); // fade in
    menuBus.connect(this.masterGain);
    this.menuNodes.push(menuBus);

    // Reverb using convolver (simple impulse)
    const convolver = this.createReverb(ctx, 3);
    convolver.connect(menuBus);
    this.menuNodes.push(convolver);

    // Dry path
    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.7;
    dryGain.connect(menuBus);

    // Wet path (reverb)
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.4;
    wetGain.connect(convolver);

    // === DRONE 1: Deep bass drone ===
    const drone1 = ctx.createOscillator();
    drone1.type = 'sawtooth';
    drone1.frequency.value = 55; // A1
    const drone1Filter = ctx.createBiquadFilter();
    drone1Filter.type = 'lowpass';
    drone1Filter.frequency.value = 120;
    drone1Filter.Q.value = 2;
    const drone1Gain = ctx.createGain();
    drone1Gain.gain.value = 0.25;
    drone1.connect(drone1Filter);
    drone1Filter.connect(drone1Gain);
    drone1Gain.connect(dryGain);
    drone1Gain.connect(wetGain);
    drone1.start(now);
    this.menuNodes.push(drone1, drone1Filter, drone1Gain);

    // LFO on drone frequency — slow wobble
    const lfo1 = ctx.createOscillator();
    lfo1.type = 'sine';
    lfo1.frequency.value = 0.15;
    const lfo1Gain = ctx.createGain();
    lfo1Gain.gain.value = 8;
    lfo1.connect(lfo1Gain);
    lfo1Gain.connect(drone1.frequency);
    lfo1.start(now);
    this.menuNodes.push(lfo1, lfo1Gain);

    // === DRONE 2: Dissonant fifth ===
    const drone2 = ctx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 82; // ~E2 (slightly detuned)
    const drone2Gain = ctx.createGain();
    drone2Gain.gain.value = 0.15;
    drone2.connect(drone2Gain);
    drone2Gain.connect(dryGain);
    drone2Gain.connect(wetGain);
    drone2.start(now);
    this.menuNodes.push(drone2, drone2Gain);

    // === DRONE 3: Sub-bass rumble ===
    const drone3 = ctx.createOscillator();
    drone3.type = 'sine';
    drone3.frequency.value = 36; // C1-ish
    const drone3Gain = ctx.createGain();
    drone3Gain.gain.value = 0.2;
    drone3.connect(drone3Gain);
    drone3Gain.connect(dryGain);
    drone3.start(now);
    this.menuNodes.push(drone3, drone3Gain);

    // === FILTERED NOISE (wind) ===
    const noiseBuffer = this.createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 400;
    noiseFilter.Q.value = 0.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dryGain);
    noiseGain.connect(wetGain);
    noise.start(now);
    this.menuNodes.push(noise, noiseFilter, noiseGain);

    // LFO on noise filter — sweeping wind
    const noiseLfo = ctx.createOscillator();
    noiseLfo.type = 'sine';
    noiseLfo.frequency.value = 0.07;
    const noiseLfoGain = ctx.createGain();
    noiseLfoGain.gain.value = 300;
    noiseLfo.connect(noiseLfoGain);
    noiseLfoGain.connect(noiseFilter.frequency);
    noiseLfo.start(now);
    this.menuNodes.push(noiseLfo, noiseLfoGain);

    // === EERIE STINGS (periodic high dissonant tones) ===
    this.stingInterval = window.setInterval(() => {
      if (!this.menuActive || !this.ctx) return;
      this.playMenuSting();
    }, 4000 + Math.random() * 6000);
  }

  private playMenuSting() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Random eerie frequency
    const freqs = [523, 698, 932, 1109, 1397, 1865];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.03, now + 0.8);
    gain.gain.linearRampToValueAtTime(0, now + 2.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 400;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 3);
  }

  stopMenuMusic(fadeTime = 1) {
    if (!this.menuActive || !this.ctx) return;
    this.menuActive = false;

    if (this.stingInterval !== null) {
      clearInterval(this.stingInterval);
      this.stingInterval = null;
    }

    const now = this.ctx.currentTime;

    // Fade out all menu nodes
    this.menuNodes.forEach(node => {
      if (node instanceof GainNode) {
        node.gain.linearRampToValueAtTime(0, now + fadeTime);
      }
    });

    // Cleanup after fade
    setTimeout(() => {
      this.menuNodes.forEach(node => {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          try { node.stop(); } catch { /* already stopped */ }
        }
        try { node.disconnect(); } catch { /* ok */ }
      });
      this.menuNodes = [];
    }, fadeTime * 1000 + 200);
  }

  // ===================== GAME MUSIC =====================
  startGameMusic() {
    this.init();
    if (this.gameActive || !this.ctx) return;
    this.gameActive = true;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Master bus for game music
    const gameBus = ctx.createGain();
    gameBus.gain.setValueAtTime(0, now);
    gameBus.gain.linearRampToValueAtTime(0.5, now + 2);
    gameBus.connect(this.masterGain);
    this.gameNodes.push(gameBus);

    // === BASS SYNTH (dark minor riff) ===
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.3;
    bassGain.connect(gameBus);
    this.gameNodes.push(bassGain);

    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 300;
    bassFilter.Q.value = 4;
    bassFilter.connect(bassGain);
    this.gameNodes.push(bassFilter);

    // Bass riff pattern (Am pentatonic: A2, C3, D3, E3, G3)
    const bassNotes = [110, 131, 147, 165, 196, 165, 147, 131];
    const bpm = 130;
    const stepTime = 60 / bpm;

    let bassStep = 0;
    this.beatInterval = window.setInterval(() => {
      if (!this.gameActive || !this.ctx) return;
      const t = this.ctx.currentTime;

      // Bass note
      const bassOsc = this.ctx.createOscillator();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.value = bassNotes[bassStep % bassNotes.length];
      const bassEnv = this.ctx.createGain();
      bassEnv.gain.setValueAtTime(0.35, t);
      bassEnv.gain.exponentialRampToValueAtTime(0.01, t + stepTime * 0.8);
      bassOsc.connect(bassEnv);
      bassEnv.connect(bassFilter);
      bassOsc.start(t);
      bassOsc.stop(t + stepTime);

      // Kick on beats 0, 2, 4, 6
      if (bassStep % 2 === 0) {
        this.playKick(t, gameBus);
      }

      // Hi-hat on every step
      this.playHiHat(t, gameBus);

      // Snare on beats 2, 6
      if (bassStep % 4 === 2) {
        this.playSnare(t, gameBus);
      }

      bassStep++;
    }, stepTime * 1000);

    // === PAD (sustained chord for atmosphere) ===
    const padNotes = [220, 261.6, 329.6]; // Am chord
    padNotes.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const padGain = ctx.createGain();
      padGain.gain.value = 0.06;
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 800;
      osc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(gameBus);
      osc.start(now);
      this.gameNodes.push(osc, padGain, padFilter);
    });
  }

  private playKick(time: number, dest: AudioNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playSnare(time: number, dest: AudioNode) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Noise burst
    const noiseBuffer = this.createNoiseBuffer(ctx, 0.15);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);

    // Body tone
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 180;
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playHiHat(time: number, dest: AudioNode) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const noiseBuffer = this.createNoiseBuffer(ctx, 0.05);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(time);
  }

  // Update intensity based on wave number
  updateIntensity(wave: number) {
    // Could be extended: higher waves = faster tempo, more layers
    // For now we adjust master volume slightly
    if (!this.ctx) return;
    const intensity = Math.min(0.4 + wave * 0.03, 0.8);
    this.masterGain.gain.linearRampToValueAtTime(intensity, this.ctx.currentTime + 1);
  }

  stopGameMusic(fadeTime = 2) {
    if (!this.gameActive || !this.ctx) return;
    this.gameActive = false;

    if (this.beatInterval !== null) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }

    const now = this.ctx.currentTime;
    this.gameNodes.forEach(node => {
      if (node instanceof GainNode) {
        node.gain.linearRampToValueAtTime(0, now + fadeTime);
      }
    });

    setTimeout(() => {
      this.gameNodes.forEach(node => {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          try { node.stop(); } catch { /* already stopped */ }
        }
        try { node.disconnect(); } catch { /* ok */ }
      });
      this.gameNodes = [];
    }, fadeTime * 1000 + 200);
  }

  // ===================== HELPERS =====================
  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createReverb(ctx: AudioContext, duration: number): ConvolverNode {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  // Cleanup everything
  destroy() {
    this.stopMenuMusic(0);
    this.stopGameMusic(0);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton instance — shared across all scenes
export const audioManager = new AudioManager();
