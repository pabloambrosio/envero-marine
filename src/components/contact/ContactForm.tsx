import { useState, type SubmitEventHandler } from "react";
import styles from "./ContactForm.module.css";

export interface ContactFormLabels {
  aria: string;
  tag: string;
  fieldName: string;
  fieldEmail: string;
  fieldCompany: string;
  fieldPhone: string;
  fieldMessage: string;
  note: string;
  cta: string;
  statusSending: string;
  statusSuccess: string;
  statusErrorGeneric: string;
  statusErrorNetwork: string;
}

interface ContactFormProps {
  labels: ContactFormLabels;
}

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm({ labels }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [statusText, setStatusText] = useState("");

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload: Record<string, string> = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };
    const phone = String(data.get("phone") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    if (phone) payload.phone = phone;
    if (company) payload.company_name = company;

    setStatus("sending");
    setStatusText("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setStatus("error");
        setStatusText(labels.statusErrorGeneric);
        return;
      }

      form.reset();
      setStatus("success");
      setStatusText(labels.statusSuccess);
    } catch {
      setStatus("error");
      setStatusText(labels.statusErrorNetwork);
    }
  }

  const sending = status === "sending";

  return (
    <form className={styles.form} aria-label={labels.aria} onSubmit={handleSubmit}>
      <div className={styles.formHead}>
        <span className={styles.formTag} aria-hidden="true">
          {labels.tag}
        </span>
      </div>

      <div className={styles.fields}>
        <div className={`${styles.field} ${styles.fieldHalf}`}>
          <label className={styles.label} htmlFor="contact-name">
            <span className={styles.labelText}>{labels.fieldName}</span>
            <span className={styles.labelReq} aria-hidden="true">
              *
            </span>
          </label>
          <input
            className={styles.input}
            type="text"
            name="name"
            id="contact-name"
            autoComplete="name"
            required
          />
        </div>

        <div className={`${styles.field} ${styles.fieldHalf}`}>
          <label className={styles.label} htmlFor="contact-email">
            <span className={styles.labelText}>{labels.fieldEmail}</span>
            <span className={styles.labelReq} aria-hidden="true">
              *
            </span>
          </label>
          <input
            className={styles.input}
            type="email"
            name="email"
            id="contact-email"
            autoComplete="email"
            required
          />
        </div>

        <div className={`${styles.field} ${styles.fieldHalf}`}>
          <label className={styles.label} htmlFor="contact-company">
            <span className={styles.labelText}>{labels.fieldCompany}</span>
          </label>
          <input
            className={styles.input}
            type="text"
            name="company"
            id="contact-company"
            autoComplete="organization"
          />
        </div>

        <div className={`${styles.field} ${styles.fieldHalf}`}>
          <label className={styles.label} htmlFor="contact-phone">
            <span className={styles.labelText}>{labels.fieldPhone}</span>
          </label>
          <input
            className={styles.input}
            type="tel"
            name="phone"
            id="contact-phone"
            autoComplete="tel"
          />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="contact-message">
            <span className={styles.labelText}>{labels.fieldMessage}</span>
            <span className={styles.labelReq} aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            name="message"
            id="contact-message"
            rows={4}
            required
          />
        </div>
      </div>

      <p
        className={styles.status}
        data-state={status === "idle" || status === "sending" ? undefined : status}
        aria-live="polite"
      >
        {statusText}
      </p>

      <div className={styles.formFoot}>
        <span className={styles.formNote}>{labels.note}</span>
        <button
          className={`btn btn--primary ${styles.submit}`}
          type="submit"
          disabled={sending}
        >
          <span>{sending ? labels.statusSending : labels.cta}</span>
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </form>
  );
}
