import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeTextEmotion, postBehaviorBatch } from "../services/api";
import { createRequestId, getSessionId } from "../utils/requestIds";
import { logError } from "../utils/logger";

const BASE_WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/live";

export function useRealtimeAI({ behaviorSnapshot, webcamEmotion, isActive = true, sendIntervalMs = 1200 }) {
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const backoffAttemptRef = useRef(0);
  const latestPayloadRef = useRef(null);
  const sessionIdRef = useRef(getSessionId());

  const [intent, setIntent] = useState({ label: "idle", confidence: 0 });
  const [fusion, setFusion] = useState({ emotion: "neutral", intent: "idle", risk: 0 });
  const [action, setAction] = useState({ key: "none", message: "Monitoring user context" });
  const [textEmotion, setTextEmotion] = useState({ label: "neutral", confidence: 0, source: "text" });
  const [connectionState, setConnectionState] = useState("connecting");

  useEffect(() => {
    let disposed = false;

    const clearHeartbeat = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    const clearReconnect = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      clearReconnect();
      const delay = Math.min(12000, 500 * (2 ** backoffAttemptRef.current));
      backoffAttemptRef.current += 1;
      setConnectionState("reconnecting");
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    const sendResync = () => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !latestPayloadRef.current) {
        return;
      }
      socketRef.current.send(JSON.stringify(latestPayloadRef.current));
    };

    const connect = () => {
      if (disposed) {
        return;
      }

      const socket = new WebSocket(BASE_WS_URL);
      socketRef.current = socket;
      setConnectionState("connecting");

      socket.onopen = () => {
        if (disposed) {
          return;
        }
        backoffAttemptRef.current = 0;
        setConnectionState("connected");
        clearHeartbeat();
        heartbeatRef.current = setInterval(() => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                type: "heartbeat",
                request_id: createRequestId(),
                session_id: sessionIdRef.current,
                ts: Date.now(),
              })
            );
          }
        }, 9000);

        sendResync();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "prediction") {
          setIntent(data.intent);
          setFusion(data.fusion);
          setAction(data.action);
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        clearHeartbeat();
        if (!disposed) {
          scheduleReconnect();
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      clearReconnect();
      clearHeartbeat();
      if (socketRef.current) {
        socketRef.current.close();
      }
      setConnectionState("disconnected");
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const now = Date.now();
    if (now - lastSentAtRef.current < sendIntervalMs) {
      return;
    }
    lastSentAtRef.current = now;

    const payload = {
      type: "prediction",
      request_id: createRequestId(),
      session_id: sessionIdRef.current,
      emotion: webcamEmotion,
      behavior: behaviorSnapshot,
      textEmotion,
      ts: Date.now(),
    };

    latestPayloadRef.current = payload;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }

    void postBehaviorBatch({
      behavior: behaviorSnapshot,
      emotion: webcamEmotion,
      textEmotion,
      requestId: payload.request_id,
      sessionId: payload.session_id,
    }).catch((err) => {
      logError("postBehaviorBatch", err);
    });
  }, [behaviorSnapshot, webcamEmotion, textEmotion, isActive, sendIntervalMs]);

  const analyzeInputText = async (text) => {
    if (!text.trim()) {
      return;
    }
    const response = await analyzeTextEmotion(text);
    setTextEmotion(response.data);
  };

  return useMemo(
    () => ({ intent, fusion, action, textEmotion, analyzeInputText, connectionState, sessionId: sessionIdRef.current }),
    [intent, fusion, action, textEmotion, connectionState]
  );
}
