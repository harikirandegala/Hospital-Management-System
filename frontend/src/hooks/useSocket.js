import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../context/authStore.js';
import toast from 'react-hot-toast';

export function useSocket() {
  const socketRef = useRef(null);
  const user      = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    // Determine Socket.IO URL based on environment
    const socketURL = import.meta.env.VITE_SOCKET_URL 
      ? import.meta.env.VITE_SOCKET_URL
      : window.location.origin;

    socketRef.current = io(socketURL, { 
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join_room', user.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('new_appointment', ({ message, appointment_id }) => {
      toast(`📅 ${message}`, { duration: 5000 });
    });

    socket.on('appointment_cancelled', ({ message }) => {
      toast(`❌ ${message}`, { duration: 5000 });
    });

    socket.on('lab_result_ready', ({ message }) => {
      toast(`🔬 ${message}`, { duration: 6000 });
    });

    return () => { socket.disconnect(); };
  }, [user]);

  return socketRef.current;
}
