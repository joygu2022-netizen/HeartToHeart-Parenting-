import React from 'react';
import { X, Crown, Sparkles, Video, Mail, Mic } from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../translations';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  lang: Language;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe, lang }) => {
  if (!isOpen) return null;
  const t = UI_TEXT[lang].premium;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Crown size={24} className="text-white" />
            </div>
            <span className="font-bold text-sm uppercase tracking-wider text-yellow-50">Joy Premium</span>
          </div>
          <h2 className="text-3xl font-bold mb-1">{t.title}</h2>
          <p className="text-yellow-50 text-sm">{t.subtitle}</p>
        </div>

        <div className="p-6 bg-white">
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-warm-100 rounded-lg text-warm-600 mt-1">
                <Mic size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">{t.features.stories.title}</h3>
                <p className="text-xs text-stone-500">{t.features.stories.desc}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-warm-100 rounded-lg text-warm-600 mt-1">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">{t.features.export.title}</h3>
                <p className="text-xs text-stone-500">{t.features.export.desc}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mt-1">
                <Video size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">{t.features.video.title}</h3>
                <p className="text-xs text-stone-500">{t.features.video.desc}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
             <button onClick={onSubscribe} className="relative border-2 border-yellow-400 bg-yellow-50 rounded-xl p-3 text-center hover:shadow-md transition-all">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                   {t.mostPopular}
                </div>
                <div className="text-sm font-bold text-stone-600 mb-1">{t.monthly}</div>
                <div className="text-2xl font-bold text-stone-800">¥19<span className="text-xs font-normal text-stone-500">/mo</span></div>
             </button>

             <button onClick={onSubscribe} className="relative border border-stone-200 bg-white rounded-xl p-3 text-center hover:border-yellow-400 transition-all opacity-80 hover:opacity-100">
                <div className="absolute -top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                   {t.save}
                </div>
                <div className="text-sm font-bold text-stone-600 mb-1">{t.yearly}</div>
                <div className="text-2xl font-bold text-stone-800">¥169<span className="text-xs font-normal text-stone-500">/yr</span></div>
             </button>
          </div>

          <button 
            onClick={onSubscribe}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            {t.cta}
          </button>
          
          <p className="text-center text-[10px] text-stone-400 mt-4">{t.footer}</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;