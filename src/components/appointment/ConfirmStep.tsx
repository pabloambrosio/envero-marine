import styles from "./calendar.module.css";
import { formatLongDate, localeFor } from "./dateUtils";
import type { AppointmentWizardLabels } from "./types";
import type { ContactFields } from "./useAppointmentContact";

interface ConfirmStepProps {
  lang: string;
  labels: AppointmentWizardLabels;
  selectedDate: Date;
  selectedSlot: number;
  fields: ContactFields;
  submitting: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export default function ConfirmStep({
  lang,
  labels,
  selectedDate,
  selectedSlot,
  fields,
  submitting,
  errorMessage,
  onBack,
  onSubmit,
}: ConfirmStepProps) {
  const locale = localeFor(lang);

  return (
    <div className={styles.aptForm}>
      <p className={styles.aptForm__intro}>{labels.confirmIntro}</p>

      {errorMessage && (
        <div className={styles.aptForm__alert}>
          <span className={styles.aptForm__alertTag} aria-hidden="true">
            {labels.alertTag}
          </span>
          <span>{errorMessage}</span>
        </div>
      )}

      <dl className={styles.aptSummary}>
        <div className={styles.aptSummary__row}>
          <dt className={styles.aptSummary__label}>{labels.summaryDate}</dt>
          <dd className={styles.aptSummary__value}>{formatLongDate(selectedDate, locale)}</dd>
        </div>
        <div className={styles.aptSummary__row}>
          <dt className={styles.aptSummary__label}>{labels.summaryTime}</dt>
          <dd className={styles.aptSummary__value}>
            {String(selectedSlot).padStart(2, "0")}:00
          </dd>
        </div>
        <div className={styles.aptSummary__row}>
          <dt className={styles.aptSummary__label}>{labels.summaryName}</dt>
          <dd className={styles.aptSummary__value}>{fields.name}</dd>
        </div>
        <div className={styles.aptSummary__row}>
          <dt className={styles.aptSummary__label}>{labels.summaryContact}</dt>
          <dd className={styles.aptSummary__value}>
            {[fields.phone, fields.email].filter(Boolean).join(" · ")}
          </dd>
        </div>
        {fields.companyName && (
          <div className={styles.aptSummary__row}>
            <dt className={styles.aptSummary__label}>{labels.summaryCompany}</dt>
            <dd className={styles.aptSummary__value}>{fields.companyName}</dd>
          </div>
        )}
      </dl>

      <div className={styles.aptForm__actions}>
        <button
          type="button"
          className={styles.aptForm__back}
          onClick={onBack}
          disabled={submitting}
        >
          {labels.buttonBack}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onSubmit}
          disabled={submitting}
        >
          <span>{submitting ? labels.buttonSubmitting : labels.buttonSubmit}</span>
          {!submitting && (
            <span className="btn__arrow" aria-hidden="true">→</span>
          )}
        </button>
      </div>
    </div>
  );
}
