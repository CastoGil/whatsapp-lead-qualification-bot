export type WhatsAppWebhookPayload = {
  object?: string;
  entry?: WhatsAppEntry[];
};

export type WhatsAppEntry = {
  id?: string;
  changes?: WhatsAppChange[];
};

export type WhatsAppChange = {
  field?: string;
  value?: WhatsAppValue;
};

export type WhatsAppValue = {
  messaging_product?: string;
  metadata?: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
};

export type WhatsAppMetadata = {
  display_phone_number?: string;
  phone_number_id?: string;
};

export type WhatsAppContact = {
  profile?: {
    name?: string;
  };
  wa_id?: string;
};

export type WhatsAppMessage = {
  from?: string;
  id?: string;
  timestamp?: string;
  type?: string;
  text?: {
    body?: string;
  };
};

export type MensajeEntrante = {
  id: string;
  telefono: string;
  nombre: string;
  texto: string;
  fecha: Date;
  phoneNumberId: string;
};