import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Star, MapPin, ChevronRight, ShieldCheck, Loader2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
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
        const response = await axios.get(`http://localhost:8001/api/workers/search?query=${query}`);
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
      await axios.post("http://localhost:8001/api/bookings", {
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

      {/* Global Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-[#A1A1A1] group-focus-within:text-white transition-colors" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full bg-[#111111] border border-white/[0.05] text-white rounded-full py-6 pl-16 pr-6 text-lg focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-[#666666] shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
        />
      </div>

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
              {!loading && workers.map((worker, i) => {
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
                  glareMaxOpacity={0.1}
                  glareColor="#ffffff"
                  glarePosition="all"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="bg-[#111111] border border-white/[0.05] rounded-3xl p-6 hover:bg-[#161616] transition-colors group h-full flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                          {worker.avatar ? (
                            <img src={worker.avatar} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-white">{worker.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 text-sm text-white font-medium backdrop-blur-md">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          {worker.rating.toFixed(1)}
                        </div>
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

                    <div className="flex items-end justify-between pt-6 border-t border-white/[0.05]">
                      <div>
                        <p className="text-[11px] text-[#A1A1A1] font-semibold uppercase tracking-wider mb-1">{t('est_rate')}</p>
                        <p className="font-black text-xl text-white">₹{worker.price}</p>
                      </div>
                      
                      {isBooked ? (
                        <button 
                          onClick={() => openChat(worker)}
                          className="bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" /> {t('message')}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleHire(worker)}
                          className="bg-white text-black font-bold text-sm px-5 py-2.5 rounded-full shadow-lg hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          {t('hire_now')}
                        </button>
                      )}
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
