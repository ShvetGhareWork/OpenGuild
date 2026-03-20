'use client';

import { useEffect, useRef } from 'react';
import { Button, Card } from '@/components/ui';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCallModalProps {
  status: 'calling' | 'incoming' | 'connected';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callerName?: string;
  onAnswer: () => void;
  onEnd: () => void;
  onCancel: () => void;
}

export default function VideoCallModal({
  status,
  localStream,
  remoteStream,
  callerName,
  onAnswer,
  onEnd,
  onCancel
}: VideoCallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
      >
        <Card className="w-full max-w-5xl h-[80vh] bg-gray-950 border-white/10 overflow-hidden relative flex flex-col">
          {/* Header */}
          <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
                <Video className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">{status === 'incoming' ? 'Incoming Call' : 'Video Call'}</h3>
                <p className="text-xs text-gray-400">{callerName || 'Team Member'}</p>
              </div>
            </div>
            <button onClick={onEnd} className="text-gray-400 hover:text-white transition p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Video Grid */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            {status === 'connected' ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 right-6 w-48 sm:w-64 aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                </div>
              </>
            ) : status === 'calling' ? (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 animate-pulse scale-110">
                  <Phone className="w-10 h-10 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Calling Team...</h2>
                <p className="text-gray-400">Waiting for others to join</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Phone className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{callerName} is calling...</h2>
                <div className="flex gap-4 mt-8">
                  <Button onClick={onAnswer} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-6 rounded-2xl flex items-center gap-2">
                    <Phone className="w-5 h-5" /> Answer
                  </Button>
                  <Button onClick={onCancel} variant="secondary" className="bg-red-600/20 hover:bg-red-600/30 text-red-500 px-8 py-6 rounded-2xl">
                    Decline
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {status !== 'incoming' && (
            <div className="p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black/60 to-transparent">
              <Button size="icon" variant="ghost" className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <Mic className="w-6 h-6" />
              </Button>
              <Button size="icon" variant="ghost" className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <Video className="w-6 h-6" />
              </Button>
              <Button onClick={onEnd} size="icon" className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/20">
                <PhoneOff className="w-7 h-7" />
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
