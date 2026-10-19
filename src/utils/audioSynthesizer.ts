// Web Audio API + Vocal Mantra Chanting Engine for Pandit Ji Online (Safe & Crash-Proof)
class VedicAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private masterGain: GainNode | null = null;
  private melodyTimer: number | null = null;
  private chantTimer: number | null = null;
  private isPlaying = false;
  private currentFrequency = 432;
  private currentMantraText = 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्';
  private vocalEnabled = true;
  private masterVolume = 0.65;
  private listeners: Array<(playing: boolean) => void> = [];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      // If previous context was closed by OS or sleep mode, discard it
      if (this.ctx && this.ctx.state === 'closed') {
        this.ctx = null;
      }

      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      return this.ctx;
    } catch (e) {
      console.warn('Web Audio Context initialization warning:', e);
      return null;
    }
  }

  public subscribe(listener: (playing: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => {
      try {
        l(this.isPlaying);
      } catch {
        // safe
      }
    });
  }

  public setVolume(vol: number) {
    try {
      this.masterVolume = Math.max(0.05, Math.min(1, vol));
      if (this.masterGain && this.ctx && this.ctx.state !== 'closed') {
        this.masterGain.gain.setTargetAtTime(this.masterVolume * 0.45, this.ctx.currentTime, 0.1);
      }
    } catch {
      // safe
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setVocalEnabled(enabled: boolean) {
    this.vocalEnabled = enabled;
    if (!enabled) {
      this.stopSpeech();
    } else if (this.isPlaying && this.currentMantraText) {
      this.startVocalChantLoop(this.currentMantraText);
    }
  }

  public isVocalEnabled(): boolean {
    return this.vocalEnabled;
  }

  // Stop current nodes synchronously and cleanly without exceptions
  private clearActiveAudioNodes() {
    if (this.melodyTimer !== null) {
      window.clearInterval(this.melodyTimer);
      this.melodyTimer = null;
    }
    if (this.chantTimer !== null) {
      window.clearTimeout(this.chantTimer);
      this.chantTimer = null;
    }

    const oldOscs = [...this.activeOscillators];
    const oldNodes = [...this.activeNodes];
    this.activeOscillators = [];
    this.activeNodes = [];
    this.masterGain = null;

    oldOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore already stopped
      }
    });

    oldNodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    });
  }

  private stopSpeech() {
    if (this.chantTimer !== null) {
      window.clearTimeout(this.chantTimer);
      this.chantTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  private startVocalChantLoop(mantraText: string) {
    this.stopSpeech();
    if (!this.vocalEnabled || !this.isPlaying) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const speakNext = () => {
      if (!this.isPlaying || !this.vocalEnabled) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(mantraText);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.82;
        utterance.pitch = 0.92;
        utterance.volume = Math.min(1, this.masterVolume + 0.2);

        // Select Hindi or Indian voice if available
        try {
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const hindiVoice =
              voices.find((v) => v.lang && (v.lang.includes('hi') || v.lang.includes('sa'))) ||
              voices.find((v) => v.lang && v.lang.includes('IN'));
            if (hindiVoice) {
              utterance.voice = hindiVoice;
            }
          }
        } catch {
          // ignore voice lookup failure
        }

        utterance.onend = () => {
          if (this.isPlaying && this.vocalEnabled) {
            this.chantTimer = window.setTimeout(() => {
              if (this.isPlaying && this.vocalEnabled) {
                this.playTempleBell(0.35);
                speakNext();
              }
            }, 1200);
          }
        };

        utterance.onerror = () => {
          // If speech synthesis fails, continue instrumental without crashing
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis warning:', err);
      }
    };

    speakNext();
  }

  // Play full Vedic Tanpura + Raga Bansuri Melody + Temple Bell + Vocal Mantra Chanting
  public playTrack(frequency: number = 432, mantraText?: string) {
    try {
      this.clearActiveAudioNodes();
      this.stopSpeech();

      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') {
        this.isPlaying = false;
        this.notifyListeners();
        return;
      }

      this.currentFrequency = frequency;
      if (mantraText) {
        this.currentMantraText = mantraText;
      }
      this.isPlaying = true;
      this.notifyListeners();

      // Ring an auspicious temple bell when starting
      this.playTempleBell(0.45);

      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.05, now);
      master.gain.linearRampToValueAtTime(this.masterVolume * 0.45, now + 0.6);
      master.connect(ctx.destination);
      this.masterGain = master;
      this.activeNodes.push(master);

      // Warm low-pass filter so Tanpura sounds rich and acoustic
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.connect(master);
      this.activeNodes.push(filter);

      // Base frequency scaled to comfortable Indian Classical Sa (around 144Hz - 216Hz)
      const baseSa = frequency > 300 ? frequency / 2 : frequency;

      // 1. Continuous Tanpura Drone Layers (Kharaj Sa, Madhya Sa, Pancham Pa, Taar Sa)
      const droneHarmonics = [
        { freq: baseSa * 0.5, type: 'sine' as OscillatorType, gain: 0.35 },
        { freq: baseSa, type: 'triangle' as OscillatorType, gain: 0.30 },
        { freq: baseSa * 1.498, type: 'sine' as OscillatorType, gain: 0.22 }, // Pancham
        { freq: baseSa * 2, type: 'sine' as OscillatorType, gain: 0.15 },
      ];

      droneHarmonics.forEach(({ freq, type, gain }) => {
        try {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(freq, now);

          // Gentle breathing LFO for realistic Tanpura plucking shimmer
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.18 + Math.random() * 0.08, now);
          lfoGain.gain.setValueAtTime(gain * 0.25, now);
          lfo.connect(oscGain.gain);
          lfo.start(now);

          oscGain.gain.setValueAtTime(gain, now);
          osc.connect(oscGain);
          oscGain.connect(filter);
          osc.start(now);

          this.activeOscillators.push(osc, lfo);
          this.activeNodes.push(oscGain, lfoGain);
        } catch {
          // ignore single harmonic error
        }
      });

      // 2. Melodic Vedic Raga Swar Sequence (Sa, Re, Ga, Pa, Dha, Sa) played periodically
      const ragaRatios = [1, 1.122, 1.26, 1.498, 1.682, 2.0, 1.682, 1.498, 1.26, 1.122];
      let stepIndex = 0;

      const playSwarNote = () => {
        try {
          if (!this.isPlaying || !this.ctx || !this.masterGain) return;
          if (this.ctx.state === 'closed') return;
          const t = this.ctx.currentTime;
          const ratio = ragaRatios[stepIndex % ragaRatios.length];
          const noteFreq = baseSa * ratio;

          const noteOsc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();

          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(noteFreq, t);

          noteGain.gain.setValueAtTime(0.001, t);
          noteGain.gain.linearRampToValueAtTime(0.28, t + 0.18);
          noteGain.gain.exponentialRampToValueAtTime(0.001, t + 1.35);

          noteOsc.connect(noteGain);
          noteGain.connect(this.masterGain);

          noteOsc.start(t);
          noteOsc.stop(t + 1.4);

          // Every 4th note, ring a soft Manjira chime
          if (stepIndex % 4 === 0) {
            this.playManjiraChime(0.18);
          }

          stepIndex++;
        } catch {
          // safe
        }
      };

      playSwarNote();
      this.melodyTimer = window.setInterval(playSwarNote, 1450);

      // 3. Start Vocal Mantra Chanting if enabled
      if (this.vocalEnabled && this.currentMantraText) {
        this.startVocalChantLoop(this.currentMantraText);
      }
    } catch (err) {
      console.warn('Error starting Vedic audio track:', err);
      this.stop();
    }
  }

  public stop() {
    this.isPlaying = false;
    this.clearActiveAudioNodes();
    this.stopSpeech();
    this.notifyListeners();
  }

  public toggle(frequency: number = 432, mantraText?: string): boolean {
    try {
      if (this.isPlaying) {
        this.stop();
        return false;
      } else {
        this.playTrack(frequency, mantraText);
        return this.isPlaying;
      }
    } catch (err) {
      console.warn('Error toggling Vedic audio:', err);
      this.stop();
      return false;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  // --- Interactive Sound Effects for Mantra Jaap Counter & Temple Experience ---

  // 1. Authentic Brass Temple Bell (मंदिर की घंटी)
  public playTempleBell(volumeScale: number = 0.65) {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const now = ctx.currentTime;
      const bellFundamental = 784; // G5 resonant temple bell
      const overtones = [
        { ratio: 1.0, amp: 0.5, decay: 2.2 },
        { ratio: 2.0, amp: 0.35, decay: 1.6 },
        { ratio: 2.76, amp: 0.25, decay: 1.1 },
        { ratio: 4.07, amp: 0.15, decay: 0.7 },
        { ratio: 5.4, amp: 0.1, decay: 0.4 },
      ];

      overtones.forEach(({ ratio, amp, decay }) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(bellFundamental * ratio, now);

          const peak = amp * volumeScale * this.masterVolume;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(peak, now + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + decay + 0.05);
        } catch {
          // safe
        }
      });
    } catch {
      // safe
    }
  }

  // 2. Soft Manjira / Ting-Sha Chime
  public playManjiraChime(volumeScale: number = 0.35) {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const now = ctx.currentTime;
      [2093, 3136].forEach((freq, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          const peak = (idx === 0 ? 0.22 : 0.12) * volumeScale * this.masterVolume;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(peak, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.8);
        } catch {
          // safe
        }
      });
    } catch {
      // safe
    }
  }

  // 3. Rudraksha Bead Click + Sacred Om Tone (माला मनका ध्वनि)
  public playBeadClick() {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const now = ctx.currentTime;

      // Wood bead click impulse
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(320, now);
      clickOsc.frequency.exponentialRampToValueAtTime(95, now + 0.045);

      clickGain.gain.setValueAtTime(0.45 * this.masterVolume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.055);

      // Gentle sacred harmonic chime (528 Hz)
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(528, now);

      chimeGain.gain.setValueAtTime(0.18 * this.masterVolume, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now);
      chimeOsc.stop(now + 0.38);
    } catch {
      // safe
    }
  }

  // 4. Sacred Shankh Naad (शंख ध्वनि)
  public playShankh() {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const now = ctx.currentTime;
      const baseFreq = 392; // G4 resonant conch pitch
      const harmonics = [
        { mult: 1, weight: 0.45 },
        { mult: 2, weight: 0.3 },
        { mult: 3, weight: 0.15 },
      ];

      harmonics.forEach(({ mult, weight }) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = mult === 1 ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(baseFreq * mult * 0.94, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * mult, now + 0.35);
          osc.frequency.setValueAtTime(baseFreq * mult, now + 2.0);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * mult * 0.96, now + 2.7);

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(baseFreq * mult, now);
          filter.Q.setValueAtTime(4.5, now);

          const peak = weight * 0.5 * this.masterVolume;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(peak, now + 0.4);
          gain.gain.setValueAtTime(peak, now + 1.9);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 2.85);
        } catch {
          // safe
        }
      });
    } catch {
      // safe
    }
  }

  // 5. Speak a single mantra repetition aloud
  public speakMantraOnce(mantraText: string, onEnd?: () => void) {
    try {
      this.ensureContext();
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.playTempleBell(0.45);
        if (onEnd) setTimeout(onEnd, 1200);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(mantraText);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.88;
      utterance.pitch = 0.95;
      utterance.volume = Math.min(1, this.masterVolume + 0.25);

      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const hindiVoice =
            voices.find((v) => v.lang && (v.lang.includes('hi') || v.lang.includes('sa'))) ||
            voices.find((v) => v.lang && v.lang.includes('IN'));
          if (hindiVoice) {
            utterance.voice = hindiVoice;
          }
        }
      } catch {
        // ignore
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) setTimeout(onEnd, 1000);
    }
  }
}

export const vedicAudio = new VedicAudioEngine();
