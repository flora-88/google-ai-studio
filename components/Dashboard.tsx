import React, { useState, useEffect } from 'react';
import { UserProfile, House, Location, ClassTask, GameState, Language } from '../types';
import { getInitialLocations, getInitialSchedule, HOUSE_COLORS } from '../constants';
import { TRANSLATIONS } from '../translations';
import { LocationView } from './LocationView';
import { ClassSession } from './ClassSession';
import { Map, Book, LogOut } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onRestart: () => void;
  language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onRestart, language }) => {
  // Reload initial data when language changes
  // Note: In a real app, we would need to persist progress. 
  // For this demo, changing language resets the schedule text but keeps completion status if mapped by ID.
  const [locations, setLocations] = useState<Location[]>([]);
  const [schedule, setSchedule] = useState<ClassTask[]>([]);

  useEffect(() => {
      const locs = getInitialLocations(language);
      const sched = getInitialSchedule(language);
      
      // Preserve completion status if schedule already existed
      setSchedule(prev => {
          if (prev.length === 0) return sched;
          return sched.map(t => {
              const old = prev.find(p => p.id === t.id);
              return old ? { ...t, completed: old.completed } : t;
          });
      });
      setLocations(locs);
  }, [language]);

  const [currentLocationId, setCurrentLocationId] = useState('great-hall');
  const [gameState, setGameState] = useState<GameState>(GameState.GAMEPLAY);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'tasks'>('tasks');

  const t = TRANSLATIONS[language];
  const currentLocation = locations.find(l => l.id === currentLocationId) || locations[0] || { id: 'void', name: 'Void', description: '', npcs: [], connectedTo: [] };
  const houseStyle = HOUSE_COLORS[user.house];

  const handleMove = (locationId: string) => {
    setCurrentLocationId(locationId);
  };

  const handleStartClass = (taskId: string) => {
    setActiveClassId(taskId);
    setGameState(GameState.CLASS_SESSION);
  };

  const handleCompleteClass = (taskId: string, success: boolean) => {
    if (success) {
        setSchedule(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    }
    setGameState(GameState.GAMEPLAY);
    setActiveClassId(null);
  };

  const progress = schedule.length > 0 ? (schedule.filter(t => t.completed).length / schedule.length) * 100 : 0;

  const validConnectedLocations = currentLocation.connectedTo
    .map(id => locations.find(l => l.id === id))
    .filter((l): l is Location => l !== undefined);

  if (locations.length === 0) return null;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#1a1a1a] overflow-hidden text-parchment font-serif">
      
      {/* Sidebar / HUD */}
      <div className="w-full md:w-80 bg-stone-900 border-r border-stone-700 flex flex-col z-20 shadow-2xl">
        
        {/* Profile Header */}
        <div className={`p-4 border-b-4 ${houseStyle} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-xl font-bold border-2 border-white/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display font-bold">{user.name}</h2>
            <p className="text-xs opacity-80 uppercase tracking-widest">{user.house}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-700">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors ${activeTab === 'tasks' ? 'text-yellow-500 bg-stone-800 border-b-2 border-yellow-500' : 'text-stone-500'}`}
          >
            <Book className="w-4 h-4" /> {t.schedule}
          </button>
          <button 
             onClick={() => setActiveTab('map')}
             className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors ${activeTab === 'map' ? 'text-yellow-500 bg-stone-800 border-b-2 border-yellow-500' : 'text-stone-500'}`}
          >
            <Map className="w-4 h-4" /> {t.map}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-900/50">
            {activeTab === 'tasks' && (
                <div className="space-y-4">
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-stone-400 mb-1">
                            <span>{t.yearProgress}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-600" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    {schedule.map(task => (
                        <div key={task.id} className={`p-3 rounded border ${task.completed ? 'border-green-800 bg-green-900/20 opacity-70' : 'border-stone-600 bg-stone-800'}`}>
                            <h3 className={`font-bold ${task.completed ? 'text-green-500 line-through' : 'text-parchment'}`}>
                                {task.subject}
                            </h3>
                            <p className="text-sm text-stone-400 mb-2">{task.description}</p>
                            {!task.completed && (
                                <div className="text-xs text-yellow-600 flex items-center gap-1">
                                    <Map className="w-3 h-3" /> 
                                    {locations.find(l => l.id === task.locationId)?.name}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'map' && (
                <div className="space-y-2">
                    <h3 className="text-stone-400 uppercase text-xs font-bold mb-2 tracking-widest">{t.currentLocation}: {currentLocation.name}</h3>
                    <div className="grid gap-2">
                        {locations.map(loc => (
                            <button 
                                key={loc.id}
                                onClick={() => handleMove(loc.id)}
                                className={`p-2 text-left text-sm rounded transition-colors flex justify-between items-center ${currentLocationId === loc.id ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-800' : 'hover:bg-stone-800 text-stone-400'}`}
                            >
                                <span>{loc.name}</span>
                                {currentLocationId === loc.id && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-700 bg-stone-900">
            <button onClick={onRestart} className="flex items-center gap-2 text-stone-500 hover:text-red-400 text-sm w-full justify-center transition-colors">
                <LogOut className="w-4 h-4" /> {t.dropOut}
            </button>
        </div>

      </div>

      {/* Main Game View */}
      <div className="flex-1 relative bg-black">
        {gameState === GameState.CLASS_SESSION && activeClassId ? (
            <ClassSession 
                task={schedule.find(t => t.id === activeClassId)!}
                user={user}
                onComplete={(success) => handleCompleteClass(activeClassId, success)}
                language={language}
            />
        ) : (
            <LocationView 
                location={currentLocation} 
                user={user} 
                connectedLocations={validConnectedLocations}
                onMove={handleMove}
                availableTask={schedule.find(t => t.locationId === currentLocation.id && !t.completed)}
                onStartClass={handleStartClass}
                language={language}
            />
        )}
      </div>

    </div>
  );
};