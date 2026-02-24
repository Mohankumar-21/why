import { useState, useEffect } from 'react';

const SPAM_COOLDOWN = 60 * 1000; // 1 minute in ms

export function useSpamPrevention() {
  const [lastPostTime, setLastPostTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('last_post_time');
    return saved ? parseInt(saved, 10) : null;
  });

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!lastPostTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - lastPostTime;
      const remaining = Math.max(0, Math.ceil((SPAM_COOLDOWN - diff) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPostTime]);

  const canPost = timeLeft === 0;

  const recordPost = () => {
    const now = Date.now();
    setLastPostTime(now);
    localStorage.setItem('last_post_time', now.toString());
  };

  return { canPost, timeLeft, recordPost };
}
