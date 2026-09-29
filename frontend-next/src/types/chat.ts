export interface TextPart {
  kind?: "text";
  text: string;
}

export interface A2UIPart {
  kind: "a2ui";
  data: any[];
}

export type ChatPart = TextPart | A2UIPart;

export interface Message {
  id: string;
  sender: "user" | "agent";
  text?: string;
  imageData?: string;
  parts?: ChatPart[];
  timestamp: Date;
  status?: "sending" | "done" | "error";
  errorMessage?: string;
}

export interface ChatPayload {
  message?: string;
  image_data?: string | null;
  user_id?: string;
}
