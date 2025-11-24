import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Pause, Sparkles, BookOpen, Save, Wand2, User, Lock } from 'lucide-react';
import { generateBedtimeStory } from '../services/gemini';
import { Language } from '../types';
import { UI_TEXT } from '../translations';

interface StoryGeneratorProps {
  onShowPremium: () => void;
  isPremium: boolean;
  onStoryGenerated?: (skill: string) => void;
  lang: Language;
}

type CharacterCategory = 'boy' | 'girl' | 'neutral';

interface Character {
  id: string;
  name: string;
  icon: string;
  category: CharacterCategory;
  color: string;
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onShowPremium, isPremium, onStoryGenerated, lang }) => {
  const t = UI_TEXT[lang].stories;
  
  const CHARACTERS: Character[] = [
    { id: 'superman', name: 'Superman/超人', icon: '🦸‍♂️', category: 'boy', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { id: 'ultraman', name: 'Ultraman/奥特曼', icon: '👽', category: 'boy', color: 'bg-red-100 text-red-600 border-red-200' },
    { id: 'paw_chase', name: 'Chase/阿奇', icon: '🐶', category: 'boy', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { id: 'minnie', name: 'Minnie/米妮', icon: '🎀', category: 'girl', color: 'bg-pink-100 text-pink-600 border-pink-200' },
    { id: 'elsa', name: 'Elsa/艾莎', icon: '❄️', category: 'girl', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
    { id: 'peppa', name: 'Peppa/佩奇', icon: '🐷', category: 'girl', color: 'bg-rose-100 text-rose-600 border-rose-200' },
    { id: 'spongebob', name: 'SpongeBob/海绵宝宝', icon: '🧽', category: 'neutral', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { id: 'doraemon', name: 'Doraemon/哆啦A梦', icon: '🐱', category: 'neutral', color: 'bg-sky-100 text-sky-600 border-sky-200' },
    { id: 'totoro', name: 'Totoro/龙猫', icon: '🌫️', category: 'neutral', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    skill: '',
    issue: ''
  });
  
  const [selectedCategory, setSelectedCategory] = useState<CharacterCategory>('neutral');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('totoro');
  const [useMyVoice, setUseMyVoice] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{ text: string; audioBase64: string; mimeType: string } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [freeUsageCount, setFreeUsageCount] = useState(0);

  useEffect(() => {
    const savedCount = localStorage.getItem('joy_story_usage');
    if (savedCount) {
      setFreeUsageCount(parseInt(savedCount));
    }
  }, []);

  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(15);
  const [hasVoiceSample, setHasVoiceSample] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleMockRecord = () => {
    if (!isPremium) {
      onShowPremium();
      return;
    }
    
    if (isRecordingVoice) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecordingVoice(false);
      setHasVoiceSample(true);
      setUseMyVoice(true);
      setSelectedCharacter('');
      setRecordingTime(15);
      return;
    }

    setIsRecordingVoice(true);
    setRecordingTime(15);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsRecordingVoice(false);
          setHasVoiceSample(true);
          setUseMyVoice(true);
          setSelectedCharacter('');
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGenerate = async () => {
    if (!isPremium) {
       if (freeUsageCount >= 2) {
         onShowPremium();
         return;
       }
    }

    if (!formData.name || !formData.skill) {
      alert(lang === 'zh' ? "请填写孩子昵称和需要学习的技能" : "Please fill in Name and Skill.");
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const voiceId = useMyVoice ? 'parent_clone' : selectedCharacter;

      const result = await generateBedtimeStory(
        formData.name,
        formData.age,
        formData.skill,
        formData.issue,
        voiceId,
        lang
      );
      setGeneratedStory(result);
      
      if (result.audioBase64) {
        const mime = result.mimeType || 'audio/mp3'; 
        setAudioUrl(`data:${mime};base64,${result.audioBase64}`);
      }

      if (onStoryGenerated) {
        onStoryGenerated(formData.skill);
      }

      if (!isPremium) {
        const newCount = freeUsageCount + 1;
        setFreeUsageCount(newCount);
        localStorage.setItem('joy_story_usage', newCount.toString());
      }

    } catch (e) {
      console.error(e);
      alert(lang === 'zh' ? "生成故事失败，请重试" : "Failed to generate story.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const filteredCharacters = CHARACTERS.filter(c => c.category === selectedCategory);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-5/12 bg-white rounded-2xl shadow-sm border border-warm-200 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Wand2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">{t.title}</h2>
              {!isPremium && <p className="text-xs text-stone-400">{t.usage}: {Math.max(0, 2 - freeUsageCount)} {t.times}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">{t.name}</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
               <label className="block text-xs font-bold text-stone-500 mb-1">{t.age}</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                 value={formData.age}
                 onChange={e => setFormData({...formData, age: e.target.value})}
               />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
             <h3 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-1">
               <Sparkles size={14} /> {t.goal}
             </h3>
             <div className="space-y-3">
                <div>
                   <label className="block text-xs font-semibold text-purple-700 mb-1">{t.skill}</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 text-sm rounded-lg border border-purple-200 focus:outline-none focus:border-purple-400 bg-white"
                     value={formData.skill}
                     onChange={e => setFormData({...formData, skill: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-purple-700 mb-1">{t.challenge}</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 text-sm rounded-lg border border-purple-200 focus:outline-none focus:border-purple-400 bg-white"
                     value={formData.issue}
                     onChange={e => setFormData({...formData, issue: e.target.value})}
                   />
                </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-3">{t.selectChar}</label>
            <div className="flex bg-stone-100 p-1 rounded-lg mb-3">
              {[
                { id: 'boy', label: t.boyFav },
                { id: 'girl', label: t.girlFav },
                { id: 'neutral', label: t.neutralFav }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id as any); setUseMyVoice(false); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    !useMyVoice && selectedCategory === cat.id 
                      ? 'bg-white text-stone-800 shadow-sm' 
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className={`grid grid-cols-3 gap-2 transition-opacity ${useMyVoice ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
               {filteredCharacters.map(char => (
                 <button
                   key={char.id}
                   onClick={() => { setSelectedCharacter(char.id); setUseMyVoice(false); }}
                   className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                     selectedCharacter === char.id
                       ? `${char.color} shadow-sm ring-1 ring-offset-1 ring-stone-200`
                       : 'bg-white border-stone-100 text-stone-400 grayscale hover:grayscale-0 hover:bg-stone-50'
                   }`}
                 >
                    <span className="text-2xl mb-1">{char.icon}</span>
                    <span className="text-xs font-bold truncate w-full text-center">{char.name}</span>
                 </button>
               ))}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100">
               <button 
                  onClick={handleMockRecord}
                  className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${
                      useMyVoice
                      ? 'border-green-400 bg-green-50 text-green-700 font-bold' 
                      : isRecordingVoice
                        ? 'border-red-400 bg-red-50 text-red-600 font-bold animate-pulse cursor-pointer'
                        : 'border-stone-300 text-stone-500 hover:border-purple-400 hover:text-purple-600'
                  }`}
               >
                  {isRecordingVoice ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                        {t.stopRecord} {recordingTime}s
                      </>
                  ) : hasVoiceSample || useMyVoice ? (
                      <> <User size={18} /> {t.useMyVoice}</>
                  ) : (
                      <> <Mic size={18} /> {t.recordMyVoice}</>
                  )}
                  {!hasVoiceSample && !isPremium && !isRecordingVoice && <Lock size={12} className="ml-1 opacity-50" />}
               </button>
            </div>
          </div>

          <button
             onClick={handleGenerate}
             disabled={isGenerating || !formData.name || !formData.skill}
             className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
          >
             {isGenerating ? <Sparkles className="animate-spin" /> : <Wand2 />} 
             {isGenerating ? (lang === 'zh' ? 'AI 正在创作...' : 'AI Generating...') : `${t.generateBtn} (${!isPremium && freeUsageCount >= 2 ? t.needPremium : t.free})`}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-warm-200 p-6 flex flex-col relative overflow-hidden">
         {!generatedStory ? (
             <div className="flex-1 flex flex-col items-center justify-center text-stone-300">
                 <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                    <BookOpen size={40} className="opacity-50" />
                 </div>
                 <h3 className="text-lg font-bold text-stone-400 mb-2">{t.ready}</h3>
                 <p className="text-sm max-w-xs text-center">{t.readyDesc}</p>
             </div>
         ) : (
             <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-warm-100">
                   <div>
                       <h2 className="text-xl font-bold text-stone-800">
                          {formData.name}'s Adventure
                       </h2>
                       <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                          {t.narrator}: <span className="font-bold text-purple-600">{useMyVoice ? 'Parent' : CHARACTERS.find(c => c.id === selectedCharacter)?.name.split('/')[0]}</span>
                       </p>
                   </div>
                   
                   {audioUrl && (
                       <button 
                         onClick={toggleAudio}
                         className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all shadow-md ${
                            isPlaying ? 'bg-amber-400 text-amber-900' : 'bg-warm-500 text-white hover:bg-warm-600'
                         }`}
                       >
                          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                          <span className="font-bold">{isPlaying ? t.pause : t.play}</span>
                       </button>
                   )}
                   {audioUrl && (
                       <audio 
                         ref={audioRef} 
                         src={audioUrl} 
                         onEnded={() => setIsPlaying(false)} 
                         className="hidden" 
                       />
                   )}
                </div>
                
                <div className="flex-1 overflow-y-auto prose prose-stone max-w-none pr-2 custom-scrollbar">
                    {generatedStory.text.split('\n').map((para, i) => (
                        <p key={i} className="mb-4 text-lg leading-relaxed text-stone-700 first-letter:text-3xl first-letter:font-bold first-letter:text-warm-500">
                            {para}
                        </p>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-warm-100 flex justify-between items-center">
                    <div className="text-xs text-stone-400 italic">
                        * AI Generated
                    </div>
                    <button className="flex items-center gap-2 text-stone-500 hover:text-warm-600 text-sm font-bold px-4 py-2 hover:bg-warm-50 rounded-lg transition-colors">
                        <Save size={18} /> {t.save}
                    </button>
                </div>
             </>
         )}
      </div>
    </div>
  );
};

export default StoryGenerator;