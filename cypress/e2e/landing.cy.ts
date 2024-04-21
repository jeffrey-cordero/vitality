describe('Test landing page', () => {
  it('Ensures all sections are in the landing page', () => {
    const sections = ['...']
    cy.visit('');
    cy.get('button').contains('Log In').should('be.visible');
    cy.get('button').contains('Sign up').should('be.visible');
  });
})