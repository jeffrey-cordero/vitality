
describe("Test landing page", () => {
   it("Ensures all sections are in the landing page", () => {
      cy.visit("/");
      cy.get("#sideBarButton").click();
      cy.get("#sideBarLinks").trigger("mouseover");
      cy.get(".sideBarLink").contains("Log In").click();
      cy.url().should("include", "/login");

      cy.visit("/");
      cy.get("#sideBarButton").click();
      cy.get("#sideBarLinks").trigger("mouseover");
      cy.get(".sideBarLink").contains("Sign Up").click();
      cy.url().should("include", "/signup");
   });
});