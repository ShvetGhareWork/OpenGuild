'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getBackendUrl } from '@/lib/api';

const BACKEND_URL = getBackendUrl();

// Singleton socket shared across the app
let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket) {
    _socket = io(BACKEND_URL, { 
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    _socket.on('connect_error', (err) => {
      console.warn(`[Socket.io] Connection error to ${BACKEND_URL}:`, err.message);
      // If we are in production and connecting to localhost/loopback, this is a misconfiguration
      if (typeof window !== 'undefined' && BACKEND_URL.includes('localhost') && window.location.hostname !== 'localhost') {
        console.error('[Socket.io] CRITICAL: Production app is trying to connect to a local backend. Please check Vercel environment variables.');
      }
    });
  }
  return _socket;
}

/**
 * useSocket — returns the shared socket instance.
 * Optionally joins a user room for personal notifications when `userId` is provided.
 */
export function useSocket(userId?: string) {
  const socket = getSocket();
  const joinedRef = useRef(false);

  useEffect(() => {
    if (userId && !joinedRef.current) {
      socket.emit('join-user', { userId });
      joinedRef.current = true;
    }
  }, [userId, socket]);

  return socket;
}

/**
 * useNotifications — subscribes to live notification events for the current user.
 * Calls `onNotification` every time a new notification arrives.
 */
export function useNotifications(userId: string | undefined, onNotification: (n: any) => void) {
  const socket = useSocket(userId);

  useEffect(() => {
    if (!userId) return;
    socket.on('notification', onNotification);
    return () => { socket.off('notification', onNotification); };
  }, [userId, onNotification, socket]);
}

/**
 * useProjectUpvotes — subscribes to live upvote broadcast for all projects.
 * Calls `onUpvote` with { projectId, upvotes } whenever any project is upvoted.
 */
export function useProjectUpvotes(onUpvote: (data: { projectId: string; upvotes: number }) => void) {
  const socket = getSocket();

  useEffect(() => {
    socket.on('project:upvoted', onUpvote);
    return () => { socket.off('project:upvoted', onUpvote); };
  }, [onUpvote, socket]);
}

/**
 * useMilestoneUpdates — subscribes to live milestone updates for a specific project.
 */
export function useMilestoneUpdates(projectId: string | undefined, userId: string | undefined, onUpdate: (data: any) => void) {
  const socket = getSocket();

  useEffect(() => {
    if (!projectId || !userId) return;
    socket.emit('join-project', { projectId, userId });
    socket.on('milestone:updated', onUpdate);
    return () => { socket.off('milestone:updated', onUpdate); };
  }, [projectId, userId, onUpdate, socket]);
}
