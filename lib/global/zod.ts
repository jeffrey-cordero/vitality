import { z } from "zod";

export const uuidSchema = z.union([
   // UUID (existing entry)
   z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
      message: "Invalid UUID format"
   }),
   // Allows an empty string (creating new entry)
   z.string().length(0)
]);