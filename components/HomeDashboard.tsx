import React from 'react';
import { MessageCircle, ClipboardCheck, BookHeart, Mic, ArrowRight, Heart, Globe } from 'lucide-react';
import { AppView, Language } from '../types';
import { UI_TEXT } from '../translations';

interface HomeDashboardProps {
  onNavigate: (view: AppView) => void;
  lang: Language;
  onLanguageSelect: (lang: Language) => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, lang, onLanguageSelect }) => {
  const t = UI_TEXT[lang].home;
  
  const features = [
    {
      id: AppView.CHAT,
      title: UI_TEXT[lang].nav.chat,
      icon: MessageCircle,
      color: 'bg-orange-100 text-orange-600',
      desc: t.chatDesc
    },
    {
      id: AppView.ASSESSMENT,
      title: UI_TEXT[lang].nav.assessment,
      icon: ClipboardCheck,
      color: 'bg-blue-100 text-blue-600',
      desc: t.assessmentDesc
    },
    {
      id: AppView.SOLUTIONS,
      title: UI_TEXT[lang].nav.solutions,
      icon: BookHeart,
      color: 'bg-pink-100 text-pink-600',
      desc: t.solutionsDesc
    },
    {
      id: AppView.STORIES,
      title: UI_TEXT[lang].nav.stories,
      icon: Mic,
      color: 'bg-purple-100 text-purple-600',
      desc: t.storiesDesc
    }
  ];

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-warm-200 p-6 overflow-y-auto relative">
      {/* Language Toggle in Corner */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex bg-warm-50 rounded-full p-1 border border-warm-200 shadow-sm">
           <button 
             onClick={() => onLanguageSelect('zh')}
             className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === 'zh' ? 'bg-white text-warm-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
           >
             中文
           </button>
           <button 
             onClick={() => onLanguageSelect('en')}
             className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
           >
             English
           </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[80%] py-12 text-center max-w-4xl mx-auto">
        <div className="mb-6 p-5 bg-gradient-to-br from-warm-100 to-orange-50 rounded-full animate-in zoom-in duration-500 shadow-inner ring-4 ring-white">
           <Heart size={48} className="text-warm-500 drop-shadow-sm fill-current" />
        </div>
        
        {/* Main Brand Name - Big and Bold */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 mb-4 tracking-tight leading-tight">
          {UI_TEXT[lang].appTitle}
        </h1>
        
        {/* Subtitle/List - Smaller, lighter, normal weight */}
        <p className="text-stone-400 text-sm md:text-base font-normal mb-12 max-w-2xl px-4">
           {t.slogan}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl px-2">
          {features.map((feature, idx) => (
            <button
              key={feature.id}
              onClick={() => onNavigate(feature.id)}
              className="group flex items-center p-5 bg-white border border-stone-100 rounded-3xl shadow-sm hover:shadow-lg hover:border-warm-300 transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${feature.color.split(' ')[0]}`} />
              <div className={`p-4 rounded-2xl ${feature.color} mr-5 group-hover:scale-110 transition-transform shadow-sm`}>
                <feature.icon size={28} />
              </div>
              <div className="flex-1 z-10">
                <h3 className="text-lg font-bold text-stone-800 mb-0.5 flex items-center justify-between">
                  {feature.title} 
                  <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-stone-300" />
                </h3>
                <p className="text-xs text-stone-400 font-medium">
                  {feature.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-16 flex items-center gap-2 text-stone-300 text-sm font-medium">
             <Globe size={16} /> 
             <span>HeartToHeart Parenting</span>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;