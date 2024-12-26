import validator from "validator";
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

export const userSchema = z.object({
   name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(200, { message: "Name must be at most 200 characters" }),
   birthday: z
      .date({
         required_error: "Birthday is required",
         invalid_type_error: "Birthday is required"
      })
      .min(new Date("1800-01-01"), {
         message: "Birthday cannot be earlier than the year 1800" }
      )
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "Birthday cannot be in the future"
      }),
   username: z
      .string()
      .trim()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(30, { message: "Username must be at most 30 characters" }),
   password: z
      .string({
         message: "Password is required"
      })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
         message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (@$!%*#?&)"
      }),
   email: z
      .string({
         message: "Email is required"
      })
      .trim()
      .email({ message: "Email is required" }),
   phone: z
      .string()
      .trim()
      .refine((val) => val === "" || validator.isMobilePhone(val, "en-US"), {
         message: "Valid U.S. phone number is required"
      })
      .optional()
});