import styles from "./calendar.module.css";
import { useAppointmentCalendar } from "./useAppointmentCalendar";
import type { AppointmentWizardLabels } from "./types";
import CalendarGrid from "./CalendarGrid";
import SlotPicker from "./SlotPicker";

interface AppointmentWizardProps {
  lang: string;
  labels: AppointmentWizardLabels;
}

export default function AppointmentWizard({ lang, labels }: AppointmentWizardProps) {
  const calendar = useAppointmentCalendar();

  return (
    <div className={styles.wizard}>
      <p className={styles.wizard__intro}>{labels.intro}</p>

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
  );
}
