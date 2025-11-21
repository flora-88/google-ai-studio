
import React, { useState, useRef, useEffect } from 'react';
import { Location, UserProfile, ClassTask, ChatMessage, Language } from '../types';
import { generateNPCResponse, generateLocationImage, editLocationImage } from '../services/geminiService';
import { Button } from './Button';
import { MessageCircle, ArrowRight, School, Users, Eye, Wand2, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface LocationViewProps {
  location: Location;
  user: UserProfile;
  connectedLocations: Location[];
  onMove: (id: string) => void;
  availableTask?: ClassTask;
  onStartClass: (taskId: string) => void;
  language: Language;
}

export const LocationView: React.FC<LocationViewProps> = ({ 
  location, 
  user, 
  connectedLocations, 
  onMove,
  availableTask,
  onStartClass,
  language
}) => {
  const [activeNPC, setActiveNPC] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Image Generation State
  const [locationImage, setLocationImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  const t = TRANSLATIONS[language];

  // Reset chat when moving locations or switching NPCs
  useEffect(() => {
    setActiveNPC(null);
    setChatHistory([]);
    // Reset image when location changes to encourage exploration
    setLocationImage(null);
    setImagePrompt('');
  }, [location.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleNPCClick = (npc: string) => {
    setActiveNPC(npc);
    setChatHistory([{ sender: npc, text: "...", isPlayer: false }]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeNPC) return;

    const userMsg = inputMessage;
    setInputMessage('');
    
    setChatHistory(prev => [...prev, { sender: user.name, text: userMsg, isPlayer: true }]);
    setIsTyping(true);

    try {
      const response = await generateNPCResponse(activeNPC, location.name, user, chatHistory, userMsg, language);
      setChatHistory(prev => [...prev, { sender: activeNPC, text: response, isPlayer: false }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: "System", text: "...", isPlayer: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
        const base64 = await generateLocationImage(location.description);
        setLocationImage(base64);
    } catch (err) {
        console.error("Failed to generate image", err);
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleEditImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationImage || !imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    try {
        const base64 = await editLocationImage(locationImage, imagePrompt);
        setLocationImage(base64);
        setImagePrompt('');
    } catch (err) {
        console.error("Failed to edit image", err);
    } finally {
        setIsGeneratingImage(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-stone-900/90">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-4xl font-display text-yellow-500 mb-2 drop-shadow-lg tracking-wider">{location.name}</h2>
        <p className="text-stone-400 italic max-w-2xl mx-auto border-b border-stone-700 pb-4">{location.description}</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Column: Navigation & Tasks */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
           
           {/* Magical Vision (Image Generation) */}
           <div className="bg-stone-800 border border-stone-600 rounded-lg overflow-hidden shadow-lg">
                {!locationImage ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-4 bg-stone-900/50">
                        <Eye className="w-12 h-12 text-purple-400 opacity-50" />
                        <Button 
                            variant="magic" 
                            onClick={handleGenerateImage}
                            isLoading={isGeneratingImage}
                            className="w-full sm:w-auto"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {t.manifestVision}
                        </Button>
                    </div>
                ) : (
                    <div className="relative group">
                        <img 
                            src={`data:image/png;base64,${locationImage}`} 
                            alt={location.name} 
                            className="w-full h-64 object-cover"
                        />
                        {isGeneratingImage && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        )}
                        <form onSubmit={handleEditImage} className="absolute bottom-0 left-0 right-0 p-3 bg-black/70 backdrop-blur-sm flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <input 
                                type="text"
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder={t.visualSpellPlaceholder}
                                className="flex-1 bg-stone-800/50 border border-stone-500 rounded px-2 py-1 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-purple-500"
                            />
                            <Button type="submit" variant="magic" className="px-3 py-1 text-xs" disabled={isGeneratingImage}>
                                {t.alterVision}
                            </Button>
                        </form>
                    </div>
                )}
           </div>

           {/* Class Prompt */}
           {availableTask && (
             <div className="bg-stone-800/80 border-2 border-yellow-700/50 p-6 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <div>
                  <h3 className="font-bold text-yellow-500 text-xl flex items-center gap-2 mb-1">
                    <School className="w-6 h-6" />
                    {t.classSession}: {availableTask.subject}
                  </h3>
                  <p className="text-stone-300">{availableTask.description}</p>
                </div>
                <Button variant="magic" onClick={() => onStartClass(availableTask.id)} className="whitespace-nowrap">
                  {t.enterClass}
                </Button>
             </div>
           )}

           {/* Navigation */}
           <div className="bg-stone-800/50 p-4 rounded-lg border border-stone-700 flex-1">
              <h3 className="text-stone-500 uppercase text-xs font-bold mb-4 tracking-widest flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> {t.travel}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectedLocations.map(loc => (
                   <button 
                     key={loc.id}
                     onClick={() => onMove(loc.id)}
                     className="group flex items-center justify-between p-4 rounded bg-stone-800 hover:bg-stone-700 border border-stone-600 hover:border-stone-400 transition-all text-left"
                   >
                     <span className="font-serif font-bold text-stone-300 group-hover:text-parchment">{loc.name}</span>
                     <ArrowRight className="w-4 h-4 text-stone-500 group-hover:translate-x-1 transition-transform" />
                   </button>
                ))}
              </div>
           </div>
        </div>

        {/* Right Column: Interaction Area */}
        <div className="w-full lg:w-96 bg-black/40 rounded-lg border border-stone-700 flex flex-col overflow-hidden shadow-xl">
           {!activeNPC ? (
             <div className="p-4 h-full overflow-y-auto">
                <h3 className="text-stone-500 uppercase text-xs font-bold mb-4 tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" /> {t.people}
                </h3>
                <div className="space-y-3">
                  {location.npcs.map(npc => (
                    <button
                      key={npc}
                      onClick={() => handleNPCClick(npc)}
                      className="w-full p-4 text-left bg-stone-800 hover:bg-stone-700 rounded border border-stone-600 flex items-center gap-4 transition-all hover:scale-[1.02]"
                    >
                      <div className="w-10 h-10 rounded-full bg-stone-600 flex items-center justify-center border border-stone-500">
                        <MessageCircle className="w-5 h-5 text-stone-300" />
                      </div>
                      <span className="font-bold text-stone-300">{npc}</span>
                    </button>
                  ))}
                  {location.npcs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-stone-600 italic">
                        <p>{t.quiet}</p>
                        <p className="text-xs mt-1">{t.tooQuiet}</p>
                    </div>
                  )}
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col h-full">
               {/* Chat Header */}
               <div className="p-3 border-b border-stone-700 bg-stone-800/90 flex justify-between items-center backdrop-blur-sm">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-bold text-parchment">{activeNPC}</span>
                 </div>
                 <button onClick={() => setActiveNPC(null)} className="text-xs text-stone-400 hover:text-white uppercase tracking-wider font-bold">{t.leaveChat}</button>
               </div>
               
               {/* Messages */}
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-stone-900/50 to-transparent">
                 {chatHistory.map((msg, idx) => (
                   <div key={idx} className={`flex ${msg.isPlayer ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-md ${msg.isPlayer ? 'bg-stone-700 text-parchment rounded-br-none' : 'bg-stone-800 text-stone-300 border border-stone-600 rounded-bl-none'}`}>
                       <p className="leading-relaxed">{msg.text}</p>
                     </div>
                   </div>
                 ))}
                 {isTyping && (
                   <div className="flex justify-start">
                     <div className="bg-stone-800 p-3 rounded-lg border border-stone-600 rounded-bl-none">
                       <div className="flex gap-1">
                         <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" />
                         <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce delay-75" />
                         <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce delay-150" />
                       </div>
                     </div>
                   </div>
                 )}
                 <div ref={chatEndRef} />
               </div>

               {/* Input */}
               <form onSubmit={sendMessage} className="p-3 border-t border-stone-700 bg-stone-800">
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     placeholder={t.saySomething}
                     className="flex-1 bg-stone-900 border border-stone-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-600 text-parchment placeholder-stone-600"
                   />
                   <Button type="submit" variant="secondary" className="px-4 py-1 text-sm">{t.send}</Button>
                 </div>
               </form>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
