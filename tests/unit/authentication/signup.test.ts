import { expect } from "@jest/globals";
import { Registration, signup } from "@/lib/authentication/signup";
import { VitalityResponse } from "@/lib/global/state";
import { prismaMock } from "@/singleton";
import { users } from "@prisma/client";

let registration: Registration;
let expected: VitalityResponse<Registration>;

describe("User creation with validation", () => {
  test("Should fail when any required field is invalid or missing", async () => {
    // Test empty, missing, and null fields
    registration = {
      name: "",
      username: "",
      birthday: null,
      phone: "",
    } as Registration;

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Invalid user registration fields",
        errors: {
          username: ["Username must be at least 3 characters"],
          password: ["Password is required"],
          confirmPassword: ["Confirm password is required"],
          name: ["Name must be at least 2 characters"],
          email: ["Email is required"],
          birthday: ["Birthday is required"],
        },
      },
    };

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test invalid phone number
    registration.phone = "27382738273971238";
    expected.body.errors.phone = ["Phone is required, if provided"];

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test future birthday
    registration.birthday = new Date(Date.now() + 1000 * 60 * 60 * 24);
    expected.body.errors.birthday = ["Birthday cannot be in the future"];

    await expect(signup(registration)).resolves.toEqual(expected);
  });

  test("Should fail when name or username is invalid and succeed otherwise", async () => {
    // Test username too short
    registration = {
      name: "Jeffrey",
      birthday: new Date(),
      username: "JC",
      password: "ValidPassword1!",
      confirmPassword: "ValidPassword1!",
      email: "jeffrey@gmail.com",
      phone: "1234567890",
    };

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Invalid user registration fields",
        errors: {
          username: ["Username must be at least 3 characters"],
        },
      },
    };

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test username too long
    registration.username = registration.username.repeat(16);
    expected.body.errors.username = ["Username must be at most 30 characters"];

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test name too short
    registration.name = " J ";
    expected.body.errors.name = ["Name must be at least 2 characters"];

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test name too long
    registration.name = registration.name.repeat(201);
    expected.body.errors.name = ["Name must be at most 200 characters"];

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test valid username and name lengths at minimum lengths
    registration.username = "J_C";
    registration.name = "JeC";
    expected = {
      status: "Success",
      body: { data: null, message: "Successfully registered", errors: {} },
    };

    await expect(signup(registration)).resolves.toEqual(expected);
  });

  test("Should fail when passwords are invalid or don't match and succeed otherwise", async () => {
    // Test invalid password, but valid confirm password
    registration = {
      name: "Jeffrey",
      birthday: new Date(),
      username: "J_C",
      password: "valid?",
      confirmPassword: "ValidPassword1!",
      email: "jeffrey@gmail.com",
      phone: "1234567890",
    };

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Invalid user registration fields",
        errors: {
          password: [
            "Password must contain at least 8 characters, " +
              "one uppercase letter, one lowercase letter, " +
              "one number, and one special character (@$!%*#?&)",
          ],
        },
      },
    };

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test invalid password and confirm password
    registration.confirmPassword = registration.password;
    expected.body.errors.confirmPassword = expected.body.errors.password;

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test valid passwords, but both passwords do not match
    registration.password = "ValidPassword1!";
    registration.confirmPassword = "ValidPassword21!";
    expected.body.errors.password = expected.body.errors.confirmPassword = [
      "Passwords do not match",
    ];

    await expect(signup(registration)).resolves.toEqual(expected);

    // Test valid matching passwords
    registration.confirmPassword = registration.password;
    expected = {
      status: "Success",
      body: { data: null, message: "Successfully registered", errors: {} },
    };

    await expect(signup(registration)).resolves.toEqual(expected);
  });

  test("Should fail when username, email, and/or phone number are already taken or succeed otherwise", async () => {
    // Create mock user
    registration = {
      name: "root",
      birthday: new Date(),
      username: "root2",
      password: "ValidPassword1!",
      confirmPassword: "ValidPassword1!",
      email: "jeffrey@gmail.com",
      phone: "1234567890",
    } as Registration;

    // Taken username
    prismaMock.users.create.mockRejectedValue({
      code: 'P2002',
      meta: {
        target: ['username'],
      },
    });

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Internal database conflicts",
        errors: {
          username: ["Username already taken"],
        },
      },
    };

    // Taken email
    prismaMock.users.create.mockRejectedValue({
      code: 'P2002',
      meta: {
        target: ['email']
      },
    });

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Internal database conflicts",
        errors: {
          email: ["Email already taken"],
        },
      },
    };

    await expect(signup(registration)).resolves.toEqual(expected);

    // Taken phone number
    prismaMock.users.create.mockRejectedValue({
      code: 'P2002',
      meta: {
        target: ['phone']
      },
    });

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Internal database conflicts",
        errors: {
          email: ["Phone number already taken"],
        },
      },
    };

    await expect(signup(registration)).resolves.toEqual(expected);
  });
});
