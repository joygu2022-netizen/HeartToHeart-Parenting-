import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, X, FileAudio, FileVideo, ClipboardCheck } from 'lucide-react';
import { Message, Attachment, ChildProfile, Language } from '../types';
import { sendMessageToGemini } from '../services/gemini';
import { UI_TEXT } from '../translations';
import VoiceRecorder from './VoiceRecorder';

interface ChatInterfaceProps {
  onNavigateToAssessment?: (id: string, initialProfile?: Partial<ChildProfile>) => void;
  onUserActivity?: (content: string) => void;
  lang: Language;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigateToAssessment, onUserActivity, lang }) => {
  const t = UI_TEXT[lang].chat;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message when language changes
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'model')) {
        setMessages([
            {
              id: '1',
              role: 'model',
              content: t.welcome,
              type: 'text',
              timestamp: Date.now()
            }
        ]);
    }
  }, [lang, t.welcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, attachments]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        const base64Data = base64String.split(',')[1];
        
        let type: 'image' | 'video' | 'audio' = 'image';
        if (file.type.startsWith('video/')) type = 'video';
        if (file.type.startsWith('audio/')) type = 'audio';

        const newAttachment: Attachment = {
          mimeType: file.type,
          data: base64Data,
          previewUrl: URL.createObjectURL(file),
          type: type
        };

        setAttachments(prev => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (text: string, directAudio?: Attachment) => {
    if ((!text.trim() && attachments.length === 0 && !directAudio) || isTyping) return;

    const currentAttachments = directAudio ? [directAudio] : [...attachments];

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: directAudio ? t.userMsg : text,
      attachments: currentAttachments,
      type: 'text',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAttachments([]);
    setIsTyping(true);

    if (onUserActivity && text.trim().length > 5) {
      onUserActivity(text);
    }

    // Call API
    const responseText = await sendMessageToGemini(text, currentAttachments, lang);

    const modelMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText,
      type: 'text',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
  };

  const handleRecorderComplete = (base64: string) => {
    const audioAttachment: Attachment = {
      mimeType: 'audio/webm',
      data: base64,
      type: 'audio'
    };
    handleSendMessage('', audioAttachment);
  };

  const handleLinkClick = (query: string) => {
    if (!onNavigateToAssessment) return;
    const [id, search] = query.split('?');
    const params = new URLSearchParams(search);
    
    const initialProfile: Partial<ChildProfile> = {};
    if (params.get('age')) initialProfile.exactAge = params.get('age') || undefined;
    if (params.get('gender')) initialProfile.gender = params.get('gender') as any;
    if (params.get('role')) initialProfile.role = params.get('role') as any;

    onNavigateToAssessment(id, initialProfile);
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\[.*?\]\(assessment:.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\(assessment:(.*?)\)/);
      if (match) {
        const [_, text, query] = match;
        return (
          <button 
            key={index} 
            onClick={() => handleLinkClick(query)} 
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-bold text-sm hover:bg-indigo-100 hover:underline align-baseline transition-colors border border-indigo-200"
          >
            <ClipboardCheck size={14} />
            {text}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderAttachmentPreview = (att: Attachment) => {
    if (att.type === 'image') {
      return <img src={att.previewUrl} alt="upload" className="w-full h-full object-cover" />;
    }
    if (att.type === 'video') {
      return <div className="flex items-center justify-center w-full h-full bg-stone-900"><FileVideo className="text-white" /></div>;
    }
    return <div className="flex items-center justify-center w-full h-full bg-warm-200"><FileAudio className="text-warm-700" /></div>;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-warm-100 p-4 border-b border-warm-200 flex items-center gap-3">
        <div className="bg-white p-2 rounded-full shadow-sm">
           <Bot className="w-6 h-6 text-warm-600" />
        </div>
        <div>
          <h2 className="font-bold text-stone-800">{t.title}</h2>
          <p className="text-xs text-stone-500">{t.subtitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-warm-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-warm-500 text-white' : 'bg-white border border-warm-200 text-warm-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className="flex flex-col gap-2">
                 {msg.attachments && msg.attachments.length > 0 && (
                   <div className="flex flex-wrap gap-2 justify-end">
                     {msg.attachments.map((att, idx) => (
                       <div key={idx} className="w-32 h-32 rounded-lg overflow-hidden border border-warm-200 bg-black/5">
                         {att.previewUrl && (att.type === 'image' || att.type === 'video') ? (
                           att.type === 'image' ? 
                             <img src={att.previewUrl} className="w-full h-full object-cover" alt="attachment" /> :
                             <video src={att.previewUrl} className="w-full h-full object-cover" controls />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-warm-100 text-warm-500">
                             <FileAudio size={32} />
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
                 {msg.content && (
                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-warm-500 text-white rounded-tr-none'
                          : 'bg-white text-stone-800 border border-warm-100 rounded-tl-none'
                      }`}
                    >
                      {renderMessageContent(msg.content)}
                    </div>
                 )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="flex max-w-[80%] gap-2">
               <div className="w-8 h-8 rounded-full bg-white border border-warm-200 text-warm-600 flex items-center justify-center">
                 <Sparkles size={16} />
               </div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-warm-100 shadow-sm flex items-center gap-1">
                 <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce delay-100"></span>
                 <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce delay-200"></span>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-warm-200">
        {attachments.length > 0 && (
          <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-warm-200">
                {renderAttachmentPreview(att)}
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <VoiceRecorder onRecordingComplete={handleRecorderComplete} isProcessing={isTyping} lang={lang} />
          
          <div className="flex-1 relative shadow-sm rounded-2xl">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }
              }}
              placeholder={t.placeholder}
              className="w-full pl-4 pr-20 py-3 bg-warm-50 border border-warm-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent resize-none h-[52px] max-h-32 text-stone-700 placeholder-stone-400 text-sm"
            />
            
            <div className="absolute right-2 bottom-2 flex gap-1">
               <input 
                 type="file" 
                 ref={fileInputRef}
                 className="hidden" 
                 accept="image/*,video/*,audio/*"
                 onChange={handleFileSelect}
               />
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="p-2 text-stone-400 hover:text-warm-600 hover:bg-warm-100 rounded-xl transition-colors"
                 title={t.uploadTip}
               >
                 <Paperclip size={18} />
               </button>
               <button
                onClick={() => handleSendMessage(inputText)}
                disabled={(!inputText.trim() && attachments.length === 0) || isTyping}
                className="p-2 bg-warm-500 text-white rounded-xl hover:bg-warm-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;