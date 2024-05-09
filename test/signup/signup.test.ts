import { expect } from '@jest/globals';
import { signUp, Registration } from "@/lib/signup";
import { SubmissionStatus } from  "@/lib/form"

let payload : Registration;
let response : SubmissionStatus;

test('Test empty required user registration information', async () => {
   payload = {
      name: "",
      birthday: new Date(),
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: ""
    };
    response = await signUp(payload);
    // TODO - validate the error messages too and BIRTHDAY!!
    expect(response.state).toEqual("Error");
    expect(response.errors).toHaveProperty("name");
    expect(response.errors).not.toHaveProperty("birthday");
    expect(response.errors).toHaveProperty("username");
    expect(response.errors).toHaveProperty("password");
    expect(response.errors).toHaveProperty("confirmPassword");
    expect(response.errors).toHaveProperty("email");
    expect(response.errors).toHaveProperty("phone");

});

test('Test that valid payloads can be processed', async () => {
   payload = {
      name: "John Doe",
      birthday: new Date("1990-01-01"),
      username: "johndoe123",
      password: "password123",
      confirmPassword: "password123",
      email: "john.doe@example.com",
      phone: "1234567890"
  };

//   response = await signUp(payload);

   


});


const incorrectTypesPayload = {
   name: "John Doe",
   birthday: "1990-01-01", // Incorrect data type
   username: "johndoe123",
   password: 123456, // Incorrect data type
   confirmPassword: true, // Incorrect data type
   email: "john.doe@example.com",
   phone: ["1234567890"] // Incorrect data type
 };

 const missingFieldsPayload = {
   name: "John Doe",
   // No birthday provided
   username: "johndoe123",
   password: "password123",
   confirmPassword: "password123",
   // No email provided
   phone: "1234567890"
 };
