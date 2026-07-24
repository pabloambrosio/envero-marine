import styles from "./Contact.module.css";
import ContactForm, { type ContactFormLabels } from "./ContactForm";

export interface ContactLabels {
  aria: string;
  eyebrow: string;
  infoTag: string;
  heading: string;
  lead: string;
  channelsAria: string;
  emailLabel: string;
  emailValue: string;
  whatsappLabel: string;
  whatsappValue: string;
  baseLabel: string;
  baseValue: string;
  form: ContactFormLabels;
}

interface ContactProps {
  labels: ContactLabels;
}

export default function Contact({ labels }: ContactProps) {
  const whatsappHref = `https://wa.me/${labels.whatsappValue.replace(/[^\d]/g, "")}`;

  return (
    <section className={styles.section} id="contacto" aria-label={labels.aria}>
      <div className={styles.container}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>{labels.eyebrow}</span>
        </header>

        <div className={styles.bento}>
          <aside className={styles.info}>
            <span className={styles.infoTag} aria-hidden="true">
              {labels.infoTag}
            </span>
            <h2 className={styles.heading}>{labels.heading}</h2>
            <p className={styles.lead}>{labels.lead}</p>

            <ul className={styles.channels} aria-label={labels.channelsAria}>
              <li className={styles.channel}>
                <span className={styles.channelLabel}>{labels.emailLabel}</span>
                <a className={styles.channelValue} href={`mailto:${labels.emailValue}`}>
                  {labels.emailValue}
                </a>
              </li>
              <li className={styles.channel}>
                <span className={styles.channelLabel}>{labels.whatsappLabel}</span>
                <a
                  className={styles.channelValue}
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener"
                >
                  {labels.whatsappValue}
                </a>
              </li>
              <li className={styles.channel}>
                <span className={styles.channelLabel}>{labels.baseLabel}</span>
                <span className={styles.channelValue}>{labels.baseValue}</span>
              </li>
            </ul>
          </aside>

          <ContactForm labels={labels.form} />
        </div>
      </div>
    </section>
  );
}
