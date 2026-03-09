'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Singleton socket shared across the app
let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket) {
    _socket = io(BACKEND_URL, { autoConnect: true });
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
export function useMilestoneUpdates(projectId: string | undefined, onUpdate: (data: any) => void) {
  const socket = getSocket();

  useEffect(() => {
    if (!projectId) return;
    socket.emit('join-project', { projectId });
    socket.on('milestone:updated', onUpdate);
    return () => { socket.off('milestone:updated', onUpdate); };
  }, [projectId, onUpdate, socket]);
}
