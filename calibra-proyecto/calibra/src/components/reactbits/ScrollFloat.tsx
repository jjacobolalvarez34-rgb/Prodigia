"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: string;
  className?: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  tag?: keyof HTMLElementTagNameMap;
}

// React Bits - ScrollFloat, portado fiel al original (comparado carácter
// por carácter contra el fuente que pegaron): mismos valores "from"
// (opacity 0, yPercent 120, scaleY 2.3, scaleX 0.7, transformOrigin
// "50% 0%" - las letras entran aplastadas y se acomodan), mismos
// defaults de animationDuration/ease/scrollStart/scrollEnd/stagger, y
// el mismo scrollTrigger con scrub:true atado a la posición real de
// scroll (no un reveal único al entrar en viewport, como SplitText.tsx).
//
// Único cambio real a propósito: el original siempre renderiza un
// <h2> con clases fijas ("scroll-float"/"scroll-float-text"/"char") y
// un .css aparte con font-size: clamp(1.6rem, 8vw, 10rem) + font-weight
// 900 (pensado para un título grande). Acá se usa en el nombre de cada
// fila de una lista (Fase R3 v2, /leaderboard) - un <h2> por fila sería
// un error de semántica/accesibilidad, y la tipografía gigante no
// aplica. Por eso `tag` es configurable (default "span") y la
// tipografía queda 100% a cargo del `className`/`textClassName` que
// pase quien lo usa, en vez de venir fija en un .css propio.
export default function ScrollFloat({
  children,
  className = "",
  scrollContainerRef,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "center bottom+=50%",
  scrollEnd = "bottom bottom-=40%",
  stagger = 0.03,
  tag = "span",
}: Props) {
  const containerRef = useRef<HTMLElement | null>(null);
  const NBSP = String.fromCharCode(160);

  const caracteres = useMemo(
    () =>
      children.split("").map((char, index) => (
        <span className="sf-char inline-block" key={index}>
          {char === " " ? NBSP : char}
        </span>
      )),
    [children, NBSP]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current ?? window;
    const charEls = el.querySelectorAll(".sf-char");
    if (charEls.length === 0) return;

    const tween = gsap.fromTo(
      charEls,
      {
        willChange: "opacity, transform",
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: "50% 0%",
      },
      {
        duration: animationDuration,
        ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [children, scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  const Tag = tag as React.ElementType;

  return (
    <Tag ref={containerRef} className={`inline-block overflow-hidden ${containerClassName} ${className}`}>
      <span className={`inline-block ${textClassName}`}>{caracteres}</span>
    </Tag>
  );
}
