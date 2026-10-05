export interface Contact {
  id: string;
  name: string;
  phone: string;
  targetDate: string; // Data programada para o envio (YYYY-MM-DD)
  chassis?: string; // Número do chassi do veículo
  lastSentTimestamp?: number;
  customMessage?: string;
  internalNote?: string; // Anotação privada do usuário sobre o cliente
}
