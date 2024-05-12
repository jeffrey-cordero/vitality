
describe("Test landing page", () => {
   it("Ensures all sections are in the landing page", () => {
      cy.visit("/");
      cy.get("#login-button").contains("Log In").click();
      cy.url().should("include", "/login");

      cy.visit("/");
      cy.get("#signup-button").contains("Sign Up").click();
      cy.url().should("include", "/signup");
   });
});