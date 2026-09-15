"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Props {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  animateOn?: "hover" | "view";
}

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+";

// Cosmético comprable (pedido en vivo, 2026-09-15). Puerto TS de la
// versión JS de React Bits — recortado a "hover"/"view" (Prodigia no
// usa el modo "click" ni "inViewHover" para un nombre) y sin la
// dependencia `motion` (el original solo usaba `motion.span` como un
// <span> con handlers, sin ninguna animación de spring/transición real
// — cambiarlo por un <span> plano es 100% equivalente y evita sumar una
// librería nueva al bundle solo para esto). No se usa en listas (ver
// NombreConFuente.tsx, `permitirEfectosPesados`) — cada instancia corre
// su propio setInterval mientras "descifra".
export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = true,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = DEFAULT_CHARS,
  className = "",
  encryptedClassName = "",
  animateOn = "hover",
}: Props) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);

  const containerRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo(() => {
    return useOriginalCharsOnly ? Array.from(new Set(text.split(""))).filter((c) => c !== " ") : characters.split("");
  }, [useOriginalCharsOnly, text, characters]);

  const shuffleText = useCallback(
    (original: string, revealed: Set<number>) =>
      original
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (revealed.has(i)) return original[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join(""),
    [availableChars]
  );

  const getNextIndex = useCallback(
    (revealedSet: Set<number>) => {
      const len = text.length;
      if (revealDirection === "end") return len - 1 - revealedSet.size;
      if (revealDirection === "center") {
        const middle = Math.floor(len / 2);
        const offset = Math.floor(revealedSet.size / 2);
        const next = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
        if (next >= 0 && next < len && !revealedSet.has(next)) return next;
        for (let i = 0; i < len; i++) if (!revealedSet.has(i)) return i;
        return 0;
      }
      return revealedSet.size;
    },
    [text, revealDirection]
  );

  const triggerDecrypt = useCallback(() => {
    setRevealedIndices(new Set());
    setIsAnimating(true);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;
    let currentIteration = 0;

    intervalRef.current = setInterval(() => {
      setRevealedIndices((prevRevealed) => {
        if (sequential) {
          if (prevRevealed.size < text.length) {
            const nextIndex = getNextIndex(prevRevealed);
            const newRevealed = new Set(prevRevealed);
            newRevealed.add(nextIndex);
            setDisplayText(shuffleText(text, newRevealed));
            return newRevealed;
          }
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsAnimating(false);
          return prevRevealed;
        }
        setDisplayText(shuffleText(text, prevRevealed));
        currentIteration++;
        if (currentIteration >= maxIterations) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsAnimating(false);
          setDisplayText(text);
        }
        return prevRevealed;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAnimating, text, speed, maxIterations, sequential, getNextIndex, shuffleText]);

  useEffect(() => {
    // setTimeout (no setState directo en el cuerpo del efecto) — mismo
    // criterio que RecordatorioInvitado.tsx, react-hooks/set-state-in-effect.
    const id = setTimeout(() => {
      setDisplayText(text);
      setRevealedIndices(new Set());
    }, 0);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => {
    if (animateOn !== "view") return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            triggerDecrypt();
            setHasAnimated(true);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [animateOn, hasAnimated, triggerDecrypt]);

  function resetToPlainText() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
  }

  const hoverProps =
    animateOn === "hover"
      ? {
          onMouseEnter: () => {
            if (isAnimating) return;
            setRevealedIndices(new Set());
            setDisplayText(text);
            setIsAnimating(true);
          },
          onMouseLeave: resetToPlainText,
        }
      : {};

  return (
    <span ref={containerRef} className={className} {...hoverProps}>
      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const isRevealed = revealedIndices.has(index) || (!isAnimating && animateOn !== "hover");
          return (
            <span key={index} className={isRevealed ? "" : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
