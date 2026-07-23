import { useState } from "react";
import styles from "./calendar.module.css";
import { useAppointmentCalendar } from "./useAppointmentCalendar";
import { useAppointmentContact } from "./useAppointmentContact";
import { buildAppointmentDateISO } from "./dateUtils";
import type { AppointmentWizardLabels } from "./types";
import CalendarGrid from "./CalendarGrid";
import SlotPicker from "./SlotPicker";
import StepIndicator, { type WizardStep } from "./StepIndicator";
import ContactStep from "./ContactStep";
import ConfirmStep from "./ConfirmStep";
import SuccessPanel from "./SuccessPanel";

interface AppointmentWizardProps {
  lang: string;
  labels: AppointmentWizardLabels;
}

interface Issue {
  path?: (string | number)[];
  message?: string;
}

export default function AppointmentWizard({ lang, labels }: AppointmentWizardProps) {
  const calendar = useAppointmentCalendar();
  const contact = useAppointmentContact();
  const [step, setStep] = useState<WizardStep>("schedule");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const canContinueSchedule =
    calendar.selectedDate !== null && calendar.selectedSlot !== null;

  function goToContact() {
    if (!canContinueSchedule) return;
    setStep("contact");
  }

  function goToConfirm() {
    const ok = contact.validate({
      nameRequired: labels.errorNameRequired,
      phoneRequired: labels.errorPhoneRequired,
      emailInvalid: labels.errorEmailInvalid,
    });
    if (!ok) return;
    setStep("confirm");
  }

  async function submit() {
    if (!calendar.selectedDate || calendar.selectedSlot === null) return;

    setSubmitting(true);
    setErrorMessage(null);

    const payload: Record<string, unknown> = {
      name: contact.fields.name.trim(),
      phone: contact.fields.phone.trim(),
      appointment_date: buildAppointmentDateISO(calendar.selectedDate, calendar.selectedSlot),
    };
    if (contact.fields.email.trim()) payload.email = contact.fields.email.trim();
    if (contact.fields.companyName.trim()) {
      payload.company_name = contact.fields.companyName.trim();
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (Array.isArray(body.issues) && body.issues.length > 0) {
          const messages = (body.issues as Issue[])
            .map((issue) => issue.message)
            .filter(Boolean)
            .join(" ");
          setErrorMessage(messages || labels.alertServerGeneric);
        } else {
          setErrorMessage(labels.alertServerGeneric);
        }
        setSubmitting(false);
        return;
      }

      setSucceeded(true);
    } catch {
      setErrorMessage(labels.alertNetwork);
      setSubmitting(false);
    }
  }

  if (succeeded && calendar.selectedDate && calendar.selectedSlot !== null) {
    return (
      <SuccessPanel
        lang={lang}
        labels={labels}
        phone={contact.fields.phone.trim()}
        selectedDate={calendar.selectedDate}
        selectedSlot={calendar.selectedSlot}
      />
    );
  }

  return (
    <div className={styles.wizard}>
      <StepIndicator
        step={step}
        ariaLabel={labels.stepsAria}
        labels={{
          schedule: labels.stepSchedule,
          contact: labels.stepContact,
          confirm: labels.stepConfirm,
        }}
      />

      {step === "schedule" && (
        <>
          <p className={styles.wizard__intro}>{labels.intro}</p>

          <div className={styles.wizard__panels}>
            <CalendarGrid
              lang={lang}
              viewDate={calendar.viewDate}
              days={calendar.days}
              isPrevDisabled={calendar.isPrevDisabled}
              weekdayLabels={labels.weekdays}
              prevLabel={labels.calMonthPrev}
              nextLabel={labels.calMonthNext}
              gridAriaLabel={labels.calGridAria}
              onPrev={calendar.goPrevMonth}
              onNext={calendar.goNextMonth}
              onSelectDay={calendar.selectDay}
            />

            <SlotPicker
              lang={lang}
              selectedDate={calendar.selectedDate}
              selectedSlot={calendar.selectedSlot}
              slotHours={calendar.slotHours}
              slotsForDayLabel={labels.slotsForDay}
              slotsAriaLabel={labels.slotsAria}
              pickDayLabel={labels.pickDay}
              onSelectSlot={calendar.selectSlot}
            />
          </div>

          <div className={styles.aptForm__actions}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!canContinueSchedule}
              onClick={goToContact}
            >
              <span>{labels.buttonNext}</span>
              <span className="btn__arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </>
      )}

      {step === "contact" && (
        <ContactStep
          labels={labels}
          fields={contact.fields}
          errors={contact.errors}
          onChange={contact.setField}
          onBack={() => setStep("schedule")}
          onNext={goToConfirm}
        />
      )}

      {step === "confirm" && calendar.selectedDate && calendar.selectedSlot !== null && (
        <ConfirmStep
          lang={lang}
          labels={labels}
          selectedDate={calendar.selectedDate}
          selectedSlot={calendar.selectedSlot}
          fields={contact.fields}
          submitting={submitting}
          errorMessage={errorMessage}
          onBack={() => setStep("contact")}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
