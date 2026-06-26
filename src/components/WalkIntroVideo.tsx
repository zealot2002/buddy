import { useEffect, useRef } from 'react';

interface WalkIntroVideoProps {
  src: string;
  onComplete: () => void;
}

/** 边走边听全屏入场视频；播完或失败时回调 onComplete */
export function WalkIntroVideo({ src, onComplete }: WalkIntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    completedRef.current = false;
    const video = videoRef.current;
    if (!video) return undefined;

    const tryPlay = () => {
      video.play().catch((error) => {
        console.error('joyjoy walk intro play failed:', error);
        finish();
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [src]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      aria-label="旅伴出场"
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-cover"
        playsInline
        preload="auto"
        onEnded={finish}
        onError={() => {
          console.error('joyjoy walk intro video error');
          finish();
        }}
      />
    </div>
  );
}
