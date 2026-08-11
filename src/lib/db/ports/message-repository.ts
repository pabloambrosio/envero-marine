// Puerto del agregado message (form de contacto del home).

export interface AppMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  message: string;
  created_at: string;
}

export interface NewMessage {
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  message: string;
}

export interface MessageRepository {
  create(input: NewMessage): Promise<AppMessage>;
}
