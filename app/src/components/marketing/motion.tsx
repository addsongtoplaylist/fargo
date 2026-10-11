"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Landing v6 motion (LANDING.md → Redesign v6). Two small helpers instead of an animation
 * library; both stay still when the visitor has "reduce motion" on.
 */

/** True once the element has scrolled into view (stays true). */
function useInView<T extends Element>(margin = "0px 0px -15% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

/**
 * Words slide up one after another when the line scrolls into view. The text stays real
 * text (readable by screen readers and search engines); `lines` breaks it where we want.
 */
export function RevealWords({ lines, className = "", lineClassName = "" }: { lines: string[]; className?: string; lineClassName?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  let i = 0;
  return (
    <span ref={ref} className={`block ${className}`} data-in={inView} aria-label={lines.join(" ")}>
      {lines.map((line) => (
        <span key={line} className={`block ${lineClassName}`} aria-hidden>
          {line.split(" ").map((word) => {
            const delay = i++ * 70;
            return (
              <span key={`${word}-${delay}`} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em] mr-[0.22em] last:mr-0">
                <span
                  className="inline-block transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] translate-y-[110%] [[data-in=true]_&]:translate-y-0 motion-reduce:translate-y-0 motion-reduce:transition-none"
                  style={{ transitionDelay: `${delay}ms` }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/** Fades and lifts its children in once, when they scroll into view. */
export function FadeUp({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Drifts vertically at its own speed while the page scrolls (the "galaxy" depth effect):
 * speed 0.3 moves 30% of the scroll distance against it, negative speeds move with it.
 */
export function Drift({ speed, className = "", style, children }: { speed: number; className?: string; style?: React.CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.parentElement!.getBoundingClientRect();
      const fromCentre = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(fromCentre * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [speed]);
  return (
    <div ref={ref} className={`will-change-transform ${className}`} style={style}>
      {children}
    </div>
  );
}
