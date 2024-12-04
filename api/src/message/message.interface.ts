export interface IMessage {
  id: string;
  senderId: number;
  senderUsername: string;
  recipientId: number;
  recipientUsername: string;
  content: string;
  messageSent: Date;
  edited: boolean;
  fileUrls: string[];
}