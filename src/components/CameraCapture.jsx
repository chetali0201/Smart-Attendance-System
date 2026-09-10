import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Check, X, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * CameraCapture
 * Opens the device camera, lets the user take & retake a selfie, and
 * returns the final image as a File via onCapture(file).
 */
export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null); // data URL preview
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setStarting(true);
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("unsupported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access in your browser settings and try again.");
      } else if (err.message === "unsupported") {
        setError("Camera is not supported on this browser/device.");
      } else {
        setError("Camera unavailable. Please check that no other app is using it.");
      }
    } finally {
      setStarting(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1); // mirror for a natural selfie look
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPhoto(dataUrl);
    stopCamera();
  }

  function retake() {
    setPhoto(null);
    startCamera();
  }

  function confirm() {
    canvasRef.current.toBlob(
      (blob) => {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-card-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Camera size={18} className="text-brand-600" /> Take a selfie
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900">
          {!error && !photo && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover [transform:scaleX(-1)]"
            />
          )}
          {photo && <img src={photo} alt="Captured selfie" className="h-full w-full object-cover" />}
          {starting && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
              Starting camera…
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="mt-4 flex gap-3">
          {error ? (
            <button onClick={startCamera} className="btn-primary w-full">
              Try Again
            </button>
          ) : !photo ? (
            <button onClick={capture} disabled={starting} className="btn-primary w-full">
              <Camera size={18} /> Capture
            </button>
          ) : (
            <>
              <button onClick={retake} className="btn-secondary flex-1">
                <RotateCcw size={16} /> Retake
              </button>
              <button onClick={confirm} className="btn-primary flex-1">
                <Check size={16} /> Confirm
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
