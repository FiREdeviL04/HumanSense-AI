import { useEffect, useRef, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/live";

export function useWebSocketStatus({ reconnectMs = 1800 } = {}) {
  const [status, setStatus] = useState("connecting");
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    let disposed = false;

    const connect = () => {
      if (disposed) {
        return;
      }

      setStatus((prev) => (prev === "connected" ? "reconnecting" : "connecting"));
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        if (disposed) {
          return;
        }
        setStatus("connected");
      };

      socket.onclose = () => {
        if (disposed) {
          return;
        }
        setStatus("reconnecting");
        reconnectRef.current = setTimeout(connect, reconnectMs);
      };

      socket.onerror = () => {
        if (disposed) {
          return;
        }
        socket.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
      setStatus("disconnected");
    };
  }, [reconnectMs]);

  return status;
}
