import axios from "axios";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle, Clock, Loader2, MapPin, MessageSquare, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Tilt from "react-parallax-tilt";
import { cn } from "../lib/utils";
import ChatWindow from "./ChatWindow";

interface Booking {
  id: string;
  worker_id: string;
  customer_name: string;
  service: string;
  date: string;
  time: string;
  address: string;
  advance_amount: number;
  status: string;
  created_at: string;
}

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [chatOpen, setChatOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [acceptedJobs, setAcceptedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const API_HOST = import.meta.env.VITE_API_URL || "localhost:8001";
        const API_URL = API_HOST.startsWith("http") ? API_HOST : `https://${API_HOST}`;
        const response = await axios.get(`${API_URL}/api/bookings`);
        // Sort to show newest first
        const sortedJobs = (response.data.bookings || []).sort((a: Booking, b: Booking) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setJobs(sortedJobs);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
    
    // Simple polling to show real-time incoming jobs for demo purposes
    const intervalId = setInterval(fetchJobs, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAcceptJob = async (job: Booking) => {
    try {
      const API_HOST = import.meta.env.VITE_API_URL || "localhost:8001";
      const API_URL = API_HOST.startsWith("http") ? API_HOST : `https://${API_HOST}`;
      await axios.post(`${API_URL}/api/bookings/${job.id}/accept`);
      setAcceptedJobs(prev => new Set(prev).add(job.id));
      setActiveJob(job);
      setChatOpen(true);
    } catch (error) {
      console.error("Failed to accept job:", error);
      alert("Failed to accept job. It may have been taken by someone else.");
    }
  };

  const openChat = (job: Booking) => {
    setActiveJob(job);
    setChatOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      className="w-full space-y-8 pb-24"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('online_ready')}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            {t('find_jobs')}
          </h1>
          <p className="text-[#A1A1A1] text-lg max-w-xl leading-relaxed">
            {t('discover_jobs')}
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        
        {/* Enhanced 3D Earnings Card */}
        <Tilt
          tiltMaxAngleX={8}
          tiltMaxAngleY={8}
          perspective={1000}
          glareEnable={true}
          glareMaxOpacity={0.2}
          glareColor="#8b5cf6"
          glarePosition="all"
          className="md:col-span-2 md:row-span-2"
        >
          <motion.div 
            whileHover={{ boxShadow: "0 25px 50px rgba(139,92,246,0.3)" }}
            className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-white/[0.08] rounded-3xl p-8 h-full flex flex-col justify-between relative overflow-hidden group shadow-2xl"
          >
            {/* Animated background orbs */}
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
            />
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
              <ArrowUpRight className="w-48 h-48" />
            </div>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[#A1A1A1] font-medium mb-2"
              >
                {t('todays_earnings')}
              </motion.p>
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                ₹850
              </motion.h2>
            </div>
            <div className="flex gap-4 mt-12 relative z-10">
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/[0.05] border border-white/[0.1] px-4 py-3 rounded-2xl flex-1 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.2)] transition-all"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 mb-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <p className="text-white font-semibold">2 {t('completed')}</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/[0.05] border border-white/[0.1] px-4 py-3 rounded-2xl flex-1 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.2)] transition-all"
              >
                <Clock className="w-5 h-5 text-blue-400 mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <p className="text-white font-semibold">6h {t('logged')}</p>
              </motion.div>
            </div>
          </motion.div>
        </Tilt>

        {/* Enhanced 3D Rating Card */}
        <Tilt 
          tiltMaxAngleX={15} 
          tiltMaxAngleY={15} 
          perspective={1000}
          glareEnable={true}
          glareMaxOpacity={0.25}
          glareColor="#fbbf24"
          glarePosition="all"
          className="md:col-span-1 md:row-span-1"
        >
          <motion.div 
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(251,191,36,0.3)"
            }}
            className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 h-full flex flex-col justify-between shadow-xl relative overflow-hidden group"
          >
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-2xl"
            />
            <p className="text-[#A1A1A1] font-medium text-sm relative z-10">{t('top_rating')}</p>
            <div className="relative z-10">
              <div className="text-4xl font-black bg-gradient-to-br from-white via-yellow-100 to-orange-100 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">4.8</div>
              <div className="text-xs text-[#A1A1A1] mt-1">Based on 142 jobs</div>
            </div>
          </motion.div>
        </Tilt>

        {/* Enhanced 3D Action Card */}
        <Tilt 
          tiltMaxAngleX={15} 
          tiltMaxAngleY={15} 
          perspective={1000}
          glareEnable={true}
          glareMaxOpacity={0.3}
          glareColor="#ffffff"
          glarePosition="all"
          className="md:col-span-1 md:row-span-1"
        >
          <motion.div 
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px rgba(255,255,255,0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-white to-blue-50 text-black rounded-3xl p-6 h-full flex flex-col justify-between cursor-pointer shadow-[0_15px_40px_rgba(255,255,255,0.2)] relative overflow-hidden group"
          >
            <motion.div 
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl"
            />
            <p className="font-medium text-sm opacity-60 relative z-10">{t('payout_available')}</p>
            <div className="relative z-10">
              <div className="text-2xl font-bold">{t('withdraw')}</div>
              <motion.div
                animate={{
                  x: [0, 5, 0],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ArrowUpRight className="w-6 h-6 mt-2" />
              </motion.div>
            </div>
          </motion.div>
        </Tilt>

        {/* Job List (takes up remaining space in bento) */}
        <div className="md:col-span-2 md:row-span-2 flex flex-col gap-4">
          {loading && jobs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <Loader2 className="w-8 h-8 text-[#A1A1A1] animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[200px] text-[#A1A1A1]">
              No active job requests available right now.
            </div>
          ) : (
            jobs.map((job, index) => {
              const isAccepted = acceptedJobs.has(job.id) || job.status === "accepted";
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    boxShadow: job.time.toLowerCase().includes("asap") || job.time.toLowerCase().includes("emergency") 
                      ? "0 15px 40px rgba(239,68,68,0.3)" 
                      : "0 15px 40px rgba(139,92,246,0.2)"
                  }}
                  key={job.id}
                  className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-white/[0.08] p-5 rounded-3xl hover:bg-[#161616] hover:border-white/[0.15] transition-all flex flex-col md:flex-row md:items-center justify-between group cursor-pointer shadow-xl gap-4 backdrop-blur-xl relative overflow-hidden"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="flex gap-4 items-center relative z-10">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg backdrop-blur-xl",
                        job.time.toLowerCase().includes("asap") || job.time.toLowerCase().includes("emergency") 
                          ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                          : "bg-white/10 text-blue-400 border border-white/20"
                      )}
                    >
                      {job.time.toLowerCase().includes("asap") || job.time.toLowerCase().includes("emergency") 
                        ? <Zap className="w-5 h-5 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> 
                        : <MapPin className="w-5 h-5" />
                      }
                    </motion.div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-all">{job.service} Request</h3>
                      <div className="flex items-center gap-3 text-sm text-[#A1A1A1]">
                        <span className="truncate max-w-[150px]">{job.address}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                        <span className="shrink-0">{job.customer_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto relative z-10">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="text-xl font-black bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-0 md:mb-2 text-left md:text-right w-full drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      ₹{job.advance_amount}
                    </motion.div>
                    
                    {isAccepted ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); openChat(job); }}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.6)] transition-all flex items-center gap-2 w-full md:w-auto justify-center relative z-10"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> {t('message')}
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleAcceptJob(job); }}
                        className="bg-gradient-to-r from-white to-blue-100 text-black font-bold text-xs px-4 py-2 rounded-full shadow-[0_8px_25px_rgba(255,255,255,0.3)] hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all w-full md:w-auto justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 relative z-10"
                      >
                        {t('accept_job')}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>

      {activeJob && (
        <ChatWindow 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
          workerName={activeJob.customer_name} 
        />
      )}
    </motion.div>
  );
}
