import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { Feedback, sendFeedback } from "@/lib/home/feedback/feedback";
import { root } from "@/tests/authentication/data";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";

const VALID_FEEDBACK: Feedback = {
   user_id: root.id,
   name: "root",
   email: "root@gmail.com",
   message: "This is a fantastic app!"
};

describe("Feedback Tests", () => {
   beforeEach(() => {
      // @ts-ignore
      prismaMock.feedback.create.mockImplementation(async(params) => {
         // Mock invalid user ID passed to create feedback operation
         const isInvalidUser = params.data.user_id !== root.id;

         if (isInvalidUser) {
            // Account for invalid user ID provided
            throw new PrismaClientKnownRequestError("Foreign key constraint violated", {
               code: "P2003",
               clientVersion: "5.22.0"
            });
         } else {
            // Mock feedback record creation
            return {
               ...params.data,
               id: MOCK_ID
            };
         }
      });
   });

   test("Should fail sending feedback when fields are invalid", async() => {
      const invalidFeedback = [
         {
            feedback: {
               user_id: root.id,
               name: "r",
               email: "",
               message: ""
            },
            errors : {
               name: ["Name must be at least 2 characters"],
               email: ["Email is required"],
               message: ["Message must be at least 2 characters"]
            }
         }, {
            feedback: {
               user_id: "invalid",
               name: "r".repeat(201),
               email: "invalid.com",
               message: "This"
            },
            errors: {
               user_id: ["ID for user must be in UUID format"],
               name: ["Name must be at most 200 characters"],
               email: ["Email is required"]
            }
         }
      ];

      for (const { feedback, errors } of invalidFeedback) {
         await expect(sendFeedback(root.id, feedback)).resolves.toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Invalid feedback fields",
               errors: errors
            }
         });
      }
   });

   test("Should fail sending feedback when a database conflict or error occurs", async() => {
      // No corresponding user
      expect(await sendFeedback(MOCK_ID, VALID_FEEDBACK)).toEqual({
         status: "Failure",
         body: {
            data: null,
            message: "Oops! Something went wrong. Try again later.",
            errors: {
               system: [
                  "Foreign key constraint violated"
               ]
            }
         }
      });

      // Database error
      simulateDatabaseError("feedback", "create", async() => await sendFeedback(root.id, VALID_FEEDBACK));
   });

   test("Should succeed in sending feedback with valid fields", async() => {
      expect(await sendFeedback(root.id, VALID_FEEDBACK)).toEqual({
         status: "Success",
         body: {
            data: true,
            message: "Feedback sent successfully",
            errors: {}
         }
      });
      // @ts-ignore
      expect(prismaMock.feedback.create).toHaveBeenCalledWith({
         data: {
            user_id: root.id,
            name: "root",
            email: "root@gmail.com",
            message: "This is a fantastic app!"
         }
      } as any);
   });
});