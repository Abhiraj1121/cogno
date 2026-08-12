import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useFileStore } from '../../store/useFileStore';

const CameraApp = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addFile } = useFileStore();
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flash, setFlash] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied or unavailable.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 100);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      const fileName = `IMG_${new Date().toISOString().replace(/[-:.]/g, '')}.png`;

      addFile({
        name: fileName,
        type: 'image',
        content: dataUrl,
        parentId: 'root'
      });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black text-white relative">
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-900">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Camera Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={startCamera}
            className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RefreshCcw size={16} className="mr-2" />
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {flash && (
              <div className="absolute inset-0 bg-white opacity-80 z-10" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="h-24 bg-black/80 backdrop-blur-md flex items-center justify-center border-t border-white/10">
            <button
              onClick={takePhoto}
              className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center hover:border-white transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full scale-90 group-hover:scale-95 transition-transform" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraApp;
