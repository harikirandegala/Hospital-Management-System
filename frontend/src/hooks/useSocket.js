import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../context/authStore.js';
import toast from 'react-hot-toast';

export function useSocket() {
  const socketRef = useRef(null);
  const user      = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('/', { withCredentials: true });
    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join_room', user.id);
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
