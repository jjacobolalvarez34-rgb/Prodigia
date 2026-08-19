"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";

interface Props {
  value: number;
  from?: number;
  className?: string;
}

export default function CountUp({ value, from = 0, className }: Props) {
  const motionValue = useMotionValue(from);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.textContent = Math.round(from).toString();
    const controls = animate(motionValue, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toString();
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
