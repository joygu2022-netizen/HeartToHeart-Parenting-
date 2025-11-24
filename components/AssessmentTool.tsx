import React, { useState, useEffect } from 'react';
import { getAgeGroups, getAssessmentLibrary, getMilestones } from '../constants';
import { generateAssessmentReport, generateContextualTip } from '../services/gemini';
import { ChildProfile, AssessmentDefinition, UserRole, Language } from '../types';
import { UI_TEXT } from '../translations';
import { 
  ChevronRight, CheckCircle2, RefreshCw, Award, Baby, ArrowRight, 
  UserCircle2, BrainCircuit, School, Home, Stethoscope, ClipboardList, Sparkles, Mail 
} from 'lucide-react';

interface AssessmentToolProps {
  onAssessmentComplete?: (tip: string) => void;
  initialConfig?: {
    id: string;
    profile?: Partial<ChildProfile>;
  } | null;
  onShowPremium: () => void;
  lang: Language;
}

const AssessmentTool: React.FC<AssessmentToolProps> = ({ onAssessmentComplete, initialConfig, onShowPremium, lang }) => {
  const t = UI_TEXT[lang].assessment;
  const [step, setStep] = useState<'select-role' | 'select-group' | 'profile-input' | 'dashboard' | 'questions' | 'report'>('select-role');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentDefinition | null>(null);
  
  // Dynamic Data
  const AGE_GROUPS = getAgeGroups(lang);
  const ASSESSMENT_LIBRARY = getAssessmentLibrary(lang);
  const UNIVERSAL_MILESTONES = getMilestones(lang);

  const [childProfile, setChildProfile] = useState<Partial<ChildProfile>>({
    gender: 'prefer_not_to_say',
    role: 'parent' 
  });

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      const { id, profile } = initialConfig;
      let foundAssessment: AssessmentDefinition | null = null;
      let foundAgeGroupId: string | null = null;

      for (const [ageId, tests] of Object.entries(ASSESSMENT_LIBRARY)) {
        const test = tests.find(t => t.id === id);
        if (test) {
          foundAssessment = test;
          foundAgeGroupId = ageId;
          break;
        }
      }

      if (foundAssessment && foundAgeGroupId) {
        setSelectedAgeGroup(foundAgeGroupId);
        setChildProfile(prev => ({
          ...prev,
          ageGroup: AGE_GROUPS.find(a => a.id === foundAgeGroupId)?.label,
          ...(profile || {})
        }));
        setSelectedAssessment(foundAssessment);
        setAnswers({});
        setReport(null);

        if (profile?.exactAge) {
          setStep('questions');
        } else {
          setStep('profile-input');
        }
      }
    }
  }, [initialConfig, lang]); // Re-run if lang changes

  const handleRoleSelect = (role: UserRole) => {
    setChildProfile(prev => ({ ...prev, role }));
    setStep('select-group');
  };

  const handleGroupSelect = (ageId: string) => {
    setSelectedAgeGroup(ageId);
    setChildProfile(prev => ({ ...prev, ageGroup: AGE_GROUPS.find(a => a.id === ageId)?.label }));
    setStep('profile-input');
  };

  const handleProfileSubmit = () => {
    if (childProfile.exactAge) {
      if (selectedAssessment) {
        setStep('questions');
      } else {
        setStep('dashboard');
      }
    }
  };

  const startAssessment = (assessment: AssessmentDefinition) => {
    setSelectedAssessment(assessment);
    setAnswers({});
    setStep('questions');
  };

  const handleSubmitAssessment = async () => {
    if (!selectedAssessment || !childProfile.exactAge) return;
    
    setIsLoading(true);
    
    const formattedAnswers = selectedAssessment.questions.map((q, idx) => ({
      question: q,
      answer: answers[idx] || 'Unsure'
    }));

    const [result, tip] = await Promise.all([
      generateAssessmentReport(
        childProfile as ChildProfile,
        selectedAssessment.title,
        formattedAnswers,
        lang
      ),
      generateContextualTip(`Child age ${childProfile.exactAge}, Issue: ${selectedAssessment.title}, Role: ${childProfile.role}`, false, lang)
    ]);

    setReport(result);
    if (onAssessmentComplete && tip) {
      onAssessmentComplete(tip);
    }
    setStep('report');
    setIsLoading(false);
  };

  const resetToDashboard = () => {
    setStep('dashboard');
    setAnswers({});
    setReport(null);
    setSelectedAssessment(null);
  };

  const fullReset = () => {
    setStep('select-role');
    setChildProfile({ gender: 'prefer_not_to_say', role: 'parent' });
    setSelectedAgeGroup(null);
    setAnswers({});
    setReport(null);
    setSelectedAssessment(null);
  };

  // --- RENDER: Report View ---
  if (step === 'report' && report) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b bg-indigo-50 border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full shadow-sm bg-white text-indigo-600">
               <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-900">
                {t.reportTitle}
              </h2>
              <p className="text-indigo-700 text-sm">
                {selectedAssessment?.title} | {childProfile.exactAge}
              </p>
            </div>
          </div>
          
          <button onClick={onShowPremium} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-bold text-sm">
            <Mail size={16} /> {t.sendEmail}
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-warm-50/30">
          <div className="prose prose-stone prose-sm max-w-none">
            {report.split('\n').map((line, i) => (
              <p key={i} className="mb-2 text-stone-700 leading-relaxed">
                {line.startsWith('**') ? <strong className="text-warm-700 block mt-4 mb-2 text-lg">{line.replace(/\*\*/g, '')}</strong> : line}
              </p>
            ))}
          </div>

          <button onClick={onShowPremium} className="md:hidden w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-md font-bold text-sm">
            <Mail size={16} /> {t.sendEmail}
          </button>

          <div className="flex gap-4 mt-8">
            <button onClick={resetToDashboard} className="flex-1 py-3 bg-white border border-warm-300 text-warm-700 rounded-xl font-semibold hover:bg-warm-50 transition-colors">
                {t.backToList}
            </button>
            <button onClick={fullReset} className="flex-1 py-3 bg-warm-500 hover:bg-warm-600 text-white rounded-xl font-semibold transition-colors">
                {t.newAssessment}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: Questions View ---
  if (step === 'questions' && selectedAssessment) {
    const questions = selectedAssessment.questions;
    const progress = (Object.keys(answers).length / questions.length) * 100;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 h-full flex flex-col">
        <div className="bg-indigo-50 p-4 border-b border-indigo-100">
             <div className="flex items-start gap-3">
               <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 flex-shrink-0 mt-1">
                 <ClipboardList size={20} />
               </div>
               <div>
                 <h4 className="font-bold text-indigo-900 mb-1">{selectedAssessment.title}</h4>
                 <p className="text-sm text-indigo-800 leading-relaxed">
                   {selectedAssessment.description}
                 </p>
               </div>
             </div>
        </div>

        <div className="p-4 border-b border-warm-100 flex items-center justify-between bg-warm-50">
          <button onClick={() => setStep('dashboard')} className="text-sm text-stone-500 hover:text-warm-600">
            &larr; {t.back}
          </button>
          <span className="font-bold text-stone-700">
            {t.progress} ({Object.keys(answers).length}/{questions.length})
          </span>
        </div>
        
        <div className="h-1 w-full bg-warm-100">
          <div className="h-full bg-warm-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-white">
              <p className="font-medium text-lg text-stone-800 mb-4">{idx + 1}. {q}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[t.options.always, t.options.sometimes, t.options.rarely, t.options.never].map((option) => (
                  <button
                    key={option}
                    onClick={() => setAnswers(prev => ({ ...prev, [idx]: option }))}
                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all border ${
                      answers[idx] === option
                        ? 'bg-warm-100 border-warm-400 text-warm-800 ring-2 ring-warm-200'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-warm-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-warm-100 bg-warm-50 rounded-b-2xl">
          <button
            onClick={handleSubmitAssessment}
            disabled={Object.keys(answers).length < questions.length || isLoading}
            className="w-full py-3.5 bg-warm-600 text-white rounded-xl font-bold shadow-lg shadow-warm-200 hover:bg-warm-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <> <RefreshCw className="animate-spin" size={20} /> {t.analyzing}... </>
            ) : (
              <> {t.generate} <CheckCircle2 size={20} /> </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: Dashboard ---
  if (step === 'dashboard' && selectedAgeGroup) {
      const availableTests = ASSESSMENT_LIBRARY[selectedAgeGroup] || [];
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 h-full flex flex-col p-6 overflow-y-auto">
             <div className="mb-6 flex items-center justify-between">
                 <button onClick={() => setStep('profile-input')} className="text-stone-400 hover:text-stone-600 flex items-center gap-1 text-sm">
                    &larr; {t.childInfo}
                 </button>
                 <div className="px-3 py-1 bg-warm-100 text-warm-700 rounded-full text-xs font-bold uppercase">
                     {childProfile.role === 'teacher' ? t.teacherRole : t.parentRole}
                 </div>
             </div>

             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-stone-800">
                    {t.dashboardTitle}
                </h2>
                <p className="text-stone-500 mt-2">{t.dashboardDesc.replace('{context}', childProfile.role === 'teacher' ? 'Classroom' : 'Home')}</p>
             </div>

             <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-8">
                 <div className="flex items-center gap-2 mb-3">
                     <Baby className="text-blue-600" size={20} />
                     <h3 className="font-bold text-blue-900">{t.milestoneTitle}</h3>
                 </div>
                 <p className="text-sm text-blue-800 whitespace-pre-line leading-relaxed">
                   {UNIVERSAL_MILESTONES[selectedAgeGroup]}
                 </p>
             </div>

             <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                 <ClipboardList size={20} /> {t.availableTests}
             </h3>

             <div className="grid gap-4 md:grid-cols-2">
                 {availableTests.map(test => (
                     <button
                        key={test.id}
                        onClick={() => startAssessment(test)}
                        className="flex flex-col text-left p-5 border border-stone-200 rounded-2xl hover:border-warm-400 hover:shadow-md transition-all bg-white group"
                     >
                        <div className="flex justify-between items-start w-full mb-2">
                            <span className="font-bold text-lg text-stone-800 group-hover:text-warm-700">{test.title}</span>
                            <ArrowRight className="text-stone-300 group-hover:text-warm-500" size={20} />
                        </div>
                        <p className="text-stone-500 text-sm mb-4 flex-1">{test.description}</p>
                        <div className="flex gap-2">
                            {test.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-warm-50 text-warm-600 text-xs rounded-md">#{tag}</span>
                            ))}
                        </div>
                     </button>
                 ))}
             </div>
        </div>
      );
  }

  // --- RENDER: Profile Input ---
  if (step === 'profile-input') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 h-full flex flex-col p-8 items-center justify-center max-w-2xl mx-auto w-full">
         <div className="w-full">
           <button onClick={() => setStep('select-group')} className="text-stone-400 hover:text-stone-600 mb-6 flex items-center gap-1">
             &larr; {t.back}
           </button>
           
           <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
             <UserCircle2 className="text-warm-600" />
             {childProfile.role === 'teacher' ? t.studentInfo : t.childInfo}
           </h2>
           
           <div className="space-y-6">
             <div>
               <label className="block text-sm font-semibold text-stone-700 mb-2">{t.gender}</label>
               <div className="flex gap-4">
                 {[
                   { id: 'boy', label: t.boy }, 
                   { id: 'girl', label: t.girl }, 
                   { id: 'prefer_not_to_say', label: t.secret }
                 ].map(opt => (
                   <button
                     key={opt.id}
                     onClick={() => setChildProfile(prev => ({ ...prev, gender: opt.id as any }))}
                     className={`flex-1 py-3 border rounded-xl font-medium transition-all ${
                       childProfile.gender === opt.id 
                         ? 'bg-warm-100 border-warm-500 text-warm-800 ring-1 ring-warm-500' 
                         : 'border-stone-200 text-stone-600 hover:border-warm-300'
                     }`}
                   >
                     {opt.label}
                   </button>
                 ))}
               </div>
             </div>

             <div>
               <label className="block text-sm font-semibold text-stone-700 mb-2">{t.exactAge}</label>
               <input
                 type="text"
                 placeholder={t.exactAgePlaceholder}
                 value={childProfile.exactAge || ''}
                 onChange={(e) => setChildProfile(prev => ({ ...prev, exactAge: e.target.value }))}
                 className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-warm-400"
               />
               <p className="text-xs text-stone-400 mt-1">{t.exactAgeHint}</p>
             </div>

             <button 
               onClick={handleProfileSubmit}
               disabled={!childProfile.exactAge}
               className="w-full mt-4 py-4 bg-warm-600 text-white rounded-xl font-bold hover:bg-warm-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {selectedAssessment ? t.start : t.viewTests} <ArrowRight size={18} />
             </button>
           </div>
         </div>
      </div>
    );
  }

  // --- RENDER: Age Group Selection ---
  if (step === 'select-group') {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 h-full flex flex-col p-6 overflow-y-auto">
            <button onClick={() => setStep('select-role')} className="text-stone-400 hover:text-stone-600 mb-4 flex items-center gap-1 w-fit">
                &larr; {t.changeRole}
            </button>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">{t.selectGroup}</h2>
                <p className="text-stone-500">{t.selectGroupDesc}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AGE_GROUPS.map((age) => (
                <button
                    key={age.id}
                    onClick={() => handleGroupSelect(age.id)}
                    className="group relative flex flex-col p-6 bg-warm-50 hover:bg-white border border-transparent hover:border-warm-300 rounded-2xl text-left transition-all hover:shadow-md"
                >
                    <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl font-bold text-warm-600">{age.range}</span>
                    <div className="w-8 h-8 rounded-full bg-white text-warm-400 flex items-center justify-center group-hover:bg-warm-500 group-hover:text-white transition-colors">
                        <ChevronRight size={18} />
                    </div>
                    </div>
                    <h3 className="font-bold text-stone-800 text-lg mb-1">{age.label}</h3>
                    <p className="text-sm text-stone-500">{age.description}</p>
                </button>
                ))}
            </div>
        </div>
      )
  }

  // --- RENDER: Role Selection ---
  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-warm-200 p-8 items-center justify-center">
      <div className="text-center mb-10 max-w-lg">
        <h1 className="text-3xl font-bold text-stone-800 mb-3">{t.title}</h1>
        <p className="text-stone-500 text-lg">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
         <button
            onClick={() => handleRoleSelect('parent')}
            className="flex flex-col items-center p-8 bg-warm-50 border-2 border-transparent hover:border-warm-400 rounded-3xl transition-all hover:shadow-lg group"
         >
            <div className="p-4 bg-white rounded-full shadow-sm text-warm-600 mb-4 group-hover:scale-110 transition-transform">
                <Home size={40} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">{t.parentRole}</h3>
            <p className="text-center text-stone-500 text-sm">{t.parentDesc}</p>
         </button>

         <button
            onClick={() => handleRoleSelect('teacher')}
            className="flex flex-col items-center p-8 bg-indigo-50 border-2 border-transparent hover:border-indigo-400 rounded-3xl transition-all hover:shadow-lg group"
         >
            <div className="p-4 bg-white rounded-full shadow-sm text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <School size={40} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">{t.teacherRole}</h3>
            <p className="text-center text-stone-500 text-sm">{t.teacherDesc}</p>
         </button>
      </div>
      
      <p className="mt-12 text-xs text-stone-400">{t.disclaimer}</p>
    </div>
  );
};

export default AssessmentTool;