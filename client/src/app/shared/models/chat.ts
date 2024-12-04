export interface Chat {
  id: string;
  updatedAt: string;
  participants: Participant[];
  messages: Message[];
}

export interface Participant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Message {
  senderId: string;
  content: string;
  messageSent: string;
}
