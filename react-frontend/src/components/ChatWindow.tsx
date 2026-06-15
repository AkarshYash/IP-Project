import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { X, Phone, Video, Camera, MapPin, Send, Plus, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
            {/* Header */}
            <div className="px-6 py-4 bg-[#1A1A1A] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                  {workerName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-bold">{workerName}</h3>
                  <p className="text-emerald-400 text-xs font-semibold">Online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[#A1A1A1]">
                <button className="hover:text-white transition-colors p-2 bg-white/5 rounded-full"><Video className="w-4 h-4" /></button>
                <button className="hover:text-white transition-colors p-2 bg-white/5 rounded-full"><Phone className="w-4 h-4" /></button>
                <button onClick={onClose} className="hover:text-red-400 transition-colors p-2 bg-white/5 rounded-full ml-2"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#0A0A0A]">
              <div className="text-center text-xs text-[#666666] my-4 font-semibold uppercase tracking-widest">
                Connected Securely
              </div>
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${msg.isSelf ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-[#1A1A1A] text-[#EDEDED] border border-white/5 rounded-tl-sm'}`}>
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
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#1A1A1A] border-t border-white/5 flex items-center gap-3">
              <button className="p-3 text-[#A1A1A1] hover:text-white bg-white/5 rounded-full transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Message..." 
                  className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-full py-3 pl-5 pr-20 focus:outline-none focus:border-white/20"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-[#A1A1A1]">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={handleCameraClick} title="Send Photo"><Camera className="w-4 h-4 cursor-pointer hover:text-white" /></button>
                  <button onClick={handleLocationClick} title="Share Location"><MapPin className="w-4 h-4 cursor-pointer hover:text-emerald-400" /></button>
                </div>
              </div>

              <button 
                onClick={handleSend}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
