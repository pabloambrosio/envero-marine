import styles from "./calendar.module.css";
import { formatLongDate, localeFor } from "./dateUtils";

interface SlotPickerProps {
  lang: string;
  selectedDate: Date | null;
  selectedSlot: number | null;
  slotHours: number[];
  slotsForDayLabel: string;
  slotsAriaLabel: string;
  pickDayLabel: string;
  onSelectSlot: (hour: number) => void;
}

export default function SlotPicker({
  lang,
  selectedDate,
  selectedSlot,
  slotHours,
  slotsForDayLabel,
  slotsAriaLabel,
  pickDayLabel,
  onSelectSlot,
}: SlotPickerProps) {
  if (!selectedDate) {
    return <p className={styles.aptSlots__empty}>{pickDayLabel}</p>;
  }

  const locale = localeFor(lang);

  return (
    <div className={styles.aptSlots}>
      <p className={styles.aptSlots__hint}>
        <span className={styles.aptSlots__hintLabel}>{slotsForDayLabel}</span>
        <strong className={styles.aptSlots__hintDay}>
          {formatLongDate(selectedDate, locale)}
        </strong>
      </p>
      <div className={styles.aptSlots__grid} role="radiogroup" aria-label={slotsAriaLabel}>
        {slotHours.map((hour) => (
          <button
            key={hour}
            type="button"
            role="radio"
            aria-checked={selectedSlot === hour}
            onClick={() => onSelectSlot(hour)}
            className={[styles.aptSlot, selectedSlot === hour && styles["is-selected"]]
              .filter(Boolean)
              .join(" ")}
          >
            {String(hour).padStart(2, "0")}:00
          </button>
        ))}
      </div>
    </div>
  );
}
