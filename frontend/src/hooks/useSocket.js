// hooks/useSocket.js
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const RAW_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const SOCKET_URL = new URL(RAW_URL).origin;

// export default function useSocket(onInit, onUpdate) {
export default function useSocket(eventName, callback) {
  const socketRef = useRef(null);

  // // Use refs for callbacks to keep socket connection stable across renders
  // const onInitRef = useRef(onInit);
  // const onUpdateRef = useRef(onUpdate);

  // useEffect(() => {
  //   onInitRef.current = onInit;
  //   onUpdateRef.current = onUpdate;
  // }, [onInit, onUpdate]);

  useEffect(() => {
    // Replaced process.env with import.meta.env for Vite compatibility
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    // 1. Declare with 'let' so it can be mutated/reassigned safely
    let token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    
    // Ensure token doesn't carry extra quotes
    if (token) {
      token = token.replace(/^"(.*)"$/, '$1');
    }

    const authHeaderValue = token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : "";

    // Send JWT token in both auth object and headers
    const socket = io(SOCKET_URL, {
      path: "/realtime", // 👈 Critical: must match server.js
      transports: ["polling", "websocket"],
      withCredentials: true,
      auth: { token: authHeaderValue },
      extraHeaders: { Authorization: authHeaderValue }
    });

    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    // Ensure eventName is a string and callback is a function before registering
    if (typeof eventName === "string" && typeof callback === "function") {
      socket.on(eventName, callback);
    }

    return () => {
      socket.disconnect();
    };
  }, [eventName, callback]);

  return socketRef.current;
}

    // socket.on('changes:init', (data) => {
    //   if (onInitRef.current) onInitRef.current(data);
    // });

    // socket.on('changes:update', (data) => {
    //   if (onUpdateRef.current) onUpdateRef.current(data);
    // });

    // socket.on('connect_error', (err) => {
    //   console.warn('Socket authentication error:', err.message);
    // });

//     return () => {
//       socket.disconnect();
//     };
//   }, []); // Run once on mount

//   return socketRef;
// }
