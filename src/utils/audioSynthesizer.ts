// Web Audio API + Server-Backed Hindi/Sanskrit Vocal TTS + Vedic Instrument Synthesizer
// Works reliably across Android Chrome, iOS Safari, Desktop Browsers, and Embedded Iframes

function splitHindiTextIntoChunks(rawText: string, maxChunkLength = 165): string[] {
  const cleaned = rawText
    .replace(/[*#_~`>|•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];
  if (cleaned.length <= maxChunkLength) return [cleaned];

  // Split by Devanagari danda (।, ॥) or standard sentence punctuation
  const sentences = cleaned.split(/(?<=[।॥.!?;\n])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).trim().length <= maxChunkLength) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);

      if (trimmed.length <= maxChunkLength) {
        current = trimmed;
      } else {
        // Further split long clause by comma or words
        const words = trimmed.split(/\s+/);
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= maxChunkLength) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w.slice(0, maxChunkLength);
          }
        }
        current = sub;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

class VedicAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private masterGain: GainNode | null = null;
  private melodyTimer: number | null = null;
  private chantTimer: number | null = null;

  private isPlaying = false;
  private currentFrequency = 432;
  private currentMantraText =
    'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्';
  private vocalEnabled = true;
  private masterVolume = 0.78;

  // Standalone speech / narration state ("आज का राशिफल सुनें", "बीज मंत्र सुनें", etc.)
  private activeSpeechId: string | null = null;
  private speechSessionToken = 0;
  private loopChantSessionToken = 0;
  private activeVoiceSource: AudioBufferSourceNode | null = null;
  private activeHtmlAudio: HTMLAudioElement | null = null;
  private decodedTtsCache = new Map<string, AudioBuffer>();

  private listeners: Array<(playing: boolean) => void> = [];
  private speechListeners: Array<(activeId: string | null) => void> = [];

  // Digital Mandir Ambient Flute & Soundscape state
  private isMandirAmbientPlaying = false;
  private mandirGain: GainNode | null = null;
  private mandirNodes: AudioNode[] = [];
  private mandirTimers: number[] = [];
  private mandirListeners: Array<(playing: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockOnFirstGesture = () => {
        this.ensureContext();
      };
      window.addEventListener('pointerdown', unlockOnFirstGesture, { passive: true });
      window.addEventListener('touchstart', unlockOnFirstGesture, { passive: true });
      window.addEventListener('click', unlockOnFirstGesture, { passive: true });

      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.getVoices();
        } catch {
          // ignore
        }
      }
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
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

  public subscribeSpeech(listener: (activeId: string | null) => void) {
    this.speechListeners.push(listener);
    listener(this.activeSpeechId);
    return () => {
      this.speechListeners = this.speechListeners.filter((l) => l !== listener);
    };
  }

  public getActiveSpeechId(): string | null {
    return this.activeSpeechId;
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

  private setActiveSpeechState(id: string | null) {
    this.activeSpeechId = id;
    this.speechListeners.forEach((l) => {
      try {
        l(this.activeSpeechId);
      } catch {
        // safe
      }
    });
  }

  public setVolume(vol: number) {
    try {
      this.masterVolume = Math.max(0.05, Math.min(1, vol));
      if (this.masterGain && this.ctx && this.ctx.state !== 'closed') {
        this.masterGain.gain.setTargetAtTime(this.masterVolume * 0.48, this.ctx.currentTime, 0.1);
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
      this.stopLoopChant();
    } else if (this.isPlaying && this.currentMantraText) {
      this.startVocalChantLoop(this.currentMantraText);
    }
  }

  public isVocalEnabled(): boolean {
    return this.vocalEnabled;
  }

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
        // ignore
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

  private stopVoicePlaybackResources() {
    if (this.activeVoiceSource) {
      try {
        this.activeVoiceSource.onended = null;
        this.activeVoiceSource.stop();
        this.activeVoiceSource.disconnect();
      } catch {
        // ignore
      }
      this.activeVoiceSource = null;
    }

    if (this.activeHtmlAudio) {
      try {
        this.activeHtmlAudio.pause();
        this.activeHtmlAudio.src = '';
      } catch {
        // ignore
      }
      this.activeHtmlAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  private stopLoopChant() {
    this.loopChantSessionToken++;
    if (this.chantTimer !== null) {
      window.clearTimeout(this.chantTimer);
      this.chantTimer = null;
    }
    if (!this.activeSpeechId) {
      this.stopVoicePlaybackResources();
    }
  }

  public stopSingleSpeech() {
    this.speechSessionToken++;
    this.stopVoicePlaybackResources();
    this.setActiveSpeechState(null);

    // Restore Tanpura volume if background track is playing
    if (this.isPlaying && this.masterGain && this.ctx && this.ctx.state !== 'closed') {
      try {
        this.masterGain.gain.setTargetAtTime(this.masterVolume * 0.48, this.ctx.currentTime, 0.2);
      } catch {
        // ignore
      }
    }
  }

  // Play a single short chunk (<180 chars) via /api/tts -> AudioContext.decodeAudioData -> fallback
  private async playSingleHindiChunk(chunk: string, isCancelled: () => boolean): Promise<void> {
    if (!chunk || isCancelled()) return;

    const ctx = this.ensureContext();

    // 1. Primary Method: Server /api/tts decoded through unlocked Web Audio API AudioContext
    if (ctx && ctx.state !== 'closed') {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        let audioBuffer = this.decodedTtsCache.get(chunk);
        if (!audioBuffer) {
          const response = await fetch(`/api/tts?text=${encodeURIComponent(chunk)}`);
          if (response.ok) {
            const arrBuf = await response.arrayBuffer();
            if (arrBuf && arrBuf.byteLength > 100) {
              audioBuffer = await ctx.decodeAudioData(arrBuf.slice(0));
              if (this.decodedTtsCache.size > 120) {
                const oldestKey = this.decodedTtsCache.keys().next().value;
                if (oldestKey) this.decodedTtsCache.delete(oldestKey);
              }
              this.decodedTtsCache.set(chunk, audioBuffer);
            }
          }
        }

        if (audioBuffer && !isCancelled()) {
          await new Promise<void>((resolve) => {
            if (isCancelled()) {
              resolve();
              return;
            }
            try {
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer!;

              const voiceGain = ctx.createGain();
              // Clear, loud voice volume
              voiceGain.gain.setValueAtTime(Math.min(1.35, this.masterVolume * 1.45), ctx.currentTime);

              source.connect(voiceGain);
              voiceGain.connect(ctx.destination);

              this.activeVoiceSource = source;
              source.onended = () => {
                if (this.activeVoiceSource === source) {
                  this.activeVoiceSource = null;
                }
                try {
                  source.disconnect();
                  voiceGain.disconnect();
                } catch {
                  // ignore
                }
                resolve();
              };

              source.start(0);
            } catch {
              resolve();
            }
          });
          return;
        }
      } catch {
        // Fall through to HTMLAudioElement / Web Speech fallback
      }
    }

    if (isCancelled()) return;

    // 2. Secondary Method: HTMLAudioElement streaming /api/tts directly
    try {
      const playedViaAudioTag = await new Promise<boolean>((resolve) => {
        if (isCancelled()) {
          resolve(true);
          return;
        }
        try {
          const audio = new Audio(`/api/tts?text=${encodeURIComponent(chunk)}`);
          audio.volume = Math.min(1, this.masterVolume + 0.2);
          this.activeHtmlAudio = audio;

          const cleanup = (ok: boolean) => {
            if (this.activeHtmlAudio === audio) {
              this.activeHtmlAudio = null;
            }
            resolve(ok);
          };

          audio.onended = () => cleanup(true);
          audio.onerror = () => cleanup(false);

          const playPromise = audio.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(() => cleanup(false));
          }
        } catch {
          resolve(false);
        }
      });

      if (playedViaAudioTag) return;
    } catch {
      // Fall through to native speechSynthesis
    }

    if (isCancelled()) return;

    // 3. Tertiary Fallback: Browser speechSynthesis (with Android Chrome cancel delay fix) + Melodic Swar
    await new Promise<void>((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.playVedicSwarPhrase(216);
        setTimeout(resolve, 1400);
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        // ignore
      }

      window.setTimeout(() => {
        if (isCancelled()) {
          resolve();
          return;
        }
        try {
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = 'hi-IN';
          utterance.rate = 0.9;
          utterance.pitch = 0.96;
          utterance.volume = Math.min(1, this.masterVolume + 0.2);

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

          let settled = false;
          const finish = () => {
            if (!settled) {
              settled = true;
              resolve();
            }
          };

          // Safety timeout in case mobile speechSynthesis never fires onend
          const safetyTimer = window.setTimeout(finish, Math.max(3000, chunk.length * 95));

          utterance.onend = () => {
            window.clearTimeout(safetyTimer);
            finish();
          };
          utterance.onerror = () => {
            window.clearTimeout(safetyTimer);
            this.playVedicSwarPhrase(216);
            window.setTimeout(finish, 1100);
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          this.playVedicSwarPhrase(216);
          window.setTimeout(resolve, 1200);
        }
      }, 65);
    });
  }

  // Play a pleasant 4-note Vedic Swar phrase when instrumental backup is needed
  private playVedicSwarPhrase(baseSa: number = 216) {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const ratios = [1, 1.26, 1.498, 2.0];
      ratios.forEach((r, idx) => {
        try {
          const start = ctx.currentTime + idx * 0.25;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseSa * r, start);

          gain.gain.setValueAtTime(0.001, start);
          gain.gain.linearRampToValueAtTime(0.22 * this.masterVolume, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.6);
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
  }

  private startVocalChantLoop(mantraText: string) {
    this.stopLoopChant();
    if (!this.vocalEnabled || !this.isPlaying) return;

    const myLoopToken = ++this.loopChantSessionToken;
    const chunks = splitHindiTextIntoChunks(mantraText, 165);
    if (chunks.length === 0) return;

    const runLoop = async () => {
      while (
        this.isPlaying &&
        this.vocalEnabled &&
        this.loopChantSessionToken === myLoopToken
      ) {
        // If user is currently listening to a standalone speech (e.g. Rashifal), wait briefly
        if (this.activeSpeechId !== null) {
          await new Promise((r) => window.setTimeout(r, 600));
          continue;
        }

        for (const chunk of chunks) {
          if (
            !this.isPlaying ||
            !this.vocalEnabled ||
            this.loopChantSessionToken !== myLoopToken ||
            this.activeSpeechId !== null
          ) {
            break;
          }
          await this.playSingleHindiChunk(
            chunk,
            () =>
              !this.isPlaying ||
              !this.vocalEnabled ||
              this.loopChantSessionToken !== myLoopToken ||
              this.activeSpeechId !== null
          );
        }

        if (
          !this.isPlaying ||
          !this.vocalEnabled ||
          this.loopChantSessionToken !== myLoopToken
        ) {
          break;
        }

        this.playTempleBell(0.35);
        await new Promise<void>((resolve) => {
          this.chantTimer = window.setTimeout(resolve, 1100);
        });
      }
    };

    runLoop().catch(() => {});
  }

  // Play full Vedic Tanpura + Raga Bansuri Melody + Temple Bell + Vocal Mantra Chanting
  public playTrack(frequency: number = 432, mantraText?: string) {
    try {
      this.clearActiveAudioNodes();
      this.stopLoopChant();

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
      this.playTempleBell(0.5);

      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.05, now);
      master.gain.linearRampToValueAtTime(this.masterVolume * 0.48, now + 0.5);
      master.connect(ctx.destination);
      this.masterGain = master;
      this.activeNodes.push(master);

      // Warm low-pass filter so Tanpura sounds rich and acoustic
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1150, now);
      filter.connect(master);
      this.activeNodes.push(filter);

      // Base frequency scaled to comfortable Indian Classical Sa (around 144Hz - 216Hz)
      const baseSa = frequency > 300 ? frequency / 2 : frequency;

      // 1. Continuous Tanpura Drone Layers (Kharaj Sa, Madhya Sa, Pancham Pa, Taar Sa)
      const droneHarmonics = [
        { freq: baseSa * 0.5, type: 'sine' as OscillatorType, gain: 0.36 },
        { freq: baseSa, type: 'triangle' as OscillatorType, gain: 0.30 },
        { freq: baseSa * 1.498, type: 'sine' as OscillatorType, gain: 0.24 }, // Pancham
        { freq: baseSa * 2, type: 'sine' as OscillatorType, gain: 0.16 },
      ];

      droneHarmonics.forEach(({ freq, type, gain }) => {
        try {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(freq, now);

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
          if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
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
    this.stopLoopChant();
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
  public playTempleBell(volumeScale: number = 0.7) {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const scheduleBell = () => {
        try {
          const now = ctx.currentTime;
          const bellFundamental = 784; // G5 resonant temple bell
          const overtones = [
            { ratio: 1.0, amp: 0.55, decay: 2.2 },
            { ratio: 2.0, amp: 0.38, decay: 1.6 },
            { ratio: 2.76, amp: 0.28, decay: 1.1 },
            { ratio: 4.07, amp: 0.16, decay: 0.7 },
            { ratio: 5.4, amp: 0.11, decay: 0.4 },
          ];

          overtones.forEach(({ ratio, amp, decay }) => {
            try {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();

              osc.type = 'sine';
              osc.frequency.setValueAtTime(bellFundamental * ratio, now);

              const peak = Math.min(1, amp * volumeScale * (this.masterVolume + 0.15));
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
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(scheduleBell).catch(scheduleBell);
      } else {
        scheduleBell();
      }
    } catch {
      // safe
    }
  }

  // 2. Soft Manjira / Ting-Sha Chime
  public playManjiraChime(volumeScale: number = 0.38) {
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

          const peak = (idx === 0 ? 0.24 : 0.14) * volumeScale * (this.masterVolume + 0.1);
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

  // 2b. Subtle UI Click Spark / Manjira Tap for Calendar & Tab interactions
  public playClickSpark(volumeScale: number = 0.25) {
    try {
      this.playManjiraChime(volumeScale);
    } catch {
      // safe
    }
  }

  // 3. Rudraksha Bead Click + Sacred Om Tone (माला मनका ध्वनि)
  public playBeadClick() {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const scheduleClick = () => {
        try {
          const now = ctx.currentTime;

          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.type = 'triangle';
          clickOsc.frequency.setValueAtTime(320, now);
          clickOsc.frequency.exponentialRampToValueAtTime(95, now + 0.045);

          clickGain.gain.setValueAtTime(0.5 * this.masterVolume, now);
          clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          clickOsc.connect(clickGain);
          clickGain.connect(ctx.destination);
          clickOsc.start(now);
          clickOsc.stop(now + 0.055);

          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(528, now);

          chimeGain.gain.setValueAtTime(0.22 * this.masterVolume, now);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(ctx.destination);
          chimeOsc.start(now);
          chimeOsc.stop(now + 0.38);
        } catch {
          // safe
        }
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(scheduleClick).catch(scheduleClick);
      } else {
        scheduleClick();
      }
    } catch {
      // safe
    }
  }

  // 4. Sacred Shankh Naad (शंख ध्वनि)
  public playShankh() {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const scheduleShankh = () => {
        try {
          const now = ctx.currentTime;
          const baseFreq = 392; // G4 resonant conch pitch
          const harmonics = [
            { mult: 1, weight: 0.48 },
            { mult: 2, weight: 0.32 },
            { mult: 3, weight: 0.16 },
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

              const peak = Math.min(1, weight * 0.55 * (this.masterVolume + 0.15));
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
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(scheduleShankh).catch(scheduleShankh);
      } else {
        scheduleShankh();
      }
    } catch {
      // safe
    }
  }

  // 4b. Crisp, High-Quality Temple Brass Bell Chime (विशेष मंदिर घंटी नाद)
  public playCrispTempleBell(volumeScale: number = 0.85) {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const schedule = () => {
        try {
          const now = ctx.currentTime;
          // Metallic clapper attack click
          const strikeOsc = ctx.createOscillator();
          const strikeGain = ctx.createGain();
          strikeOsc.type = 'triangle';
          strikeOsc.frequency.setValueAtTime(2600, now);
          strikeOsc.frequency.exponentialRampToValueAtTime(800, now + 0.03);
          strikeGain.gain.setValueAtTime(0.35 * volumeScale, now);
          strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          strikeOsc.connect(strikeGain);
          strikeGain.connect(ctx.destination);
          strikeOsc.start(now);
          strikeOsc.stop(now + 0.05);

          // Rich brass bell harmonic overtones (G5 fundamental with slight detune pairs for acoustic beating)
          const harmonics = [
            { freq: 784, amp: 0.65, decay: 3.4 }, // G5 fundamental
            { freq: 788, amp: 0.35, decay: 3.2 }, // Detuned pair for natural shimmer
            { freq: 1175, amp: 0.42, decay: 2.4 }, // D6 quint
            { freq: 1568, amp: 0.32, decay: 1.8 }, // G6 octave
            { freq: 2195, amp: 0.22, decay: 1.2 }, // High chime
            { freq: 3136, amp: 0.12, decay: 0.7 }, // Shimmer tierce
            { freq: 392, amp: 0.45, decay: 2.8 }, // Low body hum (G4)
          ];

          harmonics.forEach(({ freq, amp, decay }) => {
            try {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, now);

              const peak = Math.min(1, amp * volumeScale * (this.masterVolume + 0.18));
              gain.gain.setValueAtTime(0.001, now);
              gain.gain.linearRampToValueAtTime(peak, now + 0.012);
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
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(schedule).catch(schedule);
      } else {
        schedule();
      }
    } catch {
      // safe
    }
  }

  // 4c. Pushpanjali Flower Offering Chime (पुष्पांजलि समर्पण दिव्य ध्वनि)
  public playPushpanjaliSound(volumeScale: number = 0.5) {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const schedule = () => {
        try {
          const now = ctx.currentTime;
          // Celestial harp / chime arpeggio
          const notes = [1046.5, 1318.5, 1567.98, 2093]; // C6, E6, G6, C7
          notes.forEach((freq, idx) => {
            const noteTime = now + idx * 0.07;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            const peak = 0.24 * volumeScale * (this.masterVolume + 0.1);
            gain.gain.setValueAtTime(0.0001, noteTime);
            gain.gain.linearRampToValueAtTime(peak, noteTime + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.85);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.9);
          });
        } catch {
          // safe
        }
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(schedule).catch(schedule);
      } else {
        schedule();
      }
    } catch {
      // safe
    }
  }

  // 4d. Akhand Diya Light Sparkle & Warm Tone (दीपक प्रज्वलन पावन ध्वनि)
  public playDiyaLightSound(volumeScale: number = 0.55) {
    try {
      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') return;

      const schedule = () => {
        try {
          const now = ctx.currentTime;
          // Soft golden tone (528 Hz - Solfeggio Love/Healing frequency)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(528, now);

          const peak = 0.28 * volumeScale * (this.masterVolume + 0.15);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(peak, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.25);

          // Accompanying gentle high sparkle
          this.playManjiraChime(0.25);
        } catch {
          // safe
        }
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(schedule).catch(schedule);
      } else {
        schedule();
      }
    } catch {
      // safe
    }
  }

  // 4e. Dedicated Background Ambient Temple Flute & Om Drone (मंदिर बांसुरी व ॐ नाद)
  public startMandirAmbientFlute() {
    try {
      this.isMandirAmbientPlaying = true;
      this.notifyMandirListeners();

      this.mandirTimers.forEach((t) => window.clearTimeout(t));
      this.mandirTimers = [];

      const ctx = this.ensureContext();
      if (!ctx || ctx.state === 'closed') {
        this.isMandirAmbientPlaying = false;
        this.notifyMandirListeners();
        return;
      }

      const runStart = () => {
        try {
          if (!this.isMandirAmbientPlaying) return;

          const now = ctx.currentTime;
          const mandirMaster = ctx.createGain();
          mandirMaster.gain.setValueAtTime(0.001, now);
          mandirMaster.gain.linearRampToValueAtTime(0.48 * this.masterVolume, now + 0.8);
          mandirMaster.connect(ctx.destination);
          this.mandirGain = mandirMaster;
          this.mandirNodes.push(mandirMaster);

          // Warm Low-pass filter for rich temple ambiance (3200Hz allows full flute presence)
          const ambientFilter = ctx.createBiquadFilter();
          ambientFilter.type = 'lowpass';
          ambientFilter.frequency.setValueAtTime(3200, now);
          ambientFilter.connect(mandirMaster);
          this.mandirNodes.push(ambientFilter);

          // 1. Cosmic Om Fundamental Drone (136.1 Hz + Harmonics for mobile speaker clarity)
          const omFreq = 136.1;
          const omOsc1 = ctx.createOscillator(); // 136.1 Hz fundamental
          const omOsc2 = ctx.createOscillator(); // 272.2 Hz octave
          const omOsc3 = ctx.createOscillator(); // 408.3 Hz 3rd harmonic
          const omGain = ctx.createGain();

          omOsc1.type = 'sine';
          omOsc1.frequency.setValueAtTime(omFreq, now);

          omOsc2.type = 'triangle';
          omOsc2.frequency.setValueAtTime(omFreq * 2, now);

          omOsc3.type = 'sine';
          omOsc3.frequency.setValueAtTime(omFreq * 3, now);

          omGain.gain.setValueAtTime(0.22, now);

          // Meditative LFO breathing tremolo
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.15, now);
          lfoGain.gain.setValueAtTime(0.05, now);
          lfo.connect(omGain.gain);
          lfo.start(now);

          omOsc1.connect(omGain);
          omOsc2.connect(omGain);
          omOsc3.connect(omGain);
          omGain.connect(ambientFilter);

          omOsc1.start(now);
          omOsc2.start(now);
          omOsc3.start(now);

          this.mandirNodes.push(omOsc1, omOsc2, omOsc3, omGain, lfo, lfoGain);

          // 2. Procedural Soothing Bansuri Flute Phrases in Raag Bhupali (Sa, Re, Ga, Pa, Dha, Taar Sa)
          // Frequencies (Hz): 432, 486, 540, 648, 729, 864
          const fluteScale = [432, 486, 540, 648, 729, 864];
          const playFlutePhrase = () => {
            if (!this.isMandirAmbientPlaying || !this.mandirGain || !ctx || ctx.state === 'closed') return;
            try {
              const phraseLength = 3 + Math.floor(Math.random() * 3); // 3 to 5 notes
              const tNow = ctx.currentTime;
              let noteTime = tNow + 0.05;

              for (let i = 0; i < phraseLength; i++) {
                const notePitch = fluteScale[Math.floor(Math.random() * fluteScale.length)];
                const noteDur = 1.0 + Math.random() * 0.7;

                const fluteOsc = ctx.createOscillator();
                const fluteGain = ctx.createGain();
                const vibrato = ctx.createOscillator();
                const vibratoGain = ctx.createGain();

                fluteOsc.type = 'sine';
                fluteOsc.frequency.setValueAtTime(notePitch, noteTime);

                // Meend / gentle pitch glide
                if (i > 0 && Math.random() > 0.4) {
                  fluteOsc.frequency.linearRampToValueAtTime(
                    notePitch * (Math.random() > 0.5 ? 1.015 : 0.985),
                    noteTime + 0.25
                  );
                }

                // Vibrato (5.2 Hz gentle flute modulation)
                vibrato.frequency.setValueAtTime(5.2, noteTime);
                vibratoGain.gain.setValueAtTime(notePitch * 0.012, noteTime);
                vibrato.connect(fluteOsc.frequency);
                vibrato.start(noteTime);
                vibrato.stop(noteTime + noteDur + 0.2);

                // Flute envelope with linear ramps (safe across all browsers)
                fluteGain.gain.setValueAtTime(0.001, noteTime);
                fluteGain.gain.linearRampToValueAtTime(0.28, noteTime + 0.22);
                fluteGain.gain.linearRampToValueAtTime(0.001, noteTime + noteDur);

                fluteOsc.connect(fluteGain);
                fluteGain.connect(ambientFilter);

                fluteOsc.start(noteTime);
                fluteOsc.stop(noteTime + noteDur + 0.2);

                this.mandirNodes.push(fluteOsc, fluteGain, vibrato, vibratoGain);

                noteTime += noteDur * 0.82;
              }

              // Schedule next phrase after gentle pause (2.8 to 5.2s)
              const nextDelay = 2800 + Math.random() * 2400;
              const timerId = window.setTimeout(playFlutePhrase, nextDelay);
              this.mandirTimers.push(timerId);
            } catch {
              // safe
            }
          };

          // Start first phrase immediately
          const firstTimer = window.setTimeout(playFlutePhrase, 80);
          this.mandirTimers.push(firstTimer);
        } catch {
          this.isMandirAmbientPlaying = false;
          this.notifyMandirListeners();
        }
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(runStart).catch(runStart);
      } else {
        runStart();
      }
    } catch {
      this.isMandirAmbientPlaying = false;
      this.notifyMandirListeners();
    }
  }

  public stopMandirAmbientFlute() {
    try {
      this.mandirTimers.forEach((t) => window.clearTimeout(t));
      this.mandirTimers = [];

      if (this.mandirGain && this.ctx && this.ctx.state !== 'closed') {
        try {
          const now = this.ctx.currentTime;
          this.mandirGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
        } catch {
          // safe
        }
      }

      window.setTimeout(() => {
        this.mandirNodes.forEach((node) => {
          try {
            if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
              (node as AudioScheduledSourceNode).stop();
            }
            node.disconnect();
          } catch {
            // safe
          }
        });
        this.mandirNodes = [];
        this.mandirGain = null;
      }, 350);

      this.isMandirAmbientPlaying = false;
      this.notifyMandirListeners();
    } catch {
      this.isMandirAmbientPlaying = false;
      this.notifyMandirListeners();
    }
  }

  public toggleMandirAmbientFlute(forceState?: boolean): boolean {
    const target = forceState !== undefined ? forceState : !this.isMandirAmbientPlaying;
    if (target) {
      this.startMandirAmbientFlute();
    } else {
      this.stopMandirAmbientFlute();
    }
    return this.isMandirAmbientPlaying;
  }

  public isMandirAmbientActive(): boolean {
    return this.isMandirAmbientPlaying;
  }

  public subscribeMandirAmbient(listener: (playing: boolean) => void): () => void {
    this.mandirListeners.push(listener);
    listener(this.isMandirAmbientPlaying);
    return () => {
      this.mandirListeners = this.mandirListeners.filter((l) => l !== listener);
    };
  }

  private notifyMandirListeners() {
    this.mandirListeners.forEach((l) => {
      try {
        l(this.isMandirAmbientPlaying);
      } catch {
        // safe
      }
    });
  }

  // 5. Toggleable or one-shot Hindi/Sanskrit Speech Narration (Rashifal, Mantras, Shlokas, AI Answers)
  public toggleSpeakText(text: string, speechId: string, onEnd?: () => void) {
    if (this.activeSpeechId === speechId) {
      this.stopSingleSpeech();
      if (onEnd) onEnd();
      return;
    }
    this.speakMantraOnce(text, onEnd, speechId);
  }

  public speakVedicText(text: string, speechId: string = 'default-speech', onEnd?: () => void) {
    this.speakMantraOnce(text, onEnd, speechId);
  }

  public speakMantraOnce(mantraText: string, onEnd?: () => void, speechId: string = 'default-speech') {
    try {
      this.ensureContext();
      this.stopVoicePlaybackResources();

      const myToken = ++this.speechSessionToken;
      this.setActiveSpeechState(speechId);

      // Temporarily duck background Tanpura so speech is crystal clear
      if (this.isPlaying && this.masterGain && this.ctx && this.ctx.state !== 'closed') {
        try {
          this.masterGain.gain.setTargetAtTime(this.masterVolume * 0.14, this.ctx.currentTime, 0.1);
        } catch {
          // ignore
        }
      }

      const chunks = splitHindiTextIntoChunks(mantraText, 165);
      if (chunks.length === 0) {
        this.setActiveSpeechState(null);
        if (onEnd) onEnd();
        return;
      }

      const runSequence = async () => {
        for (const chunk of chunks) {
          if (this.speechSessionToken !== myToken) break;
          await this.playSingleHindiChunk(chunk, () => this.speechSessionToken !== myToken);
        }

        if (this.speechSessionToken === myToken) {
          this.setActiveSpeechState(null);
          if (this.isPlaying && this.masterGain && this.ctx && this.ctx.state !== 'closed') {
            try {
              this.masterGain.gain.setTargetAtTime(
                this.masterVolume * 0.48,
                this.ctx.currentTime,
                0.2
              );
            } catch {
              // ignore
            }
          }
          if (onEnd) onEnd();
        }
      };

      runSequence().catch(() => {
        if (this.speechSessionToken === myToken) {
          this.setActiveSpeechState(null);
          if (onEnd) onEnd();
        }
      });
    } catch {
      this.setActiveSpeechState(null);
      if (onEnd) window.setTimeout(onEnd, 800);
    }
  }
}

export const vedicAudio = new VedicAudioEngine();
