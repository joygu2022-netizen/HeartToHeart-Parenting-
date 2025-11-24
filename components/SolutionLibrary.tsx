import React, { useState } from 'react';
import { getSolutions } from '../constants';
import { generateScenarioExample } from '../services/gemini';
import { ChildProfile, UserRole, Language } from '../types';
import { UI_TEXT } from '../translations';
import { ChevronDown, ChevronUp, BookOpen, PlayCircle, Loader2, User, Sparkles } from 'lucide-react';

const SolutionLibrary: React.FC<{ onConsult: (topic: string) => void; lang: Language }> = ({ onConsult, lang }) => {
  const t = UI_TEXT[lang].solutions;
  const SOLUTIONS = getSolutions(lang);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [contextRole, setContextRole] = useState<UserRole>('parent');
  const [contextAge, setContextAge] = useState<string>('5');
  const [generatedScenarios, setGeneratedScenarios] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleGenerateScenario = async (solutionId: string, solutionTitle: string) => {
    setIsGenerating(solutionId);
    
    const tempProfile: ChildProfile = {
      role: contextRole,
      exactAge: contextAge,
      gender: 'prefer_not_to_say',
      ageGroup: ''
    };

    const script = await generateScenarioExample(tempProfile, solutionTitle, lang);
    setGeneratedScenarios(prev => ({ ...prev, [solutionId]: script }));
    setIsGenerating(null);
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-warm-200 overflow-y-auto flex flex-col">
      <div className="p-6 bg-gradient-to-r from-warm-100 to-white border-b border-warm-100">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <BookOpen className="text-warm-600" />
          {t.title}
        </h2>
        <p className="text-stone-600 mt-2 text-sm">{t.subtitle}</p>
      
        <div className="mt-4 p-4 bg-white/50 rounded-xl border border-warm-200 flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{t.contextSetting}</span>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setContextRole('parent')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${contextRole === 'parent' ? 'bg-warm-500 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                >
                    {t.roleParent}
                </button>
                <button 
                  onClick={() => setContextRole('teacher')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${contextRole === 'teacher' ? 'bg-indigo-500 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                >
                    {t.roleTeacher}
                </button>
            </div>
            <div className="flex items-center gap-2">
                <label className="text-sm text-stone-600">{t.childAge}</label>
                <input 
                  type="text" 
                  value={contextAge}
                  onChange={(e) => setContextAge(e.target.value)}
                  className="w-20 px-2 py-1.5 text-sm border border-warm-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-warm-400"
                />
            </div>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1">
        {SOLUTIONS.map((solution) => {
          const strategies = contextRole === 'teacher' ? solution.strategiesTeacher : solution.strategiesParent;
          
          return (
            <div
              key={solution.id}
              className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                expandedId === solution.id
                  ? 'bg-warm-50 border-warm-300 shadow-md'
                  : 'bg-white border-stone-100 hover:border-warm-200'
              }`}
            >
              <button
                onClick={() => setExpandedId(expandedId === solution.id ? null : solution.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl filter drop-shadow-sm">{solution.icon}</span>
                  <div>
                    <h3 className="font-bold text-stone-800 text-lg">{solution.title}</h3>
                    <p className="text-stone-500 text-sm italic">{solution.subtitle}</p>
                  </div>
                </div>
                {expandedId === solution.id ? (
                  <ChevronUp className="text-warm-500" />
                ) : (
                  <ChevronDown className="text-stone-300" />
                )}
              </button>

              {expandedId === solution.id && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                  <div className="h-px w-full bg-warm-200 mb-4"></div>
                  <p className="text-stone-700 mb-4 leading-relaxed">
                    {solution.description}
                  </p>
                  
                  <h4 className="font-bold text-warm-700 mb-2 text-sm uppercase tracking-wide">
                    {contextRole === 'teacher' ? t.teacherAdvice : t.parentAdvice}
                  </h4>
                  <ul className="space-y-3 mb-6">
                    {strategies.map((strategy, idx) => (
                      <li key={idx} className="flex gap-3 text-stone-700 text-sm">
                        <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${contextRole === 'teacher' ? 'bg-indigo-400' : 'bg-warm-400'}`}></span>
                        <span dangerouslySetInnerHTML={{ __html: strategy.replace(/\*\*(.*?)\*\*/g, '<strong class="text-stone-900">$1</strong>') }} />
                      </li>
                    ))}
                  </ul>

                  <div className="bg-white rounded-xl border border-warm-200 p-4 mb-5 shadow-sm">
                    <h4 className="font-bold text-stone-800 mb-2 text-sm flex items-center gap-2">
                      <Sparkles size={16} className="text-warm-500" /> 
                      {t.kidSkill}
                    </h4>
                    <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                      {solution.kidSkill}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-warm-200 p-4 mb-4">
                     <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-stone-800 flex items-center gap-2 text-sm">
                           <PlayCircle size={16} className={contextRole === 'teacher' ? 'text-indigo-500' : 'text-warm-500'} /> 
                           {t.scenario}
                        </h5>
                        {!generatedScenarios[solution.id] && (
                            <button 
                              onClick={() => handleGenerateScenario(solution.id, solution.title)}
                              disabled={isGenerating === solution.id}
                              className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors ${
                                contextRole === 'teacher' 
                                  ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                                  : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                              }`}
                            >
                               {isGenerating === solution.id ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                               {t.generateScript.replace('{age}', contextAge)}
                            </button>
                        )}
                     </div>
                     
                     {generatedScenarios[solution.id] ? (
                         <div className="prose prose-sm max-w-none bg-stone-50 p-4 rounded-lg border border-stone-100">
                            {generatedScenarios[solution.id].split('\n').map((line, i) => (
                               <p key={i} className="mb-1 text-stone-700 text-xs leading-relaxed">
                                 {line.includes(':') ? <strong>{line.split(':')[0]}:</strong> : ''} {line.includes(':') ? line.split(':')[1] : line}
                               </p>
                            ))}
                            <button 
                              onClick={() => handleGenerateScenario(solution.id, solution.title)}
                              className={`text-xs mt-2 underline ${contextRole === 'teacher' ? 'text-indigo-400 hover:text-indigo-600' : 'text-warm-400 hover:text-warm-600'}`}
                            >
                              {t.regenerate}
                            </button>
                         </div>
                     ) : (
                         <p className="text-xs text-stone-400 italic">
                             {t.generating}
                         </p>
                     )}
                  </div>

                  <button
                    onClick={() => onConsult(`${contextRole} asks about ${solution.title} for ${contextAge} year old.`)}
                    className="w-full py-3 bg-warm-50 border border-warm-300 text-warm-700 rounded-xl text-sm font-bold hover:bg-warm-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <User size={16} /> {t.consult}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SolutionLibrary;