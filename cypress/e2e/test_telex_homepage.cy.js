describe("Telex Landing Page", () => {
  const baseRoute = Cypress.env("baseUrl");
  it("has title", () => {
    cy.visit(baseRoute);
    cy.title().should("match", baseRoute);
  });
  it("get started link", () => {
    cy.visit(baseRoute);
    cy.get("a").contains("Log in").first().click();
    cy.get("h1").contains("Login to Telex").should("be.visible");
  });
  it("get started link", () => {
    cy.visit(baseRoute);
    cy.get("a").contains("Get started").first().click();
    cy.get("h1").contains("Create A Telex Account").should("be.visible");
  });
});
