import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

// Provides a single shared socket connection, authenticated with the JWT.
const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?.token) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token: user.token },
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  return socketRef;
};

export default useSocket;
