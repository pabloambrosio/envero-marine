import styles from "./calendar.module.css";

export type WizardStep = "schedule" | "contact" | "confirm";

const STEP_ORDER: WizardStep[] = ["schedule", "contact", "confirm"];

interface StepIndicatorProps {
  step: WizardStep;
  ariaLabel: string;
  labels: Record<WizardStep, string>;
}

export default function StepIndicator({ step, ariaLabel, labels }: StepIndicatorProps) {
  const activeIndex = STEP_ORDER.indexOf(step);

  return (
    <ol className={styles.aptSteps} aria-label={ariaLabel}>
      {STEP_ORDER.map((s, i) => (
        <li
          key={s}
          className={[
            styles.aptSteps__item,
            i === activeIndex && styles["is-active"],
            i < activeIndex && styles["is-done"],
          ]
            .filter(Boolean)
            .join(" ")}
          aria-current={i === activeIndex ? "step" : undefined}
        >
          <span className={styles.aptSteps__index}>{String(i + 1).padStart(2, "0")}</span>
          <span className={styles.aptSteps__label}>{labels[s]}</span>
        </li>
      ))}
    </ol>
  );
}
