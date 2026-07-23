import styles from "./calendar.module.css";
import { formatLongDateTime, localeFor } from "./dateUtils";
import type { AppointmentWizardLabels } from "./types";

interface SuccessPanelProps {
  lang: string;
  labels: AppointmentWizardLabels;
  phone: string;
  selectedDate: Date;
  selectedSlot: number;
}

export default function SuccessPanel({
  lang,
  labels,
  phone,
  selectedDate,
  selectedSlot,
}: SuccessPanelProps) {
  const locale = localeFor(lang);
  const when = formatLongDateTime(selectedDate, selectedSlot, locale);
  const lead = labels.successLead.replace("{via}", phone).replace("{when}", when);

  return (
    <div className={styles.aptSuccess}>
      <span className={styles.aptSuccess__tag}>{labels.successTag}</span>
      <h2 className={styles.aptSuccess__title}>{labels.successTitle}</h2>
      <p className={styles.aptSuccess__lead}>{lead}</p>
    </div>
  );
}
