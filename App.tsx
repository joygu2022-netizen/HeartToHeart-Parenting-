import React, { useState } from 'react';
import { AppView, ChildProfile, Language } from './types';
import ChatInterface from './components/ChatInterface';
import AssessmentTool from './components/AssessmentTool';
import SolutionLibrary from './components/SolutionLibrary';
import StoryGenerator from './components/StoryGenerator';
import HomeDashboard from './components/HomeDashboard';
import PremiumModal from './components/PremiumModal';
import { generateContextualTip } from './services/gemini';
import { UI_TEXT } from './translations';
import { MessageCircle, ClipboardCheck, BookHeart, Heart, Crown, Mic, Sparkles, Globe } from 'lucide-react';

const App: React.FC = () => {
  // Initialize in Chinese by default for immediate landing page
  const [language, setLanguage] = useState<Language>('zh');

  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userContext, setUserContext] = useState<string>("Parenting in general");

  const [dailyTip, setDailyTip] = useState<{ text: string; author?: string }>({
    text: "孩子需要鼓励，就像植物需要水。",
    author: "鲁道夫·德雷克斯"
  });

  const [assessmentConfig, setAssessmentConfig] = useState<{
    id: string;
    profile?: Partial<ChildProfile>;
  } | null>(null);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    // Update tip when language changes
    if (lang === 'zh') {
        setDailyTip({
            text: "孩子需要鼓励，就像植物需要水。",
            author: "鲁道夫·德雷克斯"
        });
    } else {
        setDailyTip({
            text: "Encouragement is to the child what water is to the plant.",
            author: "Rudolf Dreikurs"
        });
    }
  };

  const handleConsult = (topic: string) => {
    setUserContext(`Parent consulted about: ${topic}`);
    setCurrentView(AppView.CHAT);
  };

  const handleNavigateToAssessment = (id: string, initialProfile?: Partial<ChildProfile>) => {
    setAssessmentConfig({ id, profile: initialProfile });
    setCurrentView(AppView.ASSESSMENT);
  };

  const handleUpdateTip = (newTip: string) => {
    setUserContext(`Parent completed assessment with result: ${newTip.substring(0, 50)}...`);
    setDailyTip({ text: newTip, author: 'HeartToHeart AI' });
  };

  const handleSubscribe = async () => {
    setIsPremium(true);
    setShowPremiumModal(false);
    try {
      const vipTip = await generateContextualTip(userContext, true, language);
      setDailyTip({
        text: vipTip,
        author: 'HeartToHeart AI (Premium)'
      });
    } catch (e) {}
    alert(language === 'zh' ? "🎉 欢迎成为 心连心 尊享会员！" : "🎉 Welcome to HeartToHeart Premium!");
  };

  const NavButton = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all ${
        currentView === view
          ? 'bg-warm-100 text-warm-700 font-bold shadow-sm'
          : 'text-stone-500 hover:bg-warm-50 hover:text-stone-700'
      }`}
    >
      <Icon size={20} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  const t = UI_TEXT[language];

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col md:flex-row p-0 md:p-6 gap-6 font-sans text-stone-800">
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={handleSubscribe}
        lang={language}
      />

      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-white md:rounded-3xl shadow-sm border-b md:border border-warm-100 flex md:flex-col justify-between p-4 sticky top-0 z-10 md:h-[calc(100vh-3rem)]">
        <div>
          <div className="flex items-center gap-2 mb-2 md:mb-8 px-2 md:px-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setCurrentView(AppView.HOME)}>
            <div className={`p-2 rounded-xl text-white transform -rotate-6 transition-colors ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' : 'bg-warm-500'}`}>
              {isPremium ? <Crown fill="currentColor" size={20} /> : <Heart fill="currentColor" size={20} />}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-800">
                {t.appTitle}
              </h1>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide">
                {isPremium ? t.premiumSubtitle : t.appSubtitle}
              </p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            <NavButton view={AppView.CHAT} icon={MessageCircle} label={t.nav.chat} />
            <NavButton view={AppView.ASSESSMENT} icon={ClipboardCheck} label={t.nav.assessment} />
            <NavButton view={AppView.SOLUTIONS} icon={BookHeart} label={t.nav.solutions} />
            <NavButton view={AppView.STORIES} icon={Mic} label={t.nav.stories} />
          </nav>
        </div>
        
        <div className="flex flex-col gap-4">
            <div className={`hidden md:block px-4 py-4 rounded-2xl transition-all duration-500 ${isPremium ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200' : 'bg-warm-50'}`}>
                <p className={`text-xs mb-2 font-bold flex items-center gap-1 ${isPremium ? 'text-amber-700' : 'text-stone-500'}`}>
                    {isPremium ? <><Sparkles size={12} /> {t.premiumTip}</> : t.dailyTip}
                </p>
                <p className={`text-sm italic leading-relaxed ${isPremium ? 'text-amber-900 font-medium' : 'text-stone-600'}`}>
                    "{dailyTip.text}" <br/>
                    <span className={`block mt-1 text-right text-xs ${isPremium ? 'text-amber-700 opacity-70' : 'text-stone-400'}`}>- {dailyTip.author}</span>
                </p>
                {!isPremium && (
                    <button 
                    onClick={() => setShowPremiumModal(true)}
                    className="mt-4 w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                    <Crown size={12} /> {t.upgrade}
                    </button>
                )}
            </div>
            
            {/* Sidebar Language Toggle (hidden if on home since home has its own) */}
            {currentView !== AppView.HOME && (
                <div className="hidden md:flex justify-center">
                    <button onClick={() => handleLanguageSelect(language === 'zh' ? 'en' : 'zh')} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                        <Globe size={12} /> {language === 'zh' ? 'Switch to English' : '切换至中文'}
                    </button>
                </div>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-4rem)] md:h-[calc(100vh-3rem)] p-4 md:p-0 pt-0">
        <div className="h-full">
           {currentView === AppView.HOME && (
             <HomeDashboard 
               onNavigate={setCurrentView} 
               lang={language} 
               onLanguageSelect={handleLanguageSelect} 
             />
           )}
           {currentView === AppView.CHAT && (
             <ChatInterface 
               onNavigateToAssessment={handleNavigateToAssessment} 
               onUserActivity={(txt) => setUserContext(`Chat: ${txt}`)}
               lang={language}
             />
           )}
           {currentView === AppView.ASSESSMENT && (
             <AssessmentTool 
               onAssessmentComplete={handleUpdateTip}
               initialConfig={assessmentConfig} 
               onShowPremium={() => setShowPremiumModal(true)}
               lang={language}
             />
           )}
           {currentView === AppView.SOLUTIONS && (
             <SolutionLibrary onConsult={handleConsult} lang={language} />
           )}
           {currentView === AppView.STORIES && (
             <StoryGenerator 
               onShowPremium={() => setShowPremiumModal(true)}
               isPremium={isPremium}
               onStoryGenerated={(skill) => setUserContext(`Story: ${skill}`)}
               lang={language}
             />
           )}
        </div>
      </main>
    </div>
  );
};

export default App;