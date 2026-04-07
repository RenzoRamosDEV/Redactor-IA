import { useState, useEffect } from 'react';

/**
 * Returns a live MM:SS string counting down to `targetMs` (unix timestamp).
 * Returns null when targetMs is null or already past.
 */
export function useCountdown(targetMs) {
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    if (!targetMs) { setDisplay(null); return; }

    function tick() {
      const diff = targetMs - Date.now();
      if (diff <= 0) { setDisplay(null); return; }
      const totalSec = Math.ceil(diff / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setDisplay(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return display;
}
