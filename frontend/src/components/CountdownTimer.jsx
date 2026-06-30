import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ targetDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-1.5 text-white/40 text-xs ${className}`}>
        <Clock size={12} />
        <span>Event completed</span>
      </div>
    );
  }

  const units = [
    { label: 'D', value: timeLeft.days },
    { label: 'H', value: timeLeft.hours },
    { label: 'M', value: timeLeft.minutes },
    { label: 'S', value: timeLeft.seconds },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock size={12} className="text-primary-400" />
      <div className="flex items-center gap-1">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className="bg-primary-500/20 border border-primary-500/30 rounded-md px-1.5 py-0.5 min-w-[28px] text-center">
              <span className="text-primary-300 font-mono font-semibold text-xs">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-primary-500/60 text-[9px] ml-0.5">{label}</span>
            </div>
            {i < units.length - 1 && <span className="text-primary-500/40 text-xs">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
