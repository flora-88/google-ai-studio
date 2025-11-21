
import React, { useState } from 'react';
import { UserProfile, House, Language } from '../types';
import { Button } from './Button';
import { Scroll, Wand2, Globe, Key } from 'lucide-react';
import { TRANSLATIONS, LANGUAGE_NAMES } from '../translations';

interface StartScreenProps {
  onStart: (profile: UserProfile, apiKey: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, language, setLanguage }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(11);
  const [gender, setGender] = useState('Witch');
  const [apiKey, setApiKey] = useState('');

  const t = TRANSLATIONS[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !apiKey.trim()) return;
    
    onStart({
      name,
      age,
      gender,
      house: House.Unsorted,
      stats: { intelligence: 5, courage: 5, ambition: 5, loyalty: 5 }
    }, apiKey);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?grayscale')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative inline-block group">
            <button className="flex items-center gap-2 bg-stone-800/80 text-parchment px-4 py-2 rounded-lg border border-stone-600 hover:bg-stone-700 transition-colors">
                <Globe className="w-4 h-4" />
                {LANGUAGE_NAMES[language]}
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-stone-800 rounded-lg shadow-xl border border-stone-600 overflow-hidden hidden group-hover:block group-focus-within:block">
                {(Object.keys(LANGUAGE_NAMES) as Language[]).map(lang => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-stone-700 ${language === lang ? 'text-yellow-500 bg-stone-700' : 'text-stone-300'}`}
                    >
                        {LANGUAGE_NAMES[lang]}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="relative z-10 bg-parchment max-w-md w-full p-8 rounded-sm shadow-2xl border-8 border-double border-stone-800 transform rotate-1">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-stone-900 mb-2">{t.title}</h1>
          <h2 className="font-serif text-xl text-stone-700 italic">{t.subtitle}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-serif">
          <div className="bg-stone-200/50 p-4 rounded border border-stone-300">
            <label className="block text-sm font-bold text-stone-800 mb-1 flex items-center gap-2">
                <Key className="w-4 h-4" />
                {t.apiKeyLabel}
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-stone-100 border border-stone-400 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-purple-700 placeholder-stone-400"
              placeholder={t.apiKeyPlaceholder}
              required
            />
            <p className="text-xs text-stone-500 mt-1">{t.apiKeyHelp}</p>
          </div>

          <div>
            <label className="block text-lg mb-1 text-stone-800 font-bold">{t.name}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-stone-800 text-2xl text-black focus:outline-none focus:border-purple-700 pb-2 placeholder-stone-400"
              placeholder="Harry Potter"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-lg mb-1 text-stone-800 font-bold">{t.age}</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                min={11}
                max={17}
                className="w-full bg-transparent border-b-2 border-stone-800 text-xl text-black focus:outline-none pb-2"
              />
            </div>
            <div className="flex-1">
              <label className="block text-lg mb-1 text-stone-800 font-bold">{t.type}</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-800 text-xl text-black focus:outline-none pb-2"
              >
                <option value="Witch">{t.witch}</option>
                <option value="Wizard">{t.wizard}</option>
                <option value="Mage">{t.mage}</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="magic" className="w-full text-lg py-3" disabled={!apiKey}>
              <Wand2 className="w-5 h-5 mr-2" />
              {t.start}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 flex justify-center text-stone-500">
          <Scroll className="w-6 h-6 animate-bounce" />
        </div>
      </div>
    </div>
  );
};
