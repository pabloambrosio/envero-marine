import { useState } from "react";

export interface ContactFields {
  name: string;
  phone: string;
  email: string;
  companyName: string;
}

export type ContactFieldErrors = Partial<
  Record<"name" | "phone" | "email", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactErrorLabels {
  nameRequired: string;
  phoneRequired: string;
  emailInvalid: string;
}

export function useAppointmentContact() {
  const [fields, setFields] = useState<ContactFields>({
    name: "",
    phone: "",
    email: "",
    companyName: "",
  });
  const [errors, setErrors] = useState<ContactFieldErrors>({});

  function setField<K extends keyof ContactFields>(key: K, value: ContactFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function validate(labels: ContactErrorLabels): boolean {
    const next: ContactFieldErrors = {};
    if (fields.name.trim() === "") next.name = labels.nameRequired;
    if (fields.phone.trim() === "") next.phone = labels.phoneRequired;
    if (fields.email.trim() !== "" && !EMAIL_RE.test(fields.email.trim())) {
      next.email = labels.emailInvalid;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return { fields, errors, setField, validate };
}
