export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageSent: string;
  edited: boolean;
  fileUrls: string[];
  senderDeleted: boolean;
  recipientDeleted: boolean;
  chatId: string;
  sender: Sender;
}

export interface Sender {
  id: string
  firstName: string
  lastName: string
  username: string
}

export interface CreateMessage {
  recipientUsername: string;
  content: string;
  fileUrls?: string[];
}
