import React, { useState, useEffect } from 'react';
import { Mic, MicOff, RefreshCw, Send, Sparkles, X, Volume2 } from 'lucide-react';
import { TourneePatient } from '../data/mockPatients';

interface VoiceRouteControlProps {
  currentPatients: TourneePatient[];
  onRouteUpdated: (updatedItems: Array<{ patientId: string; newTime: string; newOrderIndex: number }>) => void;
  onSuccessToast?: (msg: string) => void;
}

export const VoiceRouteControl: React.FC<VoiceRouteControlProps> = ({
  currentPatients,
  onRouteUpdated,
  onSuccessToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);

  useEffect(() => {
    // Web Speech API initialization if available
    const windowWithSpeech = window as any;
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'fr-FR';
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setVoiceText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, []);

  const toggleListening = () => {
    if (!isOpen) setIsOpen(true);

    if (isListening) {
      if (speechRecognition) speechRecognition.stop();
      setIsListening(false);
    } else {
      if (speechRecognition) {
        setVoiceText('');
        try {
          speechRecognition.start();
          setIsListening(true);
        } catch (e) {
          console.warn('Speech start error', e);
        }
      } else {
        // Fallback simulate voice speech
        setIsListening(true);
        setTimeout(() => {
          setVoiceText("Passe voir Mme Petit à Chantenay à 09h00 au lieu de 10h00");
          setIsListening(false);
        }, 2000);
      }
    }
  };

  const handleSendVoiceInstruction = async (textToSend?: string) => {
    const finalInstruction = textToSend || voiceText;
    if (!finalInstruction.trim()) return;

    setIsProcessing(true);
    if (isListening && speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }

    try {
      const res = await fetch('/api/route/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceInstruction: finalInstruction,
          currentPatients
        })
      });

      const data = await res.json();

      if (data && data.updatedRoute && Array.isArray(data.updatedRoute)) {
        onRouteUpdated(data.updatedRoute);
        setIsOpen(false);
        setVoiceText('');
        if (onSuccessToast) {
          onSuccessToast('Itinéraire réordonné selon vos consignes vocales !');
        }
      } else {
        alert("L'analyse de l'itinéraire n'a pas pu être complétée.");
      }
    } catch (err) {
      console.error('Failed to optimize route:', err);
      alert("Erreur lors de l'optimisation d'itinéraire.");
    } finally {
      setIsProcessing(false);
    }
  };

  const presetExamples = [
    "Passe voir Mme Petit à Chantenay à 09h00 au lieu de 10h00",
    "Mets M. Moreau en premier à 08h00",
    "Passe voir Mme Bernard en dernier de la tournée",
    "Avance le rendez-vous de M. Martin d'une demi-heure"
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3">
        {isOpen && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-80 md:w-96 animate-in fade-in slide-in-from-bottom-4 duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-100 text-[#006591] rounded-lg">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Ajustement Vocal d'Itinéraire</h4>
                  <p className="text-[10px] text-slate-500">Dictée en temps réel CareVoice</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (isListening && speechRecognition) speechRecognition.stop();
                  setIsListening(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction input / transcript */}
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  rows={3}
                  value={voiceText}
                  onChange={e => setVoiceText(e.target.value)}
                  placeholder="Ex: Passe voir Mme Petit à Chantenay à 9h00 au lieu de 10h00..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#0ea5e9] outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2.5 bottom-2.5 p-2 rounded-full cursor-pointer transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title={isListening ? 'Arrêter la dictée' : 'Microphone'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isListening && (
                <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>Écoute en cours... Parlez naturellement</span>
                </div>
              )}

              {/* Example Preset Chips */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Exemples rapides :</p>
                <div className="flex flex-col gap-1">
                  {presetExamples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setVoiceText(ex);
                        handleSendVoiceInstruction(ex);
                      }}
                      className="text-left text-[11px] text-slate-600 bg-slate-100 hover:bg-sky-50 hover:text-[#006591] p-1.5 rounded-lg border border-slate-200/60 transition-colors cursor-pointer truncate"
                    >
                      "{ex}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Action submit button */}
              <button
                onClick={() => handleSendVoiceInstruction()}
                disabled={isProcessing || !voiceText.trim()}
                className="w-full py-2.5 bg-[#006591] hover:bg-[#004d70] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Réorganisation de la tournée...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-300" />
                    <span>Appliquer et Réordonner la Tournée</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all cursor-pointer flex items-center gap-2 ${
            isOpen
              ? 'bg-slate-800 text-white hover:bg-slate-900'
              : 'bg-[#006591] hover:bg-[#004d70] text-white ring-4 ring-sky-100 active:scale-95'
          }`}
          title="Commande vocale d'ajustement de tournée"
        >
          <Mic className="w-6 h-6" />
          <span className="hidden sm:inline font-bold text-xs pr-1">Consigne Vocale</span>
        </button>
      </div>
    </>
  );
};
