import { useEffect, useRef, useState } from "react";
import { analyzeFrameEmotion } from "../services/api";

function toBase64(video) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 320;
  canvas.height = video.videoHeight || 240;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function useWebcamEmotion({ intervalMs = 3000 } = {}) {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState({ label: "neutral", confidence: 0, source: "init" });
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream;
    let timer;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!videoRef.current) {
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setEnabled(true);

        timer = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            return;
          }
          const frame = toBase64(videoRef.current);
          const response = await analyzeFrameEmotion(frame);
          setEmotion(response.data);
        }, intervalMs);
      } catch (err) {
        setError("Webcam access unavailable. Emotion engine switched to text-only mode.");
      }
    }

    start();

    return () => {
      if (timer) {
        clearInterval(timer);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [intervalMs]);

  return { videoRef, emotion, enabled, error };
}
