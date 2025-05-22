export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}
export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}
