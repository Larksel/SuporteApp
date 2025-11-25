export interface User {
  id: number;
  name: string;
  role: number;
}

export interface Message {
  id?: number;
  content: string;
  sentAt: string;
  senderId: number;
  senderName?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: number;
  clientName: string;
}
