import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import styles from "./calendar.module.css";

interface StepSliderProps {
  activeIndex: number;
  panels: [ReactNode, ReactNode, ReactNode];
}

// Asume siempre 3 paneles (Agenda/Tus datos/Confirma) — el track está
// hardcodeado a 300%/33.3333% en vez de calcularlo dinámicamente.
export default function StepSlider({ activeIndex, panels }: StepSliderProps) {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const el = panelRefs.current[activeIndex];
    if (!el) return;

    const update = () => setHeight(el.getBoundingClientRect().height);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <div className={styles.aptSlider} style={height !== undefined ? { height } : undefined}>
      <div
        className={styles.aptSlider__track}
        style={{ transform: `translateX(-${activeIndex * (100 / 3)}%)` }}
      >
        {panels.map((panel, i) => (
          <div
            key={i}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={[styles.aptSlider__panel, i === activeIndex && styles["is-active"]]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={i !== activeIndex}
            inert={i !== activeIndex}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
