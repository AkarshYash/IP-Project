import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Camera, Map, MapPin, Phone, Plus, Send, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

// Fix leaflet icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
}

type MessageType = 'text' | 'image' | 'location';
interface ChatMessage {
  type: MessageType;
  content: string;
  isSelf: boolean;
  isSystem?: boolean;
}

export default function ChatWindow({ isOpen, onClose, workerName }: ChatWindowProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: 'text', content: "chat_initial", isSelf: false, isSystem: true }
  ]);
  const [input, setInput] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { type: 'text', content: input, isSelf: true, isSystem: false }]);
    setInput("");
    
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'text', content: "chat_reply", isSelf: false, isSystem: true }]);
    }, 1500);
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setMessages(prev => [...prev, { type: 'image', content: imageUrl, isSelf: true }]);
    }
  };

  const handleLocationClick = () => {
    // Simulate fetching geolocation
    setMessages(prev => [...prev, { type: 'location', content: "28.5355° N, 77.3910° E (Noida Sector 62)", isSelf: true }]);
  };

  const handleVoiceCall = () => {
    setCallType('voice');
    setIsCalling(true);
    // Simulate call ending after 5 seconds
    setTimeout(() => {
      setIsCalling(false);
      setCallType(null);
    }, 5000);
  };

  const handleVideoCall = () => {
    setCallType('video');
    setIsCalling(true);
    // Simulate call ending after 5 seconds
    setTimeout(() => {
      setIsCalling(false);
      setCallType(null);
    }, 5000);
  };

  const endCall = () => {
    setIsCalling(false);
    setCallType(null);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full md:max-w-2xl mx-auto h-[100dvh] md:h-[80vh] bg-[#111111] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden md:rounded-3xl border border-white/10 relative"
          >
            {/* Enhanced 3D Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#1A1A1A] to-[#151515] border-b border-white/10 flex items-center justify-between backdrop-blur-xl relative">
              {/* Glow effect */}
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  {workerName.charAt(0)}
                </motion.div>
                <div>
                  <h3 className="text-white font-bold">{workerName}</h3>
                  <motion.div 
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <p className="text-emerald-400 text-xs font-semibold">Online</p>
                  </motion.div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[#A1A1A1]">
                <motion.button 
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVideoCall} 
                  className="hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-blue-600/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/10"
                >
                  <Video className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVoiceCall} 
                  className="hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-emerald-600/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-white/10"
                >
                  <Phone className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose} 
                  className="hover:text-red-400 transition-colors p-2 bg-white/5 rounded-full ml-2 hover:bg-red-600/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-white/10"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Calling Overlay */}
            <AnimatePresence>
              {isCalling && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl flex flex-col items-center justify-center"
                >
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-8"
                  >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                      {workerName.charAt(0)}
                    </div>
                    {/* Pulsing rings */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-full border-4 border-white"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                      className="absolute inset-0 rounded-full border-4 border-white"
                    />
                  </motion.div>

                  {/* Worker Name */}
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-white mb-2"
                  >
                    {workerName}
                  </motion.h2>

                  {/* Call Status */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 mb-12"
                  >
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-400"
                    />
                    <span className="text-emerald-400 font-semibold text-lg">
                      {callType === 'video' ? 'Connecting Video Call...' : 'Calling...'}
                    </span>
                  </motion.div>

                  {/* Call Icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="mb-16"
                  >
                    {callType === 'video' ? (
                      <Video className="w-16 h-16 text-white" />
                    ) : (
                      <Phone className="w-16 h-16 text-white" />
                    )}
                  </motion.div>

                  {/* End Call Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={endCall}
                    className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-2xl transition-colors"
                  >
                    <X className="w-8 h-8 text-white" />
                  </motion.button>

                  {/* Timer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 text-white/60 text-sm"
                  >
                    Call will end automatically in 5 seconds...
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area with 3D Scroll Effects */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-[#0A0A0A] via-[#0F0F0F] to-[#0A0A0A] relative">
              {/* Ambient light effect */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center text-xs text-[#666666] my-4 font-semibold uppercase tracking-widest relative"
              >
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative bg-[#0A0A0A] px-4">Connected Securely</span>
              </motion.div>
              
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`px-5 py-3 rounded-2xl max-w-[80%] backdrop-blur-xl ${msg.isSelf ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm shadow-[0_8px_30px_rgba(37,99,235,0.3)]' : 'bg-[#1A1A1A]/80 text-[#EDEDED] border border-white/10 rounded-tl-sm shadow-[0_8px_30px_rgba(0,0,0,0.5)]'}`}
                  >
                    {msg.type === 'text' && (
                      <div>
                        <div>{msg.isSystem ? t(msg.content) : msg.content}</div>
                        {msg.isSystem && i18n.language !== 'en' && (
                          <div className="text-[10px] text-emerald-400 mt-1 uppercase tracking-wider text-right font-bold">
                            Auto-translated
                          </div>
                        )}
                      </div>
                    )}
                    {msg.type === 'image' && (
                      <img src={msg.content} alt="Uploaded" className="rounded-lg mt-1 max-w-full h-auto max-h-48 object-cover" />
                    )}
                    {msg.type === 'location' && (
                      <div className="mt-2 flex flex-col gap-2 bg-black/20 p-2 rounded-xl w-64">
                        <div className="h-32 w-full rounded-lg overflow-hidden relative pointer-events-none">
                           <MapContainer center={[28.5355, 77.3910]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                              <Marker position={[28.5355, 77.3910]} />
                           </MapContainer>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                          <Map className="w-4 h-4" />
                          <span>Live Location: Noida Sector 62</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced 3D Input Area */}
            <div className="p-4 bg-gradient-to-t from-[#1A1A1A] to-[#151515] border-t border-white/10 flex items-center gap-3 backdrop-blur-xl relative">
              {/* Glow effect on top */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 text-[#A1A1A1] hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
              
              <div className="flex-1 relative group">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"
                />
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Message..." 
                  className="relative w-full bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 text-white rounded-full py-3 pl-5 pr-20 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] placeholder:text-[#666666]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-[#A1A1A1]">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <motion.button 
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCameraClick} 
                    title="Send Photo"
                  >
                    <Camera className="w-4 h-4 cursor-pointer hover:text-blue-400 transition-colors" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLocationClick} 
                    title="Share Location"
                  >
                    <MapPin className="w-4 h-4 cursor-pointer hover:text-emerald-400 transition-colors" />
                  </motion.button>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-500 hover:to-blue-400 transition-all shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_35px_rgba(37,99,235,0.6)] shrink-0"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
