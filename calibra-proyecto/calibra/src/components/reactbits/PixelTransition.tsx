"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import "./PixelTransition.css";

interface Props {
  firstContent: ReactNode;
  secondContent: ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  once?: boolean;
  aspectRatio?: string;
  className?: string;
  style?: CSSProperties;
  // Fase K3: además de hover/click, admite un disparo automático — el
  // feedback de error no depende de que el usuario pase el mouse, se
  // revela solo apenas se marca incorrecto.
  activeControlled?: boolean;
}

export default function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = "currentColor",
  animationStepDuration = 0.3,
  once = false,
  aspectRatio = "100%",
  className = "",
  style = {},
  activeControlled,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelGridRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const delayedCallRef = useRef<gsap.core.Tween | null>(null);

  const [isActiveUncontrolled, setIsActiveUncontrolled] = useState(false);
  // En modo controlado el estado visible es directamente el prop — nada
  // de setState dentro de un efecto reaccionando a un cambio de prop.
  const isActive = activeControlled !== undefined ? activeControlled : isActiveUncontrolled;

  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches);

  useEffect(() => {
    const pixelGridEl = pixelGridRef.current;
    if (!pixelGridEl) return;

    pixelGridEl.innerHTML = "";

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement("div");
        pixel.classList.add("pixelated-image-card__pixel");
        pixel.style.backgroundColor = pixelColor;

        const size = 100 / gridSize;
        pixel.style.width = `${size}%`;
        pixel.style.height = `${size}%`;
        pixel.style.left = `${col * size}%`;
        pixel.style.top = `${row * size}%`;
        pixelGridEl.appendChild(pixel);
      }
    }
  }, [gridSize, pixelColor]);

  function animatePixels(activate: boolean) {
    const pixelGridEl = pixelGridRef.current;
    const activeEl = activeRef.current;
    if (!pixelGridEl || !activeEl) return;

    const pixels = pixelGridEl.querySelectorAll(".pixelated-image-card__pixel");
    if (!pixels.length) return;

    gsap.killTweensOf(pixels);
    if (delayedCallRef.current) {
      delayedCallRef.current.kill();
    }

    gsap.set(pixels, { display: "none" });

    const totalPixels = pixels.length;
    const staggerDuration = animationStepDuration / totalPixels;

    gsap.to(pixels, {
      display: "block",
      duration: 0,
      stagger: { each: staggerDuration, from: "random" },
    });

    delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
      activeEl.style.display = activate ? "block" : "none";
      activeEl.style.pointerEvents = activate ? "none" : "";
    });

    gsap.to(pixels, {
      display: "none",
      duration: 0,
      delay: animationStepDuration,
      stagger: { each: staggerDuration, from: "random" },
    });
  }

  // Modo controlado: ignora hover/click, sigue el prop directo. Solo hace
  // el trabajo imperativo (gsap sobre el grid de píxeles) — el estado
  // visible ya está derivado del prop más arriba, nada de setState acá.
  useEffect(() => {
    if (activeControlled === undefined) return;
    animatePixels(activeControlled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeControlled]);

  const handleEnter = () => {
    if (activeControlled !== undefined) return;
    if (!isActiveUncontrolled) {
      setIsActiveUncontrolled(true);
      animatePixels(true);
    }
  };
  const handleLeave = () => {
    if (activeControlled !== undefined) return;
    if (isActiveUncontrolled && !once) {
      setIsActiveUncontrolled(false);
      animatePixels(false);
    }
  };
  const handleClick = () => {
    if (activeControlled !== undefined) return;
    if (!isActiveUncontrolled) {
      setIsActiveUncontrolled(true);
      animatePixels(true);
    } else if (!once) {
      setIsActiveUncontrolled(false);
      animatePixels(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`pixelated-image-card ${className}`}
      style={style}
      onMouseEnter={!isTouchDevice && activeControlled === undefined ? handleEnter : undefined}
      onMouseLeave={!isTouchDevice && activeControlled === undefined ? handleLeave : undefined}
      onClick={isTouchDevice && activeControlled === undefined ? handleClick : undefined}
      onFocus={!isTouchDevice && activeControlled === undefined ? handleEnter : undefined}
      onBlur={!isTouchDevice && activeControlled === undefined ? handleLeave : undefined}
      tabIndex={activeControlled === undefined ? 0 : undefined}
    >
      <div style={{ paddingTop: aspectRatio }} />
      <div className="pixelated-image-card__default" aria-hidden={isActive}>
        {firstContent}
      </div>
      <div className="pixelated-image-card__active" ref={activeRef} aria-hidden={!isActive}>
        {secondContent}
      </div>
      <div className="pixelated-image-card__pixels" ref={pixelGridRef} />
    </div>
  );
}
