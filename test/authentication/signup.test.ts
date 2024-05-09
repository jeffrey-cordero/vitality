import { register, RegisterUser } from "@/lib/authentication";
import { SubmissionStatus } from  "@/lib/form"

let payload : RegisterUser;
let response : SubmissionStatus;

test('Test empty required user registration information', () => {
   // const 
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

  response = await register(payload);

  console.log(response);


});