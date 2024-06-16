const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const date = `${year}-${month}-${day}`;

const payload = {
   username : "username",
   password : "GoodPass@dad132",
   name: "name",
   birthday : date,
   email: "user@gmail.com",
   phone: "9141011111"
};

describe("User registration on signup page", () => {
   it("Error messages are shown for each respective failing input", () => {
      cy.visit("/signup");

      // Submitting signup form with no provided inputs should show all errors
      cy.get("button[type='submit']").click();

      cy.get(".input-error").should("have.length", 5);
      cy.get(".input-error").contains("A username must be at least 3 characters").should("be.visible");
      cy.get(".input-error").contains("A password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&)").should("be.visible");
      cy.get(".input-error").contains("A name must be at least 2 characters").should("be.visible");
      cy.get(".input-error").contains("Expected date, received null").should("be.visible");
      cy.get(".input-error").contains("A valid email is required").should("be.visible");

      // Typing into any input should ensure the errors are removed
      cy.get("#username").type(payload.username);
      cy.get(".input-error").contains("A username must be at least 3 characters").should("not.exist");

      cy.get("#password").type(payload.password);
      cy.get(".input-error").contains("A password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&)").should("not.exist");

      // Ensure the password can toggle between visible and hidden for convenience
      cy.get(".password-icon").first().click();
      cy.get("#password").should("have.attr", "type", "text");
      cy.get(".password-icon").first().click();
      cy.get("#password").should("have.attr", "type", "password");

      // Ensure passwords don't match for invalid match error
      cy.get("#confirmPassword").type(payload.password + "$23");

      // Submit as it is, ensuring some errors are resolved
      cy.get("button[type='submit']").click();

      cy.get(".input-error").should("have.length", 3);
      cy.get(".input-error").contains("A name must be at least 2 characters").should("be.visible");
      cy.get(".input-error").contains("Expected date, received null").should("be.visible");
      cy.get(".input-error").contains("A valid email is required").should("be.visible");

      // Fix some of the errors above
      cy.get("#name").type(payload.name);
      cy.get(".input-error").contains("A name must be at least 2 characters").should("not.exist");

      cy.get("#birthday").type(payload.birthday);
      cy.get(".input-error").contains("Expected date, received null").should("not.exist");

      // Clear final error message
      cy.get("#email").type(payload.email);
      cy.get(".input-error").should("not.exist");

      // Type in an invalid phone number
      cy.get("#phone").type("phone123");

      // Submit the form expecting phone number error
      cy.get("button[type='submit']").click();

      cy.get(".input-error").should("have.length", 1);
      cy.get(".input-error").contains("A valid phone is required if provided").should("be.visible");

      cy.get("#phone").clear().type(payload.phone);
      cy.get(".input-error").should("not.exist");

      // Passwords do not match on form submission as final check but a valid phone number is recognized
      cy.get("button[type='submit']").click();

      cy.get(".input-error").should("have.length", 2);
      cy.get(".input-error").contains("Passwords do not match").should("be.visible");

      // Fix the confirm password input
      cy.get("#confirmPassword").clear();
      cy.get("#confirmPassword").type(payload.password);

      // First password input should still show an error message
      cy.get(".input-error").should("have.length", 1);
      cy.get(".input-error").contains("Passwords do not match").should("be.visible");

      // Submit the final valid form
      cy.get("button[type='submit']").click();

      // Ensure success notification is sent and log in button should redirect to home
      cy.get(".input-error").should("have.length", 0);
      cy.get("h3").contains("Successfully registered").should("be.visible");
      cy.get(".notification button").contains("Log In").should("be.visible").click();
      cy.url().should("include", "/home");

      // Visit settings page to log out
      cy.visit("/home/settings");
      cy.get("button").contains("Sign Out").click();

      // Log out should redirect user to login page
      cy.url().should("not.include", "/home");
      cy.url().should("include", "/login");
   });

   it("Error messages for taken unique fields are shown during registration", () => {
      cy.visit("/signup");

      // Use mock user information for inserted user
      cy.get("#username").type(payload.username);
      cy.get("#password").type(payload.password);
      cy.get("#confirmPassword").type(payload.password);
      cy.get("#name").type(payload.name);
      cy.get("#birthday").type(payload.birthday);
      cy.get("#email").type(payload.email);
      cy.get("#phone").type(payload.phone);

      cy.get("button[type='submit']").click();

      // Error messages for taken fields should show one at a time
      cy.get(".input-error").should("have.length", 1);
      cy.get(".input-error").contains("Username already taken").should("be.visible");

      // Make small changes to each field to ensure all taken field errors are shown
      cy.get("#username").clear().type("a" + payload.username);
      cy.get("button[type='submit']").click();

      cy.get(".input-error").should("have.length", 1);
      cy.get(".input-error").contains("Email already taken").should("be.visible");

      cy.get("#email").clear().type("a" + payload.email);
      cy.get("button[type='submit']").click();

      cy.get(".input-error").should("have.length", 1);
      cy.get(".input-error").contains("Phone number already taken").should("be.visible");

      // Ensure form can be submitted with no phone number
      cy.get("#phone").clear();
      cy.get(".input-error").should("not.exist");
      cy.get("button[type='submit']").click();

      // Submit new valid form, but reloading should not log in user automatically
      cy.get("h3").contains("Successfully registered").should("be.visible");

      cy.reload();
      cy.url().should("not.include", "/home");
      cy.url().should("include", "/signup");
   });

   it("Valid user login and invalid credential login", () => {
      cy.visit("/login");

      // Attempt login with invalid credentials
      cy.get("#username").type(payload.username);
      cy.get("#password").type("b" + payload.password);

      cy.get("button[type='submit']").click();

      cy.get(".input-error").should("have.length", 2);
      cy.get(".input-error").contains("Invalid credentials").should("be.visible");

      cy.get("#password").clear().type(payload.password);
      cy.get(".input-error").should("have.length", 1);
      cy.get(".input-error").contains("Invalid credentials").should("be.visible");

      cy.get("#username").clear().type(payload.username);
      cy.get(".input-error").should("not.exist");

      // Login with valid credentials
      cy.get("button[type='submit']").click();
      cy.url().should("include", "/home");
   });
});