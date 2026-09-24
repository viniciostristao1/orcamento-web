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

export interface Task {
  id: string;
  plate: string;
  model: string;
  description: string;
  endTime: number; // Timestamp
  createdAt: number;
}

export interface AppState {
  contacts: Contact[];
  messageTemplate: string;
  tasks: Task[];
}

export enum CampaignStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED'
}
