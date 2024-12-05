export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageSent: string;
  edited: boolean;
  fileUrls: string[];
  chatId: string;
  sender: Sender;
}

// id: "cm4adzpj3000euhiww4ar9ttk"
// senderId: "cm49r03p3000b"
// recipientId: "cm49qqdja0001uhu0zf5kmo6w"
// content: "Ohhh bro are you here?"
// messageSent: "2024-12-04T21:15:02.271Z"
// edited: false
// fileUrls: []
// chatId: "cm4adzpim000cuhiw0ow9ln8m" 
// sender: 

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
