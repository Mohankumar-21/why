/**
 * Simple translation utility using MyMemory API (free tier)
 * https://mymemory.translated.net/doc/spec.php
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
];

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim()) return text;
  
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );
    
    if (!response.ok) throw new Error('Translation failed');
    
    const data = await response.json();
    return data.responseData?.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}
