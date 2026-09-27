export const speakAnnouncement = (text: string, lang: 'en' | 'ta' = 'en') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.log('[VOICE GUIDANCE]', text);
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('[VOICE GUIDANCE ERROR]', e);
  }
};
