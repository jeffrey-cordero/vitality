import { Registration } from "@/lib/authentication/signup";

export const root = {
   id: "550e8400-e29b-41d4-a716-446655440000",
   name: "root",
   birthday: new Date(),
   username: "root",
   username_normalized: "root",
   password: "$Vc$10$O1sZuWf8KWsRcyVDGHQdUOkPma0pPkdM24PNZfB0vo/S/qUMo8.zS",
   email: "root@gmail.com",
   phone: "9145550001",
   image: "",
   email_verified: false,
   email_normalized: "root@gmail.com",
   phone_verified: false,
   phone_normalized: "(914) 555-0001",
   mail: false,
   sms: false
};

export const user = {
   id: "550e8400-e29b-41d4-a716-446655440001",
   name: "user",
   birthday: new Date(),
   username: "user",
   username_normalized: "user",
   password: "$Ac$10$O033ZuWf8KWsRcyVDGHQdUOkPma0pPkdM24PNZfB0vo/S/qUMo8.zS",
   email: "user@gmail.com",
   phone: "19145550002",
   image: "",
   email_verified: true,
   email_normalized: "user@gmail.com",
   phone_verified: true,
   phone_normalized: "(914) 555-0002",
   mail: false,
   sms: false
};

export const VALID_REGISTRATION: Registration = {
   name: "user",
   birthday: new Date(),
   username: "user",
   password: "ValidPassword1!",
   confirmPassword: "ValidPassword1!",
   email: "user@gmail.com",
   phone: "19145550003"
};

export const INVALID_PASSWORD_MESSAGE = "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (@$!%*#?&)";

export const invalidRegistrations = [
   {
      registration: {
         ...VALID_REGISTRATION,
         username: "",
         password: "",
         confirmPassword: "",
         email: "",
         name: "",
         birthday: null,
         phone: ""
      },
      errors: {
         username: ["Username must be at least 3 characters"],
         password: [INVALID_PASSWORD_MESSAGE],
         confirmPassword: [INVALID_PASSWORD_MESSAGE],
         name: ["Name must be at least 2 characters"],
         email: ["Email is required"],
         birthday: ["Birthday is required"]
      }
   },
   {
      registration: {
         ...VALID_REGISTRATION,
         phone: "27382738273971238"
      },
      errors: {
         phone: ["Valid U.S. phone number is required"]
      }
   },
   {
      registration: {
         ...VALID_REGISTRATION,
         birthday: new Date(Date.now() + 10000 * 60 * 60 * 24)
      },
      errors: {
         birthday: ["Birthday cannot be in the future"]
      }
   },
   {
      registration: {
         ...VALID_REGISTRATION,
         birthday: new Date("1799-01-01")
      },
      errors: {
         birthday: ["Birthday cannot be earlier than the year 1800"]
      }
   },
   {
      registration: {
         ...VALID_REGISTRATION,
         username: "  AB  ",
         name: " A "
      },
      errors: {
         username: ["Username must be at least 3 characters"],
         name: ["Name must be at least 2 characters"]
      }
   },
   {
      registration: {
         ...VALID_REGISTRATION,
         username: "A".repeat(31),
         name: "B".repeat(201)
      },
      errors: {
         username: ["Username must be at most 30 characters"],
         name: ["Name must be at most 200 characters"]
      }
   }
];

export const invalidPasswords = [
   {
      password: "ValidPassword1?",
      confirmPassword: "ValidPassword?",
      errors: {
         confirmPassword: [INVALID_PASSWORD_MESSAGE]
      }
   },
   {
      password: "ValidPassword1!",
      confirmPassword: "ValidPassword2!",
      errors: {
         password: ["Passwords do not match"],
         confirmPassword: ["Passwords do not match"]
      }
   }
];