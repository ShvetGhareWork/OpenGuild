'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './useSocket';

export function useWebRTC(projectId: string, userId: string) {
  const socket = useSocket(userId);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
  const [callerName, setCallerName] = useState('');
  
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const createPeer = useCallback(() => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { projectId, candidate: event.candidate, to: 'all' });
      }
    };

    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    return peer;
  }, [projectId, socket]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setCallStatus('calling');

      const peer = createPeer();
      stream.getTracks().forEach(track => peer.addTrack(track, stream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      peerRef.current = peer;

      console.log('useWebRTC: startCall - emitting call-user', { projectId, from: userId });
      socket.emit('call-user', { projectId, offer, from: userId, name: 'Team Member' });
    } catch (err) {
      console.error('Start call error:', err);
    }
  };

  const answerCall = async (offer: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setCallStatus('connected');

      const peer = createPeer();
      stream.getTracks().forEach(track => peer.addTrack(track, stream));

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      peerRef.current = peer;

      console.log('useWebRTC: answerCall - emitting answer-call', { projectId });
      socket.emit('answer-call', { projectId, answer, to: 'all' });
    } catch (err) {
      console.error('Answer call error:', err);
    }
  };

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    peerRef.current?.close();
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('idle');
    socket.emit('end-call', { projectId });
  };

  useEffect(() => {
    socket.on('incoming-call', ({ offer, name, from }) => {
      console.log('useWebRTC: incoming-call received from', from, name);
      setCallerName(name);
      setCallStatus('incoming');
      // Store offer for answering
      (window as any)._pendingOffer = offer;
    });

    socket.on('call-answered', async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus('connected');
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) { console.error('Error adding ice candidate', e); }
      }
    });

    socket.on('call-ended', () => {
      endCall();
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-ended');
    };
  }, [socket, endCall]);

  return {
    localStream,
    remoteStream,
    callStatus,
    callerName,
    startCall,
    answerCall: () => answerCall((window as any)._pendingOffer),
    endCall,
    cancelIncoming: () => setCallStatus('idle')
  };
}
