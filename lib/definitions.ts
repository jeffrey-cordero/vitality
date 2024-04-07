import { ChangeEvent } from "react";

// Use Prisma for declarations
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type InputFormat = {
  label: string;
  inputId: string;
  inputType?: string;
  value: any;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};