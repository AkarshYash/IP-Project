import axios from "axios";
import { motion } from "framer-motion";
import L from 'leaflet';
import { Loader2, MapPin, MessageSquare, Search, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Tilt from "react-parallax-tilt";
import ChatWindow from "./ChatWindow";

// Fix for default leaflet marker icon in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Worker {
  id: string;
  name: string;
  skill: string;
  distance: string;
  rating: number;
  price: number;
  verified?: boolean;
  blockchain_verified?: boolean;
  avatar?: string;
  languages: string[];
}

export default function ProviderDashboard() {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeWorker, setActiveWorker] = useState<Worker | null>(null);
  const [bookedWorkers, setBookedWorkers] = useState<Set<string>>(new Set());

  // Fixed coordinates for Noida demo (or dynamically center based on workers)
  const mapCenter: [number, number] = [28.5355, 77.3910];

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const API_HOST = import.meta.env.VITE_API_URL || "localhost:8001";
        const API_URL = API_HOST.startsWith("http") ? API_HOST : `https://${API_HOST}`;
        const response = await axios.get(`${API_URL}/api/workers/search?query=${query}`);
        setWorkers(response.data.workers || []);
      } catch (error) {
        console.error("Failed to fetch workers:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchWorkers, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleHire = async (worker: Worker) => {
    try {
      // Create a booking
      const API_HOST = import.meta.env.VITE_API_URL || "localhost:8001";
      const API_URL = API_HOST.startsWith("http") ? API_HOST : `https://${API_HOST}`;
      await axios.post(`${API_URL}/api/bookings`, {
        worker_id: worker.id,
        worker_name: worker.name,
        customer_id: "C-DEMO",
        customer_name: "Akarsh (Demo Customer)",
        service: worker.skill,
        date: new Date().toISOString().split('T')[0],
        time: "ASAP",
        address: "Current Map Location",
        advance_amount: worker.price
      });
      
      setBookedWorkers(prev => new Set(prev).add(worker.id));
      setActiveWorker(worker);
      setChatOpen(true);
    } catch (error) {
      console.error("Failed to book:", error);
      alert("Failed to create booking.");
    }
  };

  const openChat = (worker: Worker) => {
    setActiveWorker(worker);
    setChatOpen(true);
  };

  useEffect(() => {
    const handleVoiceSearch = (e: any) => {
      setQuery(e.detail);
    };
    window.addEventListener('voiceSearch', handleVoiceSearch);
    return () => window.removeEventListener('voiceSearch', handleVoiceSearch);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      className="w-full space-y-12 pb-24"
    >
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight">
            {t('hero_title_1')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{t('hero_title_2')}</span><br/>{t('hero_title_3')}
          </h1>
        </div>
      </div>

      {/* Enhanced 3D Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        <div className="relative">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
            <Search className="h-6 w-6 text-[#A1A1A1] group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="relative w-full bg-[#111111]/80 backdrop-blur-xl border border-white/[0.08] text-white rounded-full py-6 pl-16 pr-6 text-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all placeholder:text-[#666666] shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          />
        </div>
      </motion.div>

      {/* Radar / Map Bento Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
        <div className="md:col-span-2 bg-[#111111] border border-white/[0.05] rounded-[2rem] overflow-hidden relative shadow-2xl h-full">
           {/* Leaflet Map integration */}
           <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#0A0A0A' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {/* Simulate markers around center based on workers array length */}
              {!loading && workers.map((worker) => {
                const offsetLat = mapCenter[0] + (Math.random() - 0.5) * 0.05;
                const offsetLng = mapCenter[1] + (Math.random() - 0.5) * 0.05;
                return (
                  <Marker key={worker.id} position={[offsetLat, offsetLng]}>
                    <Popup className="text-black">
                      <b>{worker.name}</b><br/>{worker.skill}
                    </Popup>
                  </Marker>
                );
              })}
           </MapContainer>
           
           <div className="absolute top-4 left-4 z-[400] bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 pointer-events-none">
             <div className="flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-white font-bold text-sm">{t('live_radar')}</span>
             </div>
           </div>
        </div>

        <Tilt
          tiltMaxAngleX={10}
          tiltMaxAngleY={10}
          perspective={1000}
          transitionSpeed={1500}
          scale={1.05}
          glareEnable={true}
          glareMaxOpacity={0.15}
          glarePosition="all"
        >
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-[2rem] p-8 h-full flex flex-col justify-between shadow-2xl">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{t('verified_trust')}</h3>
              <p className="text-[#A1A1A1] text-sm">{t('verified_desc')}</p>
            </div>
            <ShieldCheck className="w-12 h-12 text-indigo-400 opacity-80 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>
        </Tilt>
      </div>

      {/* Worker List */}
      <div className="relative min-h-[400px]">
        <h3 className="text-xl font-bold text-white mb-6">{t('top_matches')}</h3>
        
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center text-[#A1A1A1] py-12">
            No workers found matching your criteria. Try adjusting your search.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {workers.map((worker, index) => {
              const isBooked = bookedWorkers.has(worker.id);
              
              return (
                  <Tilt
                    key={worker.id}
                    tiltMaxAngleX={15}
                    tiltMaxAngleY={15}
                    perspective={1000}
                    transitionSpeed={1000}
                    glareEnable={true}
                    glareMaxOpacity={0.15}
                    glareColor="#8b5cf6"
                    glarePosition="all"
                  >
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      whileHover={{ 
                        y: -10,
                        boxShadow: "0 20px 40px rgba(139,92,246,0.3)"
                      }}
                      className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 hover:bg-[#161616] hover:border-white/[0.15] transition-all group h-full flex flex-col justify-between shadow-xl backdrop-blur-xl relative overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        >
                          {worker.avatar ? (
                            <img src={worker.avatar} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">{worker.name.charAt(0)}</span>
                          )}
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-sm text-yellow-400 font-medium shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                        >
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                          {worker.rating.toFixed(1)}
                        </motion.div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl text-white">{worker.name}</h3>
                          {(worker.verified || worker.blockchain_verified) && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                        </div>
                        <p className="text-[#A1A1A1] text-sm">{worker.skill}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-1 rounded-md bg-white/5 text-[#A1A1A1] border border-white/5">
                          <MapPin className="w-3 h-3 inline mr-1" />{worker.distance}
                        </span>
                      </div>
                    </div>

                      <div className="flex items-end justify-between pt-6 border-t border-white/[0.08]">
                        <div>
                          <p className="text-[11px] text-[#A1A1A1] font-semibold uppercase tracking-wider mb-1">{t('est_rate')}</p>
                          <p className="font-black text-xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">₹{worker.price}</p>
                        </div>
                        
                        {isBooked ? (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openChat(worker)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.6)] transition-all flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" /> {t('message')}
                          </motion.button>
                        ) : (
                          <motion.button 
                            whileHover={{ 
                              scale: 1.05,
                              boxShadow: "0 6px 30px rgba(59,130,246,0.5)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleHire(worker)}
                            className="bg-gradient-to-r from-white to-blue-100 text-black font-bold text-sm px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all"
                          >
                            {t('hire_now')}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Tilt>
              );
            })}
          </div>
        )}
      </div>

      {activeWorker && (
        <ChatWindow 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
          workerName={activeWorker.name} 
        />
      )}
    </motion.div>
  );
}
