// hooks/useSocket.js
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function useSocket(onInit, onUpdate) {
  const socketRef = useRef(null);
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:4000', { path: '/realtime' });
    socketRef.current = socket;
    socket.on('changes:init', data => { if (onInit) onInit(data); });
    socket.on('changes:update', data => { if (onUpdate) onUpdate(data); });
    return () => { socket.disconnect(); };
  }, [onInit, onUpdate]);
  return socketRef;
}
