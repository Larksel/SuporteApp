export enum TicketStatus {
  Open = 0,
  InProgress = 1,
  Resolved = 2,
  Closed = 3,
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  clientName: string;
  createdAt?: string;
  technicianName?: string;
}

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
