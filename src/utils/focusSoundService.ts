/**
 * Focus Sound Service for Distraction-Free Document Writing Mode
 * Synthesizes procedural ambient sounds using Web Audio API without external assets.
 */

type SoundType = 'off' | 'rain' | 'forest' | 'waves' | 'binaural' | 'whitenoise';

class FocusSoundService {
  private ctx: AudioContext | null = null;
  private currentType: SoundType = 'off';
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getCurrentType(): SoundType {
    return this.currentType;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else if (node && typeof (node as any).stop === 'function') {
        try {
          (node as any).stop();
        } catch (e) {}
      } else if (node && typeof (node as any).disconnect === 'function') {
        try {
          (node as any).disconnect();
        } catch (e) {}
      }
    });
    this.activeNodes = [];
    this.currentType = 'off';
  }

  public playSound(type: SoundType) {
    this.stop();
    if (type === 'off') return;

    this.initContext();
    if (!this.ctx) return;

    this.currentType = type;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'rain') {
      this.createRainSound();
    } else if (type === 'forest') {
      this.createForestWindSound();
    } else if (type === 'waves') {
      this.createOceanWavesSound();
    } else if (type === 'binaural') {
      this.createBinauralAlphaSound();
    } else if (type === 'whitenoise') {
      this.createWhiteNoiseSound();
    }
  }

  private createWhiteNoiseSound() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  private createRainSound() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Pink-ish noise
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const pinkNoise = this.ctx.createBufferSource();
    pinkNoise.buffer = noiseBuffer;
    pinkNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    pinkNoise.connect(filter);
    filter.connect(this.gainNode);
    pinkNoise.start();

    this.activeNodes.push(pinkNoise, filter);
  }

  private createOceanWavesSound() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    // LFO for wave ebb and flow
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(this.gainNode);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, filter, lfo, lfoGain);
  }

  private createForestWindSound() {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc.connect(filter);
    filter.connect(this.gainNode);
    osc.start();
    lfo.start();

    this.activeNodes.push(osc, filter, lfo, lfoGain);
  }

  private createBinauralAlphaSound() {
    if (!this.ctx || !this.gainNode) return;
    // 10 Hz Alpha wave difference (200Hz and 210Hz)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(210, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    osc1.connect(merger, 0, 0);
    osc2.connect(merger, 0, 1);

    merger.connect(this.gainNode);
    osc1.start();
    osc2.start();

    this.activeNodes.push(osc1, osc2, merger);
  }
}

export const focusSoundService = new FocusSoundService();
export type { SoundType };
