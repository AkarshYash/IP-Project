import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, CheckCircle, Clock, MapPin, Zap, Loader2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { cn } from "../lib/utils";
import axios from "axios";
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
        const response = await axios.get("http://localhost:8001/api/bookings");
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
      await axios.post(`http://localhost:8001/api/bookings/${job.id}/accept`);
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
        
        {/* Earnings Card */}
        <Tilt
          tiltMaxAngleX={5}
          tiltMaxAngleY={5}
          perspective={1000}
          className="md:col-span-2 md:row-span-2"
        >
          <div className="bg-[#111111] border border-white/[0.05] rounded-3xl p-8 h-full flex flex-col justify-between relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ArrowUpRight className="w-48 h-48" />
            </div>
            <div>
              <p className="text-[#A1A1A1] font-medium mb-2">{t('todays_earnings')}</p>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-white">₹850</h2>
            </div>
            <div className="flex gap-4 mt-12">
              <div className="bg-white/[0.03] border border-white/[0.05] px-4 py-3 rounded-2xl flex-1 backdrop-blur-md">
                <CheckCircle className="w-5 h-5 text-[#A1A1A1] mb-2" />
                <p className="text-white font-semibold">2 {t('completed')}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.05] px-4 py-3 rounded-2xl flex-1 backdrop-blur-md">
                <Clock className="w-5 h-5 text-[#A1A1A1] mb-2" />
                <p className="text-white font-semibold">6h {t('logged')}</p>
              </div>
            </div>
          </div>
        </Tilt>

        {/* Rating Card */}
        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} perspective={1000} className="md:col-span-1 md:row-span-1">
          <div className="bg-[#111111] border border-white/[0.05] rounded-3xl p-6 h-full flex flex-col justify-between shadow-xl">
            <p className="text-[#A1A1A1] font-medium text-sm">{t('top_rating')}</p>
            <div>
              <div className="text-4xl font-black text-white">4.8</div>
              <div className="text-xs text-[#A1A1A1] mt-1">Based on 142 jobs</div>
            </div>
          </div>
        </Tilt>

        {/* Action Card */}
        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} perspective={1000} className="md:col-span-1 md:row-span-1">
          <div className="bg-white text-black rounded-3xl p-6 h-full flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-xl">
            <p className="font-medium text-sm opacity-60">{t('payout_available')}</p>
            <div>
              <div className="text-2xl font-bold">{t('withdraw')}</div>
              <ArrowUpRight className="w-6 h-6 mt-2" />
            </div>
          </div>
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
                  key={job.id}
                  className="bg-[#111111] border border-white/[0.05] p-5 rounded-3xl hover:bg-[#161616] transition-colors flex flex-col md:flex-row md:items-center justify-between group cursor-pointer shadow-lg gap-4"
                >
                  <div className="flex gap-4 items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      job.time.toLowerCase().includes("asap") || job.time.toLowerCase().includes("emergency") ? "bg-red-500/10 text-red-500" : "bg-white/5 text-[#A1A1A1]"
                    )}>
                      {job.time.toLowerCase().includes("asap") || job.time.toLowerCase().includes("emergency") ? <Zap className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight mb-1">{job.service} Request</h3>
                      <div className="flex items-center gap-3 text-sm text-[#A1A1A1]">
                        <span className="truncate max-w-[150px]">{job.address}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                        <span className="shrink-0">{job.customer_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto">
                    <div className="text-xl font-black text-white mb-0 md:mb-2 text-left md:text-right w-full">₹{job.advance_amount}</div>
                    
                    {isAccepted ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openChat(job); }}
                        className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 w-full md:w-auto justify-center"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> {t('message')}
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAcceptJob(job); }}
                        className="bg-white text-black font-bold text-xs px-4 py-2 rounded-full shadow-lg hover:bg-emerald-500 hover:text-white transition-colors w-full md:w-auto justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      >
                        {t('accept_job')}
                      </button>
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
