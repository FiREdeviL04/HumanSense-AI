import { useCallback, useEffect, useRef, useState } from "react";

export function useWebcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const start = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsRunning(true);
    } catch {
      setError("Unable to access webcam. Check browser permissions.");
      setIsRunning(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRunning(false);
  }, []);

  const captureFrameBase64 = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 320;
    canvas.height = videoRef.current.videoHeight || 240;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { videoRef, isRunning, error, start, stop, captureFrameBase64 };
}
