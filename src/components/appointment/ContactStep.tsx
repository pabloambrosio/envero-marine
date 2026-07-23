import styles from "./calendar.module.css";
import type { AppointmentWizardLabels } from "./types";
import type { ContactFieldErrors, ContactFields } from "./useAppointmentContact";

interface ContactStepProps {
  labels: AppointmentWizardLabels;
  fields: ContactFields;
  errors: ContactFieldErrors;
  onChange: <K extends keyof ContactFields>(key: K, value: ContactFields[K]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ContactStep({
  labels,
  fields,
  errors,
  onChange,
  onBack,
  onNext,
}: ContactStepProps) {
  return (
    <div className={styles.aptForm}>
      <p className={styles.aptForm__intro}>{labels.contactIntro}</p>

      <div className={styles.aptForm__field}>
        <label className={styles.aptForm__label} htmlFor="apt-name">
          <span>{labels.fieldName}</span>
          <span className={styles.aptForm__req} aria-hidden="true">*</span>
        </label>
        <input
          id="apt-name"
          className={styles.aptForm__input}
          type="text"
          autoComplete="name"
          value={fields.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        {errors.name && <span className={styles.aptForm__error}>{errors.name}</span>}
      </div>

      <div className={styles.aptForm__field}>
        <label className={styles.aptForm__label} htmlFor="apt-phone">
          <span>{labels.fieldPhone}</span>
          <span className={styles.aptForm__req} aria-hidden="true">*</span>
        </label>
        <input
          id="apt-phone"
          className={styles.aptForm__input}
          type="tel"
          autoComplete="tel"
          value={fields.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
        {errors.phone && <span className={styles.aptForm__error}>{errors.phone}</span>}
      </div>

      <div className={styles.aptForm__field}>
        <label className={styles.aptForm__label} htmlFor="apt-email">
          <span>{labels.fieldEmail}</span>
          <span className={styles.aptForm__hint}>{labels.fieldOptional}</span>
        </label>
        <input
          id="apt-email"
          className={styles.aptForm__input}
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
        {errors.email && <span className={styles.aptForm__error}>{errors.email}</span>}
      </div>

      <div className={styles.aptForm__field}>
        <label className={styles.aptForm__label} htmlFor="apt-company">
          <span>{labels.fieldCompany}</span>
          <span className={styles.aptForm__hint}>{labels.fieldOptional}</span>
        </label>
        <input
          id="apt-company"
          className={styles.aptForm__input}
          type="text"
          autoComplete="organization"
          value={fields.companyName}
          onChange={(e) => onChange("companyName", e.target.value)}
        />
      </div>

      <div className={styles.aptForm__actions}>
        <button type="button" className={styles.aptForm__back} onClick={onBack}>
          {labels.buttonBack}
        </button>
        <button type="button" className="btn btn--primary" onClick={onNext}>
          <span>{labels.buttonNext}</span>
          <span className="btn__arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
