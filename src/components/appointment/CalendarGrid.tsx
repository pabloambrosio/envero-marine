import styles from "./calendar.module.css";
import { formatMonthYear, localeFor } from "./dateUtils";
import type { CalendarDay } from "./useAppointmentCalendar";

interface CalendarGridProps {
  lang: string;
  viewDate: Date;
  days: CalendarDay[];
  isPrevDisabled: boolean;
  weekdayLabels: string[];
  prevLabel: string;
  nextLabel: string;
  gridAriaLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onSelectDay: (date: Date) => void;
}

export default function CalendarGrid({
  lang,
  viewDate,
  days,
  isPrevDisabled,
  weekdayLabels,
  prevLabel,
  nextLabel,
  gridAriaLabel,
  onPrev,
  onNext,
  onSelectDay,
}: CalendarGridProps) {
  const locale = localeFor(lang);

  return (
    <div className={styles.aptCal}>
      <header className={styles.aptCal__head}>
        <button
          type="button"
          className={styles.aptCal__nav}
          onClick={onPrev}
          disabled={isPrevDisabled}
          aria-label={prevLabel}
        >
          ←
        </button>
        <span className={styles.aptCal__month}>{formatMonthYear(viewDate, locale)}</span>
        <button
          type="button"
          className={styles.aptCal__nav}
          onClick={onNext}
          aria-label={nextLabel}
        >
          →
        </button>
      </header>

      <div className={styles.aptCal__weekdays} aria-hidden="true">
        {weekdayLabels.map((label, i) => (
          <span key={i} className={styles.aptCal__weekday}>
            {label}
          </span>
        ))}
      </div>

      <div className={styles.aptCal__grid} role="grid" aria-label={gridAriaLabel}>
        {days.map((day) => (
          <button
            key={day.iso}
            type="button"
            disabled={!day.selectable}
            onClick={() => onSelectDay(day.date)}
            className={[
              styles.aptCal__cell,
              !day.inMonth && styles["is-out"],
              !day.selectable && styles["is-disabled"],
              day.selected && styles["is-selected"],
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}
