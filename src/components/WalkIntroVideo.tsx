import { useCallback, useEffect, useRef } from 'react';

interface WalkIntroVideoProps {
  src: string;
  onComplete: () => void;
}

function logVideoError(video: HTMLVideoElement) {
  const err = video.error;
  console.error('joyjoy walk intro video error:', {
    src: video.currentSrc || video.src,
    code: err?.code,
    message: err?.message,
  });
}

/** 边走边听全屏入场视频；播完或失败时回调 onComplete */
export function WalkIntroVideo({ src, onComplete }: WalkIntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    completedRef.current = false;
    const video = videoRef.current;
    if (!video) return undefined;

    video.load();

    const tryPlay = () => {
      video.play().catch((error) => {
        console.error('joyjoy walk intro play failed:', error);
        finish();
      });
    };

    const onCanPlay = () => tryPlay();

    video.addEventListener('canplay', onCanPlay, { once: true });
    video.addEventListener('error', () => {
      logVideoError(video);
      finish();
    }, { once: true });

    return () => {
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [src, finish]);

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
        controls={false}
        onEnded={finish}
      />
    </div>
  );
}
