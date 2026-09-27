export class VoiceGuidanceService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static enabled = true;

  public static speak(text: string, language: 'en' | 'ta' = 'en') {
    if (!this.synth || !this.enabled) return;

    // Cancel any active speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    if (language === 'ta') {
      const tamilVoice = voices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (tamilVoice) utterance.voice = tamilVoice;
      utterance.lang = 'ta-IN';
    } else {
      const englishVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US'));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.lang = 'en-IN';
    }

    this.synth.speak(utterance);
  }

  public static announceStopAlert(stopName: string, stopsRemaining: number, language: 'en' | 'ta' = 'en') {
    if (stopsRemaining === 0) {
      const msg = language === 'ta'
        ? `உங்கள் இறங்கும் இடம் ${stopName} வந்துவிட்டது. பேருந்தில் இருந்து இறங்கத் தயாராகுங்கள்.`
        : `Your destination ${stopName} has been reached. Please prepare to get down.`;
      this.speak(msg, language);
    } else {
      const msg = language === 'ta'
        ? `அடுத்த ${stopsRemaining} நிறுத்தங்களில் நீங்கள் இறங்கும் இடம் ${stopName} வரவுள்ளது.`
        : `${stopsRemaining} stops remaining until your destination ${stopName}.`;
      this.speak(msg, language);
    }
  }

  public static toggleVoice(enable: boolean) {
    this.enabled = enable;
    if (!enable && this.synth) {
      this.synth.cancel();
    }
  }
}
