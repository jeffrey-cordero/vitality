import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { getUserByUsername } from "@/lib/authentication/user";
import { expect } from "@jest/globals";
import { signup } from "@/lib/authentication/signup";
import { login, Credentials } from "@/lib/authentication/login";
import { VitalityResponse } from "@/lib/global/state";

let credentials: Credentials;
let expected: VitalityResponse<null>;


describe("", () => {
   test("", async() => {
      // login({
      //    username: "",
      //    password: ""
      // });
   });
});