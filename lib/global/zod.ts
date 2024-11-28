import { z } from "zod";

export const uuidSchema = (identifier: string, state: "new" | "required") => {
   return state === "required" ? (
      z
         .string()
         .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
            message: `ID for ${identifier} must be in UUID format`
         })
   ) : (
      z
         .string()
         .trim()
         .length(0, {
            message: `ID for ${identifier} must be empty or undefined`
         })
         .optional()
   );
};
