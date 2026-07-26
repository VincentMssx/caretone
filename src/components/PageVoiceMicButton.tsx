import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles, X, Check, Volume2, Command } from 'lucide-react';

interface PageVoiceMicButtonProps {
  pageTitle: string;
  placeholderExamples: string[];
  onVoiceCommand: (text: string) => void;
}

export const PageVoiceMicButton: React.FC<PageVoiceMicButtonProps> = ({
  pageTitle,
  placeholderExamples,
  onVoiceCommand
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Web Speech Recognition setup if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'fr-FR';

      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleStartRecording = () => {
    setTranscript('');
    setFeedback(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Fallback timer simulated voice input if speech recognition is unavailable
      setIsRecording(true);
      setTranscript("Modifications vocales en cours...");
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    }
    setIsRecording(false);
  };

  const handleApplyCommand = () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      onVoiceCommand(transcript);
      setIsProcessing(false);
      setFeedback("Commande exécutée avec succès !");
      setTimeout(() => {
        setFeedback(null);
        setIsOpen(false);
        setTranscript('');
      }, 1500);
    }, 600);
  };

  return (
    <>
      {/* Floating Microphone Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        title={`Commande vocale pour la page ${pageTitle}`}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 bg-gradient-to-r from-[#0ea5e9] to-[#006591] hover:from-[#0284c7] hover:to-[#004c6e] text-white p-3 md:p-3.5 rounded-2xl shadow-xl hover:shadow-2xl flex items-center gap-2 font-bold text-xs transition-all duration-200 active:scale-95 cursor-pointer border border-white/20"
      >
        <div className="relative">
          <Mic className="w-5 h-5 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white" />
        </div>
        <span className="hidden sm:inline">Commande Vocale Page</span>
      </button>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-5">
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#006591] flex items-center justify-center font-bold">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Modification Vocale : {pageTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Dictez vos instructions pour agir sur les données ouvertes
                </p>
              </div>
            </div>

            {/* Examples Chips */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Command className="w-3 h-3 text-[#0ea5e9]" /> Exemples de commandes sur cette page :
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {placeholderExamples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setTranscript(ex)}
                    className="text-[11px] bg-white hover:bg-sky-50 text-slate-700 hover:text-[#006591] px-2.5 py-1 rounded-lg border border-slate-200/70 transition-colors cursor-pointer text-left font-medium"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>

            {/* Dictation Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Votre Dictée Vocale :</label>
                {isRecording && (
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Écoute en cours...
                  </span>
                )}
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Appuyez sur le micro et dictez votre modification..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#0ea5e9] outline-none resize-none leading-relaxed text-slate-800"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white'
                    }`}
                  >
                    {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Arrêter' : 'Parler'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback message */}
            {feedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                disabled={!transcript.trim() || isProcessing}
                onClick={handleApplyCommand}
                className="px-5 py-2 bg-[#006591] hover:bg-[#004c6e] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Application...' : 'Appliquer la commande'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
