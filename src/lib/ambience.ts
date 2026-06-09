import type { MapHotspot, SceneMood } from '../types';

type MoodProfile = {
  /** Root drone frequency (Hz). */
  root: number;
  /** Low-pass cutoff for the noise bed (Hz). */
  cutoff: number;
  /** Noise bed level. */
  noise: number;
  /** Drone level. */
  drone: number;
  /** Slight detune for unease (cents). */
  detune: number;
};

type PlaceLevel = MapHotspot['level'];

type PlaceProfile = {
  frequency: number;
  cutoff: number;
  gain: number;
  detune: number;
};

const MOODS: Record<SceneMood, MoodProfile> = {
  calm: { root: 98, cutoff: 760, noise: 0.12, drone: 0.22, detune: 2 },
  tense: { root: 110, cutoff: 540, noise: 0.16, drone: 0.24, detune: 14 },
  descent: { root: 73, cutoff: 380, noise: 0.2, drone: 0.28, detune: 6 },
  secret: { root: 87, cutoff: 480, noise: 0.15, drone: 0.26, detune: 18 },
  danger: { root: 65, cutoff: 320, noise: 0.22, drone: 0.3, detune: 22 },
  hope: { root: 131, cutoff: 940, noise: 0.11, drone: 0.22, detune: 3 }
};

const PLACES: Record<PlaceLevel, PlaceProfile> = {
  surface: { frequency: 196, cutoff: 1800, gain: 0.035, detune: 3 },
  top: { frequency: 164, cutoff: 1200, gain: 0.03, detune: 4 },
  upper: { frequency: 142, cutoff: 980, gain: 0.034, detune: 5 },
  market: { frequency: 124, cutoff: 860, gain: 0.048, detune: 9 },
  middle: { frequency: 110, cutoff: 700, gain: 0.038, detune: 7 },
  lower: { frequency: 82, cutoff: 520, gain: 0.052, detune: 11 },
  engine: { frequency: 55, cutoff: 360, gain: 0.07, detune: 16 }
};

type AudioCtor = typeof AudioContext;

/**
 * A small procedural soundscape: a low detuned drone plus a filtered brown-noise
 * "water" bed, gently modulated, and re-tuned to match each scene's mood. No
 * audio files required.
 */
export class AmbienceEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private droneA: OscillatorNode | null = null;
  private droneB: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private placeOsc: OscillatorNode | null = null;
  private placeGain: GainNode | null = null;
  private placeFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private started = false;
  private volume = 0.8;
  private place: PlaceLevel = 'middle';

  private supported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext);
  }

  private ensure(): boolean {
    if (this.ctx) return true;
    if (!this.supported()) return false;
    try {
      const Ctor: AudioCtor =
        window.AudioContext || (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // A separate "breath" gain carries the slow LFO modulation, so the master
      // gain stays clean and can be brought to a true silence on fade-out.
      const breath = ctx.createGain();
      breath.gain.value = 1;
      breath.connect(master);

      // Drone
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.1;
      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 600;
      droneGain.connect(droneFilter);
      droneFilter.connect(breath);

      const droneA = ctx.createOscillator();
      droneA.type = 'sine';
      droneA.frequency.value = 98;
      const droneB = ctx.createOscillator();
      droneB.type = 'triangle';
      droneB.frequency.value = 147;
      droneB.detune.value = 6;
      droneA.connect(droneGain);
      droneB.connect(droneGain);

      // Noise bed (brown noise)
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i += 1) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 600;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.06;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(breath);

      // Place layer: a quiet resonant tone that distinguishes levels without
      // needing looped files. Mood owns the drama; place owns the room tone.
      const placeOsc = ctx.createOscillator();
      placeOsc.type = 'triangle';
      placeOsc.frequency.value = PLACES.middle.frequency;
      placeOsc.detune.value = PLACES.middle.detune;
      const placeFilter = ctx.createBiquadFilter();
      placeFilter.type = 'lowpass';
      placeFilter.frequency.value = PLACES.middle.cutoff;
      const placeGain = ctx.createGain();
      placeGain.gain.value = 0;
      placeOsc.connect(placeFilter);
      placeFilter.connect(placeGain);
      placeGain.connect(breath);

      // Slow breathing LFO on the breath gain (around 1.0), never the master.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.16;
      lfo.connect(lfoGain);
      lfoGain.connect(breath.gain);

      droneA.start();
      droneB.start();
      noise.start();
      placeOsc.start();
      lfo.start();

      this.ctx = ctx;
      this.master = master;
      this.droneA = droneA;
      this.droneB = droneB;
      this.droneGain = droneGain;
      this.noiseGain = noiseGain;
      this.noiseFilter = noiseFilter;
      this.placeOsc = placeOsc;
      this.placeGain = placeGain;
      this.placeFilter = placeFilter;
      this.lfo = lfo;
      this.started = true;
      this.setPlace(this.place);
      return true;
    } catch {
      return false;
    }
  }

  /** Must be called from a user gesture (e.g. clicking "Begin"). */
  resume(): void {
    if (!this.ensure() || !this.ctx) return;
    void this.ctx.resume().catch(() => undefined);
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  fadeIn(): void {
    if (!this.ensure() || !this.ctx || !this.master) return;
    void this.ctx.resume().catch(() => undefined);
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0.85 * this.volume, now, 0.9);
  }

  fadeOut(): void {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0, now, 0.6);
  }

  setMood(mood: SceneMood): void {
    if (!this.started || !this.ctx) return;
    const profile = MOODS[mood] ?? MOODS.calm;
    const now = this.ctx.currentTime;
    const ramp = 2.2;
    this.droneA?.frequency.setTargetAtTime(profile.root, now, ramp);
    this.droneB?.frequency.setTargetAtTime(profile.root * 1.5, now, ramp);
    this.droneB?.detune.setTargetAtTime(profile.detune, now, ramp);
    this.droneGain?.gain.setTargetAtTime(profile.drone, now, ramp);
    this.noiseFilter?.frequency.setTargetAtTime(profile.cutoff, now, ramp);
    this.noiseGain?.gain.setTargetAtTime(profile.noise, now, ramp);
  }

  setPlace(place: PlaceLevel): void {
    this.place = place;
    if (!this.started || !this.ctx) return;
    const profile = PLACES[place] ?? PLACES.middle;
    const now = this.ctx.currentTime;
    const ramp = 2.8;
    this.placeOsc?.frequency.setTargetAtTime(profile.frequency, now, ramp);
    this.placeOsc?.detune.setTargetAtTime(profile.detune, now, ramp);
    this.placeFilter?.frequency.setTargetAtTime(profile.cutoff, now, ramp);
    this.placeGain?.gain.setTargetAtTime(profile.gain, now, ramp);
  }

  dispose(): void {
    try {
      this.fadeOut();
      this.lfo?.stop();
      this.placeOsc?.stop();
      this.droneA?.stop();
      this.droneB?.stop();
      void this.ctx?.close();
    } catch {
      // ignore
    }
    this.ctx = null;
    this.started = false;
  }
}
