import { ChangeEvent } from "react";

// Use Prisma for declarations
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type InputFormat<FormType> = {
  label: string;
  inputId: string;
  inputType?: string;
  state: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export type FeedbackForm = {
  name: string;
  email: string;
  message: string;
};