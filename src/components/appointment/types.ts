export interface AppointmentWizardLabels {
  intro: string;
  weekdays: string[]; // lun..dom, 7 elementos
  calMonthPrev: string;
  calMonthNext: string;
  calGridAria: string;
  slotsForDay: string;
  slotsAria: string;
  pickDay: string;

  stepsAria: string;
  stepSchedule: string;
  stepContact: string;
  stepConfirm: string;

  contactIntro: string;
  fieldName: string;
  fieldEmail: string;
  fieldPhone: string;
  fieldCompany: string;
  fieldOptional: string;
  errorNameRequired: string;
  errorPhoneRequired: string;
  errorEmailInvalid: string;

  confirmIntro: string;
  summaryDate: string;
  summaryTime: string;
  summaryName: string;
  summaryContact: string;
  summaryCompany: string;

  buttonBack: string;
  buttonNext: string;
  buttonSubmit: string;
  buttonSubmitting: string;
  buttonClose: string;

  successTag: string;
  successTitle: string;
  successLead: string; // template crudo con placeholders {via} y {when}

  alertTag: string;
  alertNetwork: string;
  alertServerGeneric: string;
}
