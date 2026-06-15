import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, User, LayoutGrid, Search, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import WorkerDashboard from './components/WorkerDashboard';
import ProviderDashboard from './components/ProviderDashboard';

function App() {
  const { t, i18n } = useTranslation();
  const [role, setRole] = useState<'worker' | 'provider'>('provider');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-['Inter'] selection:bg-white/20">
        
        {/* Subtle Noise Texture & Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* Ultra-Minimal Header */}
        <header className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled ? "bg-[#0A0A0A]/80 backdrop-blur-2xl border-b border-white/[0.05] py-4" : "bg-transparent py-6"
        )}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Sahayak</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.05] rounded-full backdrop-blur-xl"
            >
              <button 
                onClick={() => setRole('provider')}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  role === 'provider' ? "bg-white text-black shadow-lg" : "text-[#A1A1A1] hover:text-white"
                )}
              >
                <Search className="w-4 h-4" />
                {t('job_provider')}
              </button>
              <button 
                onClick={() => setRole('worker')}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  role === 'worker' ? "bg-white text-black shadow-lg" : "text-[#A1A1A1] hover:text-white"
                )}
              >
                <User className="w-4 h-4" />
                {t('worker')}
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <button 
                className="w-auto px-4 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-[#A1A1A1] hover:text-white hover:bg-white/[0.05] transition-all gap-2"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">{i18n.language}</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-32 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col py-2">
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
              </div>
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

        {/* Minimal Voice FAB */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if ('webkitSpeechRecognition' in window) {
              const recognition = new (window as any).webkitSpeechRecognition();
              recognition.continuous = false;
              recognition.interimResults = false;
              recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US'; // Can be expanded for other languages
              
              recognition.onstart = () => {
                alert("Voice Assistant Listening... Speak now!");
              };
              
              recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                // Dispatch custom event to ProviderDashboard search bar
                window.dispatchEvent(new CustomEvent('voiceSearch', { detail: transcript }));
                alert(`Voice Detected: "${transcript}". Populating search...`);
              };
              
              recognition.onerror = (event: any) => {
                alert("Speech recognition error: " + event.error);
              };
              
              recognition.start();
            } else {
              alert("Voice Assistant is not supported in this browser.");
            }
          }}
          className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full shadow-[0_8px_30px_rgb(255,255,255,0.12)] flex items-center justify-center z-[100] group border border-white/20 cursor-pointer"
        >
          <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-20" />
        </motion.button>
      </div>
    </Router>
  );
}

export default App;
