"use client";

import { useState, useEffect, useMemo } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

function calculateTimeLeft(target: number) {
  const distance = target - Date.now();
  if (distance < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
}

export default function CountdownTimer({
  targetDate,
  className,
}: CountdownTimerProps) {
  const targetTime = useMemo(() => targetDate.getTime(), [targetDate]);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(targetTime)
  );

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetTime));
    const timer = setInterval(() => {
      const tl = calculateTimeLeft(targetTime);
      setTimeLeft(tl);
      if (
        tl.days === 0 &&
        tl.hours === 0 &&
        tl.minutes === 0 &&
        tl.seconds === 0
      ) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  const renderUnit = (unit: { label: string; value: number }, showValue: boolean) => (
    <div key={unit.label} className="text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 border border-white/10 flex items-center justify-center bg-white/[0.04]">
        <span className="text-2xl md:text-3xl font-light tracking-wider tabular-nums">
          {showValue ? String(unit.value).padStart(2, "0") : "--"}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-[0.25em] mt-2.5 block text-white/30 font-medium">
        {unit.label}
      </span>
    </div>
  );

  return (
    <div className={className}>
      <div className="flex gap-3 md:gap-4">
        {units.map((unit) => renderUnit(unit, mounted))}
      </div>
    </div>
  );
}
