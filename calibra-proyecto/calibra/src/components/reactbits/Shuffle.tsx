"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  shuffleDirection?: "left" | "right";
  duration?: number;
  ease?: string;
  threshold?: number;
  rootMargin?: string;
  tag?: keyof HTMLElementTagNameMap;
  shuffleTimes?: number;
  animationMode?: "evenodd" | "random";
  loop?: boolean;
  loopDelay?: number;
  stagger?: number;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
  // Pedido en vivo (2026-09-15): "simula que el mouse pasa por encima
  // cada tanto, para que el efecto sea consistente sin necesitar que el
  // mouse pase por encima" — en perfil/ranking nadie deja el mouse quieto
  // sobre el nombre, así que el replay-por-hover casi nunca se veía tras
  // el primer play automático. Con esto seteado, además de seguir
  // funcionando con un hover real, se re-dispara solo cada N ms.
  autoReplayMs?: number;
}

// Cosmético comprable de Prodigia (pedido en vivo, 2026-09-15: "empieza
// con shuffle y decripte") — a diferencia del resto de las animaciones
// de nombre (una sola clase CSS sobre un <span> cualquiera), esto
// necesita JS corriendo por instancia (GSAP + SplitText real). A
// propósito NO se usa en listas (ranking, chat de clan, vidriera de la
// tienda) — ahí sigue habiendo un solo <span> plano, mismo criterio que
// "decrypted" — ver el comentario en NombreConFuente.tsx sobre
// `permitirEfectosPesados`. Puerto TS de la versión JS de React Bits,
// recortado a los props que Prodigia realmente usa (sin `direction`
// vertical ni `scrambleCharset`, no hacen falta para un nombre de
// usuario corto).
export default function Shuffle({
  text,
  className = "",
  style,
  shuffleDirection = "right",
  duration = 0.35,
  ease = "power3.out",
  threshold = 0.1,
  rootMargin = "-20px",
  tag = "span",
  shuffleTimes = 1,
  animationMode = "evenodd",
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
  autoReplayMs,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  const splitRef = useRef<{ revert: () => void } | null>(null);
  const wrappersRef = useRef<HTMLSpanElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const playingRef = useRef(false);
  const hoverHandlerRef = useRef<(() => void) | null>(null);
  const autoReplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // setTimeout (no setState directo en el cuerpo del efecto) por la
    // misma regla que RecordatorioInvitado.tsx — react-hooks/set-state-in-effect.
    if ("fonts" in document) {
      if (document.fonts.status === "loaded") {
        const id = setTimeout(() => setFontsLoaded(true), 0);
        return () => clearTimeout(id);
      }
      document.fonts.ready.then(() => setFontsLoaded(true));
    } else {
      const id = setTimeout(() => setFontsLoaded(true), 0);
      return () => clearTimeout(id);
    }
  }, []);

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || "");
    const mv = mm ? parseFloat(mm[1]) : 0;
    const mu = mm ? mm[2] || "px" : "px";
    const sign = mv === 0 ? "" : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
    return `top ${startPct}%${sign}`;
  }, [threshold, rootMargin]);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      if (respectReducedMotion && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        setReady(true);
        return;
      }

      const el = ref.current;
      const start = scrollTriggerStart;

      const removeHover = () => {
        if (hoverHandlerRef.current && ref.current) {
          ref.current.removeEventListener("mouseenter", hoverHandlerRef.current);
          hoverHandlerRef.current = null;
        }
        if (autoReplayIntervalRef.current) {
          clearInterval(autoReplayIntervalRef.current);
          autoReplayIntervalRef.current = null;
        }
      };

      const teardown = () => {
        if (tlRef.current) {
          tlRef.current.kill();
          tlRef.current = null;
        }
        if (wrappersRef.current.length) {
          wrappersRef.current.forEach((wrap) => {
            const inner = wrap.firstElementChild;
            const orig = inner?.querySelector('[data-orig="1"]');
            if (orig && wrap.parentNode) wrap.parentNode.replaceChild(orig, wrap);
          });
          wrappersRef.current = [];
        }
        try {
          splitRef.current?.revert();
        } catch {
          /* noop */
        }
        splitRef.current = null;
        playingRef.current = false;
      };

      const build = () => {
        teardown();

        const split = new GSAPSplitText(el, {
          type: "chars",
          charsClass: "shuffle-char",
          wordsClass: "shuffle-word",
          linesClass: "shuffle-line",
          smartWrap: true,
          reduceWhiteSpace: false,
        });
        splitRef.current = split;

        const chars = (split.chars || []) as HTMLElement[];
        wrappersRef.current = [];
        const rolls = Math.max(1, Math.floor(shuffleTimes));

        chars.forEach((ch) => {
          const parent = ch.parentElement;
          if (!parent) return;
          const w = ch.getBoundingClientRect().width;
          if (!w) return;

          const wrap = document.createElement("span");
          Object.assign(wrap.style, {
            display: "inline-block",
            overflow: "hidden",
            width: `${w}px`,
            verticalAlign: "bottom",
          });
          const inner = document.createElement("span");
          Object.assign(inner.style, { display: "inline-block", whiteSpace: "nowrap", willChange: "transform" });

          parent.insertBefore(wrap, ch);
          wrap.appendChild(inner);

          const firstOrig = ch.cloneNode(true) as HTMLElement;
          Object.assign(firstOrig.style, { display: "inline-block", width: `${w}px`, textAlign: "center" });
          ch.setAttribute("data-orig", "1");
          Object.assign(ch.style, { display: "inline-block", width: `${w}px`, textAlign: "center" });

          inner.appendChild(firstOrig);
          for (let k = 0; k < rolls; k++) {
            const c = ch.cloneNode(true) as HTMLElement;
            Object.assign(c.style, { display: "inline-block", width: `${w}px`, textAlign: "center" });
            inner.appendChild(c);
          }
          inner.appendChild(ch);

          const steps = rolls + 1;
          if (shuffleDirection === "right") {
            const firstCopy = inner.firstElementChild;
            const real = inner.lastElementChild;
            if (real) inner.insertBefore(real, inner.firstChild);
            if (firstCopy) inner.appendChild(firstCopy);
          }

          const startX = shuffleDirection === "right" ? -steps * w : 0;
          const finalX = shuffleDirection === "right" ? 0 : -steps * w;
          gsap.set(inner, { x: startX, y: 0, force3D: true });
          inner.setAttribute("data-start-x", String(startX));
          inner.setAttribute("data-final-x", String(finalX));

          wrappersRef.current.push(wrap);
        });
      };

      const inners = () => wrappersRef.current.map((w) => w.firstElementChild as HTMLElement);

      const cleanupToStill = () => {
        wrappersRef.current.forEach((w) => {
          const strip = w.firstElementChild as HTMLElement | null;
          if (!strip) return;
          const real = strip.querySelector('[data-orig="1"]');
          if (!real) return;
          strip.replaceChildren(real);
          strip.style.transform = "none";
          strip.style.willChange = "auto";
        });
      };

      const play = () => {
        const strips = inners();
        if (!strips.length) return;
        playingRef.current = true;

        const tl = gsap.timeline({
          smoothChildTiming: true,
          repeat: loop ? -1 : 0,
          repeatDelay: loop ? loopDelay : 0,
          onRepeat: () => {
            gsap.set(strips, { x: (_i: number, t: Element) => parseFloat(t.getAttribute("data-start-x") || "0") });
          },
          onComplete: () => {
            playingRef.current = false;
            if (!loop) {
              cleanupToStill();
              armHover();
            }
          },
        });

        const addTween = (targets: HTMLElement[], at: number) => {
          tl.to(
            targets,
            {
              duration,
              ease,
              force3D: true,
              stagger: animationMode === "evenodd" ? stagger : 0,
              x: (_i: number, t: Element) => parseFloat(t.getAttribute("data-final-x") || "0"),
            },
            at
          );
        };

        if (animationMode === "evenodd") {
          const odd = strips.filter((_, i) => i % 2 === 1);
          const even = strips.filter((_, i) => i % 2 === 0);
          const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
          const evenStart = odd.length ? oddTotal * 0.7 : 0;
          if (odd.length) addTween(odd, 0);
          if (even.length) addTween(even, evenStart);
        } else {
          strips.forEach((strip) => {
            tl.to(
              strip,
              { duration, ease, force3D: true, x: parseFloat(strip.getAttribute("data-final-x") || "0") },
              Math.random() * duration
            );
          });
        }

        tlRef.current = tl;
      };

      const armHover = () => {
        if (!ref.current) return;
        removeHover();
        const handler = () => {
          if (playingRef.current) return;
          build();
          play();
        };
        if (triggerOnHover) {
          hoverHandlerRef.current = handler;
          ref.current.addEventListener("mouseenter", handler);
        }
        if (autoReplayMs) {
          autoReplayIntervalRef.current = setInterval(handler, autoReplayMs);
        }
      };

      const create = () => {
        build();
        play();
        armHover();
        setReady(true);
      };

      const st = ScrollTrigger.create({ trigger: el, start, once: triggerOnce, onEnter: create });

      return () => {
        st.kill();
        removeHover();
        teardown();
        setReady(false);
      };
    },
    {
      dependencies: [
        text,
        duration,
        ease,
        scrollTriggerStart,
        fontsLoaded,
        shuffleDirection,
        shuffleTimes,
        animationMode,
        loop,
        loopDelay,
        stagger,
        triggerOnce,
        respectReducedMotion,
        triggerOnHover,
        autoReplayMs,
      ],
      scope: ref as React.RefObject<HTMLElement>,
    }
  );

  const Tag = tag as React.ElementType;
  return (
    <Tag ref={ref} className={`inline-block ${ready ? "" : "invisible"} ${className}`} style={style}>
      {text}
    </Tag>
  );
}
