import { AnimatePresence, motion } from 'framer-motion';
import { Globe, LayoutGrid, Mic, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProviderDashboard from './components/ProviderDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import { cn } from './lib/utils';

function App() {
  const { t, i18n } = useTranslation();
  const [role, setRole] = useState<'worker' | 'provider'>('provider');
  const [scrolled, setScrolled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-['Inter'] selection:bg-white/20">
        
        {/* Enhanced 3D Background with Animated Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-50">
          <motion.div 
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-[150px]"
          />
          <motion.div 
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-emerald-600/20 via-teal-600/20 to-cyan-600/20 blur-[150px]"
          />
          <motion.div 
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-500/10 blur-[200px]"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* Enhanced 3D Header with Glassmorphism */}
        <header className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-700",
          scrolled 
            ? "bg-[#0A0A0A]/70 backdrop-blur-3xl border-b border-white/[0.08] py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" 
            : "bg-transparent py-6"
        )}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]"
              >
                <LayoutGrid className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Sahayak</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-1 bg-white/[0.05] border border-white/[0.1] rounded-full backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)] transition-all duration-300"
            >
              <motion.button 
                onClick={() => setRole('provider')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  role === 'provider' 
                    ? "bg-gradient-to-r from-white to-blue-50 text-black shadow-[0_4px_20px_rgba(255,255,255,0.3)]" 
                    : "text-[#A1A1A1] hover:text-white hover:bg-white/5"
                )}
              >
                <Search className="w-4 h-4" />
                {t('job_provider')}
              </motion.button>
              <motion.button 
                onClick={() => setRole('worker')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  role === 'worker' 
                    ? "bg-gradient-to-r from-white to-blue-50 text-black shadow-[0_4px_20px_rgba(255,255,255,0.3)]" 
                    : "text-[#A1A1A1] hover:text-white hover:bg-white/5"
                )}
              >
                <User className="w-4 h-4" />
                {t('worker')}
              </motion.button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <motion.button 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-auto px-4 h-10 rounded-full border border-white/[0.1] bg-white/[0.03] backdrop-blur-xl flex items-center justify-center text-[#A1A1A1] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.2] hover:shadow-[0_4px_20px_rgba(139,92,246,0.2)] transition-all gap-2"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">{i18n.language}</span>
              </motion.button>
              
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-32 bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col py-2"
              >
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'Hindi' },
                  { code: 'pa', label: 'Punjabi' },
                  { code: 'gu', label: 'Gujarati' },
                  { code: 'kn', label: 'Kannada' },
                  { code: 'ta', label: 'Tamil' },
                  { code: 'te', label: 'Telugu' },
                  { code: 'rj', label: 'Rajasthani' }
                ].map((lang) => (
                  <button 
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${i18n.language === lang.code ? 'text-blue-400 font-bold' : 'text-white'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  role === 'worker' 
                    ? <WorkerDashboard key="worker" /> 
                    : <ProviderDashboard key="provider" />
                } 
              />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Enhanced Voice Assistant with Visual Feedback */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[99] flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/20 rounded-3xl p-12 max-w-md w-full mx-4 relative overflow-hidden"
              >
                {/* Animated background */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
                />

                <div className="relative z-10 flex flex-col items-center gap-6">
                  {/* Animated Microphone */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.5)]"
                  >
                    <Mic className="w-12 h-12 text-white" />
                  </motion.div>

                  {/* Listening Text */}
                  <div className="text-center">
                    <motion.h3
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      Listening...
                    </motion.h3>
                    <p className="text-[#A1A1A1] text-sm">
                      {role === 'provider' ? 'Say a skill name to search (e.g., "plumber", "electrician")' : 'Speak to search for jobs'}
                    </p>
                  </div>

                  {/* Live Transcript */}
                  {transcript && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl"
                    >
                      <p className="text-xs text-[#A1A1A1] mb-1">You said:</p>
                      <p className="text-white font-semibold">{transcript}</p>
                    </motion.div>
                  )}

                  {/* Audio Visualizer */}
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: ["20px", "40px", "20px"],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                        className="w-1.5 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript Notification */}
        <AnimatePresence>
          {showTranscript && transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 20 }}
              className="fixed bottom-28 right-8 z-[98] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/20 rounded-2xl p-4 max-w-xs shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
                <div className="flex-1">
                  <p className="text-emerald-400 font-semibold text-sm mb-1">Search Updated!</p>
                  <p className="text-white text-sm">"{transcript}"</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced 3D Voice FAB */}
        <motion.button 
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, 0],
            boxShadow: "0 20px 60px rgba(139,92,246,0.4)"
          }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          onClick={() => {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
              const recognition = new SpeechRecognition();
              recognition.continuous = false;
              recognition.interimResults = true;
              
              // Set language based on current app language
              const langMap: any = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'pa': 'pa-IN',
                'gu': 'gu-IN',
                'kn': 'kn-IN',
                'ta': 'ta-IN',
                'te': 'te-IN',
                'rj': 'hi-IN'
              };
              recognition.lang = langMap[i18n.language] || 'en-US';
              
              recognition.onstart = () => {
                setIsListening(true);
                setTranscript('');
                setShowTranscript(false);
              };
              
              recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
                
                // If final result, dispatch search event
                if (event.results[current].isFinal) {
                  window.dispatchEvent(new CustomEvent('voiceSearch', { detail: transcriptText }));
                }
              };
              
              recognition.onend = () => {
                setIsListening(false);
                if (transcript) {
                  setShowTranscript(true);
                  setTimeout(() => setShowTranscript(false), 3000);
                }
              };
              
              recognition.onerror = (event: any) => {
                setIsListening(false);
                console.error("Speech recognition error:", event.error);
                if (event.error === 'no-speech') {
                  setTranscript('No speech detected. Please try again.');
                } else if (event.error === 'not-allowed') {
                  setTranscript('Microphone access denied. Please allow microphone access.');
                } else {
                  setTranscript(`Error: ${event.error}`);
                }
                setShowTranscript(true);
                setTimeout(() => setShowTranscript(false), 3000);
              };
              
              recognition.start();
            } else {
              alert("Voice Assistant is not supported in this browser. Please use Chrome, Edge, or Safari.");
            }
          }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-white via-blue-50 to-purple-100 text-black rounded-full shadow-[0_15px_50px_rgba(139,92,246,0.4)] flex items-center justify-center z-[100] group border-2 border-white/50 cursor-pointer backdrop-blur-xl"
        >
          <Mic className="w-6 h-6 group-hover:scale-125 transition-all duration-300" />
          <motion.div 
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full border-2 border-purple-400"
          />
          <motion.div 
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute inset-0 rounded-full border-2 border-blue-400"
          />
        </motion.button>
      </div>
    </Router>
  );
}

export default App;
