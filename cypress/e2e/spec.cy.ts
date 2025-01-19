describe('My First Test', (): void => {
  it('Visits the initial project page', (): void => {
    cy.visit('/');
    cy.contains('app is running');
  });
});
