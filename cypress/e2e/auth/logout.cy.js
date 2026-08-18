Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("logout", () => {
  var validEmail = "xowaw55911@acpeak.com";
  var validPassword = "Test123";

  it("should test that logged in user can log out successfully", () => {
    const loginRoute = `${Cypress.env("baseUrl")}/auth/login`;
    cy.visit(loginRoute);
    cy.get(":nth-child(1) > :nth-child(1) > .flex > .w-full").type(validEmail);
    cy.get(":nth-child(1) > :nth-child(1) > .flex > .w-full").should(
      "have.value",
      validEmail
    );
    cy.get(":nth-child(2) > .flex > .relative > .w-full").type(validPassword);
    cy.get(":nth-child(2) > .flex > .relative > .w-full").should(
      "have.value",
      validPassword
    );
    cy.get("button").contains("Login").click();
    cy.get(".border > .relative > .flex").click();

    cy.get("span.font-medium").contains("Log out").click();
    cy.url().should("include", "/auth/login");
  });
});
