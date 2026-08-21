import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Send } from 'lucide-react';

export const VoiceSearchModal = ({ isOpen, onClose, onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = 'en-US';

        reco.onstart = () => {
          setIsListening(true);
          setErrorMsg('');
        };

        reco.onresult = (event) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };

        reco.onerror = (event) => {
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setErrorMsg('Microphone access was denied. Please allow microphone permissions in your browser.');
          } else {
            setErrorMsg(`Voice recognition note: ${event.error}. You can also type your query below.`);
          }
        };

        reco.onend = () => {
          setIsListening(false);
        };

        setRecognition(reco);
      } else {
        setErrorMsg('Web Speech API is not supported in this browser environment. You can enter speech query manually.');
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSimulatedVoice = (sampleText) => {
    setTranscript(sampleText);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) {
      onSearch(transcript, 'voice');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">Voice Product Search</h3>
          <p className="text-sm text-slate-400">Speak naturally e.g. "Find me the cheapest iPhone 16 128 GB"</p>
        </div>

        {/* Listening Animation / Mic Button */}
        <div className="flex flex-col items-center justify-center my-6">
          <button
            onClick={toggleListening}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-rose-500 shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/20 scale-105'
                : 'bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 text-white animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}

            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
                <span className="absolute -inset-3 rounded-full border border-rose-500/40 animate-pulse" />
              </>
            )}
          </button>
          <span className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isListening ? 'Listening now... Speak into microphone' : 'Tap Microphone to Speak'}
          </span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
            {errorMsg}
          </div>
        )}

        {/* Transcript Input / Editor */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Recognized Speech Query (Editable):
            </label>
            <div className="relative">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Speech transcript will appear here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-cyan-500 transition"
              />
              <button
                type="submit"
                disabled={!transcript.trim()}
                className="absolute right-2 top-2 p-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-lg transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Voice Demo Presets */}
          <div>
            <span className="text-xs text-slate-500 block mb-1">Try sample voice commands:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSimulatedVoice("Find me the cheapest iPhone 16 128 GB")}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition"
              >
                "Find me the cheapest iPhone 16 128 GB"
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedVoice("Compare Sony noise canceling headphones")}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition"
              >
                "Compare Sony noise canceling headphones"
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedVoice("Samsung 55 inch smart TV under 45000")}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition"
              >
                "Samsung 55 inch smart TV under 45000"
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
