import React, { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { SortingCeremony } from './components/SortingCeremony';
import { Dashboard } from './components/Dashboard';
import { UserProfile, House, GameState, Language } from './types';
import { initGemini } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [language, setLanguage] = useState<Language>('en');

  const handleStart = (profile: UserProfile, apiKey: string) => {
    initGemini(apiKey);
    setUser(profile);
    setGameState(GameState.SORTING);
  };

  const handleSortingComplete = (house: House) => {
    if (!user) return;
    setUser({ ...user, house });
    setGameState(GameState.GAMEPLAY);
  };

  const handleRestart = () => {
    setUser(null);
    setGameState(GameState.START);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-serif selection:bg-purple-900 selection:text-white">
      {!user && (
        <StartScreen 
          onStart={handleStart} 
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {user && gameState === GameState.SORTING && (
        <SortingCeremony 
          user={user} 
          onComplete={handleSortingComplete} 
          language={language}
        />
      )}

      {user && (gameState === GameState.GAMEPLAY || gameState === GameState.CLASS_SESSION) && (
        <Dashboard 
          user={user} 
          onRestart={handleRestart} 
          language={language}
        />
      )}
    </div>
  );
};

export default App;