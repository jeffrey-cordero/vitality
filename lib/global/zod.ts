import { z } from "zod";

export const uuidSchema = z.union([
   z
      .string()
      .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
         message: "Invalid UUID format"
      }),
   z.string().length(0)
]);