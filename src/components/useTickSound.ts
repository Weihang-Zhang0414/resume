import { useCallback, useRef, useEffect } from 'react';

export type SoundType = 'clock' | 'water' | 'typewriter' | 'paper' | 'scifi' | 'wood' | 'bubble' | 'chime' | 'click' | 'none';

export const useTickSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Pre-create AudioContext on first ANY interaction so it's ready immediately.
    // Wheel events ARE valid user gestures in modern browsers.
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Non-blocking resume; we await properly in playSound
      audioCtxRef.current.resume().catch(() => {});
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);
    window.addEventListener('wheel', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('wheel', initAudio);
    };
  }, []);

  const playSound = useCallback(async (type: SoundType | undefined) => {
    if (!type || type === 'none') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      // Always await resume so AudioContext is guaranteed running before scheduling
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const t = ctx.currentTime;
      
      if (type === 'clock') {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(6000, t);
        osc1.frequency.exponentialRampToValueAtTime(500, t + 0.015);
        gain1.gain.setValueAtTime(0.6, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.015);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1000, t);
        osc2.frequency.exponentialRampToValueAtTime(200, t + 0.02);
        gain2.gain.setValueAtTime(0.4, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.02);
      } 
      else if (type === 'water') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      }
      else if (type === 'typewriter') {
        const bufferSize = ctx.sampleRate * 0.02; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noiseSource.start(t);
      }
      else if (type === 'scifi') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3000, t);
        osc.frequency.setValueAtTime(2000, t + 0.01);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.setValueAtTime(0.3, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
      }
      else if (type === 'wood') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
      }
      else if (type === 'paper') {
        const bufferSize = ctx.sampleRate * 0.06;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1.0;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.6, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noiseSource.start(t);
      }
      else if (type === 'bubble') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.6, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
      }
      else if (type === 'chime') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(1200, t);
        osc2.frequency.setValueAtTime(1600, t);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.3);
        osc2.stop(t + 0.3);
      }
      else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3000, t);
        osc.frequency.exponentialRampToValueAtTime(1000, t + 0.01);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.01);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.01);
      }

    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  return playSound;
};
