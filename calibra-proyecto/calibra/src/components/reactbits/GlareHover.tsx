"use client";

import type { CSSProperties, ReactNode } from "react";
import "./GlareHover.css";

interface Props {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: CSSProperties;
  // Fase J3: además del hover original, admite un disparo programático
  // (el logro no se revela con mouse encima, se revela solo) — al pasar
  // de false a true, el destello cruza una vez, como si fuera :hover.
  trigger?: boolean;
}

function toRgba(glareColor: string, glareOpacity: number) {
  const hex = glareColor.replace("#", "");
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  return glareColor;
}

export default function GlareHover({
  width = "500px",
  height = "500px",
  background = "#000",
  borderRadius = "10px",
  borderColor = "#333",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = "",
  style = {},
  trigger = false,
}: Props) {
  const rgba = toRgba(glareColor, glareOpacity);

  const vars = {
    "--gh-width": width,
    "--gh-height": height,
    "--gh-bg": background,
    "--gh-br": borderRadius,
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": rgba,
    "--gh-border": borderColor,
  } as CSSProperties;

  return (
    <div
      className={`glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${trigger ? "glare-hover--triggered" : ""} ${className}`}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
}
