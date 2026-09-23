// Utility for Web Audio API Chimes and SpeechSynthesis announcements

export class AudioService {
  private static audioCtx: AudioContext | null = null;

  private static getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays an airport/service counter ding-dong chime using Web Audio oscillators.
   */
  public static async playCounterChime(): Promise<void> {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note 1 (higher tone)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2 (middle tone)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, now + 0.25); // C5
      gain2.gain.setValueAtTime(0.3, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.85);

      // Note 3 (chime resolve)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.5); // G5
      gain3.gain.setValueAtTime(0.32, now + 0.5);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.5);
      osc3.stop(now + 1.2);
    } catch {
      // Audio playback might be restricted before first interaction
    }
  }

  /**
   * Speaks the ticket and counter announcement using browser SpeechSynthesis
   */
  public static speakAnnouncement(ticketNumber: string, counterName: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      // Split letter and digits for natural pronunciation (e.g., "A 101" instead of "A-dash-one-hundred-and-one")
      const formattedTicket = ticketNumber.replace('-', ' ');
      const message = `Attention please. Ticket number ${formattedTicket}, please proceed to ${counterName}.`;

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.92; // slightly slower for clear broadcast
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      // Prefer a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Small timeout to allow chime to play first
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 700);
    } catch {
      // Voice synthesis may be blocked or unavailable
    }
  }

  public static announceCall(ticketNumber: string, counterName: string): void {
    this.playCounterChime();
    this.speakAnnouncement(ticketNumber, counterName);
  }
}
