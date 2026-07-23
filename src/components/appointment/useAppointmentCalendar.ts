import { useMemo, useState } from "react";
import { sameDay } from "./dateUtils";

export interface CalendarDay {
  date: Date;
  iso: string;
  inMonth: boolean;
  selectable: boolean;
  selected: boolean;
}

// Horarios fijos 08:00–17:00, en punto. Se reconfirman en el backend.
const SLOT_HOURS = Array.from({ length: 10 }, (_, i) => 8 + i);

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSelectableDay(date: Date, today: Date): boolean {
  if (date < today) return false;
  const dow = date.getDay(); // 0=dom, 6=sáb
  return dow !== 0 && dow !== 6;
}

export function useAppointmentCalendar() {
  const [today] = useState(startOfToday);
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const isPrevDisabled =
    viewDate.getFullYear() === today.getFullYear() &&
    viewDate.getMonth() === today.getMonth();

  const days = useMemo<CalendarDay[]>(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // getDay: 0=dom..6=sáb. Convertir a "lunes=0..domingo=6".
    const startWeekdayMonFirst = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - startWeekdayMonFirst);

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const inMonth = date.getMonth() === month;
      return {
        date,
        iso: date.toISOString(),
        inMonth,
        selectable: inMonth && isSelectableDay(date, today),
        selected: selectedDate !== null && sameDay(date, selectedDate),
      };
    });
  }, [viewDate, selectedDate, today]);

  function goPrevMonth() {
    if (isPrevDisabled) return;
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function goNextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function selectDay(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function selectSlot(hour: number) {
    setSelectedSlot(hour);
  }

  return {
    viewDate,
    days,
    isPrevDisabled,
    selectedDate,
    selectedSlot,
    slotHours: SLOT_HOURS,
    goPrevMonth,
    goNextMonth,
    selectDay,
    selectSlot,
  };
}
