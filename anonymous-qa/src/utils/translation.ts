/**
 * Simple translation utility using MyMemory API (free tier)
 * https://mymemory.translated.net/doc/spec.php
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'te-en', name: 'Telugu (Romanized)', target: 'en', source: 'te' },
  { code: 'ta-en', name: 'Tamil (Romanized)', target: 'en', source: 'ta' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
];

export async function translateText(text: string, targetLang: string, sourceLang: string = 'autodetect'): Promise<string> {
  if (!text.trim()) return text;
  
  let textToTranslate = text;

  // For Romanized languages, try to transliterate to native script first for better translation
  if (sourceLang === 'te' && targetLang === 'en' && /^[a-zA-Z\s.,!?']+$/.test(text)) {
    try {
      const resp = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=te-t-i0-und&num=1`);
      const data = await resp.json();
      if (data[0] === 'SUCCESS') {
        textToTranslate = data[1][0][1][0];
      }
    } catch (e) {
      console.error('Telugu transliteration failed:', e);
    }
  } else if (sourceLang === 'ta' && targetLang === 'en' && /^[a-zA-Z\s.,!?']+$/.test(text)) {
    try {
      const resp = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ta-t-i0-und&num=1`);
      const data = await resp.json();
      if (data[0] === 'SUCCESS') {
        textToTranslate = data[1][0][1][0];
      }
    } catch (e) {
      console.error('Tamil transliteration failed:', e);
    }
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${sourceLang}|${targetLang}&mt=1`
    );
    
    if (!response.ok) throw new Error('Translation failed');
    
    const data = await response.json();
    let translated = data.responseData?.translatedText || textToTranslate;
    
    // Simple HTML entity decoding for common cases or via a temporary element
    if (typeof document !== 'undefined') {
      const txt = document.createElement("textarea");
      txt.innerHTML = translated;
      translated = txt.value;
    }
    
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}
