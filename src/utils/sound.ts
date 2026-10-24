// Web Audio API synthesizer for authentic Vedic temple bells, shankh, and mantra drone

let audioCtx: AudioContext | null = null;
let mantraOsc: OscillatorNode | null = null;
let mantraGain: GainNode | null = null;
let isMantraPlaying = false;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const playTempleBell = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [528, 1056, 1584, 2112];
  const gains = [0.35, 0.2, 0.12, 0.06];

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gains[idx], now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6 - idx * 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.7);
  });
};

export const playShankhSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const baseFreq = 396;
  [1, 1.5, 2].forEach((mult, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === 0 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(baseFreq * mult * 0.92, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * mult, now + 0.4);
    osc.frequency.setValueAtTime(baseFreq * mult, now + 2.0);
    osc.frequency.linearRampToValueAtTime(baseFreq * mult * 0.96, now + 2.8);

    const maxGain = idx === 0 ? 0.14 : 0.08;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(maxGain, now + 0.45);
    gain.gain.setValueAtTime(maxGain, now + 2.0);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 3.0);
  });
};

export const playBeadClick = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(330, now + 0.08);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
};

export const toggleMantraDrone = (): boolean => {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (isMantraPlaying) {
    if (mantraGain && ctx) {
      mantraGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    }
    setTimeout(() => {
      try {
        mantraOsc?.stop();
        mantraOsc?.disconnect();
      } catch {
        // ignore
      }
      mantraOsc = null;
      mantraGain = null;
    }, 320);
    isMantraPlaying = false;
    return false;
  } else {
    const now = ctx.currentTime;
    mantraOsc = ctx.createOscillator();
    mantraGain = ctx.createGain();
    // 136.1 Hz is the cosmic Om (Sadhana) frequency
    mantraOsc.type = 'sine';
    mantraOsc.frequency.setValueAtTime(136.1, now);

    mantraGain.gain.setValueAtTime(0.001, now);
    mantraGain.gain.linearRampToValueAtTime(0.08, now + 0.5);

    mantraOsc.connect(mantraGain);
    mantraGain.connect(ctx.destination);
    mantraOsc.start(now);
    isMantraPlaying = true;
    playTempleBell();
    return true;
  }
};

export const speakHindiText = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    playTempleBell();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
};
