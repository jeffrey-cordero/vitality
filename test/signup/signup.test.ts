import { expect } from '@jest/globals';
import { signup } from "@/lib/signup";

/** @type {Registration} */
let payload;
/** @type {SubmissionStatus} */
let response;

test('Test empty required user registration fields', async () => {
   payload = {
      name: "",
      birthday: new Date(),
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: ""
    };

    response = await signup(payload, true);

    expect(response.state).toEqual("Error");
    expect(response.response.message).toEqual("Invalid user registration fields.");

    // Ensure the empty fields are caught as errors
    expect(response.errors).toMatchObject({
      username: ["A username must be at least 3 characters"],
      password: ["A password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"],
      confirmPassword: ["A password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"],
      name: ["A name must be at least 2 characters"],
      email: ["A valid email is required"],
      phone: ["A valid phone is required if provided"],
    });

    // Date of today is fine for now
    expect(response.errors).not.toMatchObject({
      birthday: null
    });
});

test('Test missing user registration fields', async () => {
  // No birthday or email provided
  payload = {
    name: "John Doe",
    username: "johndoe123",
    password: "password$AAd123",
    confirmPassword: "password$AAd3",
    phone: "1234567890"
   };

   response = await signup(payload, true);
   
   expect(response.state).toEqual("Error");
   expect(response.response.message).toEqual("Invalid user registration fields.");

   // Ensure the missing fields are caught as errors
   expect(response.errors).toMatchObject({
    birthday: ["Required"],
    email: ["Required"],
   });

  // Ensure the valid fields are not caught as errors
  expect(response.errors).not.toMatchObject({
    username: expect.anything(),
    password: expect.anything(),
    confirmPassword: expect.anything(),
    phone: expect.anything()
  });
});

test('Test valid registration fields', async () => {
   payload = {
      name: "John Doe",
      birthday: new Date("1990-01-01"),
      username: "johndoe123",
      password: "0Password123$$AA",
      confirmPassword: "0Password123$$AA",
      email: "john.doe@example.com",
      phone: "1234567890"
  };

  response = await signup(payload, true);
   
  expect(response.state).toEqual("Success");
  expect(response.response.message).toEqual("Successfully processed user registration for testing purposes.");
});