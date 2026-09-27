import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

// Muted, looping HLS background. hls.js ignores the `loop` attribute, so we
// restart on `ended` and retry play() if the browser pauses us.
export default function HlsVideo({ src, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let hls;
    v.muted = true;

    if (Hls.isSupported() && /\.m3u8(\?|$)/i.test(src)) {
      hls = new Hls({ maxBufferLength: 60, backBufferLength: 30 });
      hls.loadSource(src);
      hls.attachMedia(v);
    } else {
      v.src = src; // Safari plays HLS natively; also handles plain MP4
    }

    const play = () => {
      if (v.duration && v.currentTime >= v.duration - 0.05) v.currentTime = 0;
      v.play().catch(() => {});
    };
    v.addEventListener('canplay', play);
    v.addEventListener('ended', play);
    const keepAlive = setInterval(() => v.paused && v.readyState >= 2 && play(), 1500);

    return () => {
      clearInterval(keepAlive);
      v.removeEventListener('canplay', play);
      v.removeEventListener('ended', play);
      hls?.destroy();
    };
  }, [src]);

  return <video ref={ref} className={className} muted loop autoPlay playsInline preload="auto" />;
}
