export type Category = "Exam" | "Event" | "General";
export type Priority = "Normal" | "Urgent";

export type Notice = {
  id: number;
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  publishDate: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
