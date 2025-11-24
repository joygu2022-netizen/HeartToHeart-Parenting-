import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../translations';

interface VoiceRecorderProps {
  onRecordingComplete: (base64Audio: string) => void;
  isProcessing: boolean;
  lang: Language;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, isProcessing, lang }) => {
  const t = UI_TEXT[lang].chat;
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording && duration >= 15) {
      stopRecording();
    }
  }, [duration, isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          onRecordingComplete(base64Data);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {isProcessing ? (
        <button disabled className="p-4 bg-gray-100 rounded-full text-gray-400 cursor-not-allowed">
          <Loader2 className="w-6 h-6 animate-spin" />
        </button>
      ) : isRecording ? (
        <button
          onClick={stopRecording}
          className="p-4 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all shadow-lg animate-pulse flex items-center gap-1"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      ) : (
        <button
          onClick={startRecording}
          className="p-4 bg-warm-100 text-warm-600 rounded-full hover:bg-warm-200 transition-all shadow-md"
          title={lang === 'zh' ? "点击录音咨询 (限时15秒)" : "Hold to record (15s limit)"}
        >
          <Mic className="w-6 h-6" />
        </button>
      )}
      {isRecording && (
        <span className="absolute -top-8 whitespace-nowrap text-xs font-semibold text-red-500 animate-pulse bg-white px-2 py-1 rounded-full shadow-sm border border-red-100">
          {t.recording} {duration}s / 15s
        </span>
      )}
    </div>
  );
};

export default VoiceRecorder;