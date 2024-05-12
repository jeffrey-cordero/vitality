"use server";
import validator from "validator";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";

export type Registration = {
  name: string;
  birthday: string | Date;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone?: string;
};

const registrationSchema = z.object({
   name: z
      .string()
      .trim()
      .min(2, { message: "A name must be at least 2 characters" }),
   birthday: z
      .date()
      .min(new Date(new Date().getFullYear() - 200, 0, 1), {
         message: "A birthday must not be before 200 years ago",
      })
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "A birthday must not be after today",
      }),
   username: z
      .string()
      .trim()
      .min(3, { message: "A username must be at least 3 characters" })
      .max(30, { message: "A username must be at most 30 characters" }),
   password: z
      .string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
         message:
        "A password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&)",
      }),
   email: z.string().trim().email({ message: "A valid email is required" }),
   phone: z
      .string()
      .trim()
      .refine(validator.isMobilePhone, {
         message: "A valid phone is required if provided",
      })
      .optional(),
});

export async function signup (
   registration: Registration,
   testing: boolean = false,
): Promise<SubmissionStatus> {
   const fields = registrationSchema.safeParse(registration);

   if (!fields.success) {
      return sendErrorMessage(
         "Error",
         "Invalid user registration fields.",
         fields.error.flatten().fieldErrors,
      );
   } else if (!(registration.password === registration.confirmPassword)) {
      return sendErrorMessage("Error", "Invalid user registration fields.", {
         password: ["Passwords do not match"],
         confirmPassword: ["Passwords do not match"],
      });
   }

   const prisma = new PrismaClient();

   try {
      const userRegistration = fields.data;

      const salt = await bcrypt.genSaltSync(10);
      userRegistration.password = await bcrypt.hash(registration.password, salt);

      if (registration.phone) {
         userRegistration["phone"] = registration.phone;
      }

      if (!testing) {
         await prisma.$connect();

         await prisma.users.create({
            data: userRegistration,
         });

         return sendSuccessMessage("Successfully registered.");
      } else {
         return sendSuccessMessage(
            "Successfully processed user registration for testing purposes.",
         );
      }
   } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("username")) {
         return sendErrorMessage("Error", "Internal database conflicts", {
            username: ["Username already taken"],
         });
      } else if (
         error.code === "P2002" &&
      error.meta?.target?.includes("email")
      ) {
         return sendErrorMessage("Error", "Internal database conflicts", {
            email: ["Email already taken"],
         });
      } else if (
         error.code === "P2002" &&
      error.meta?.target?.includes("phone")
      ) {
         return sendErrorMessage("Error", "Internal database conflicts", {
            phone: ["Phone number already taken"],
         });
      } else {
         return sendErrorMessage("Failure", error.message);
      }
   } finally {
      if (!testing) {
         prisma.$disconnect();
      }
   }
}
