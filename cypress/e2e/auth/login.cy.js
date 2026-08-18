Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("login", () => {
  var validEmail = "xowaw55911@acpeak.com";
  var validPassword = "Test123";

  it("should test that using the correct email and password, user should be logged in successfully", () => {
    const loginRoute = `${Cypress.env("baseUrl")}/auth/login`;
    cy.visit(loginRoute);
    cy.get(":nth-child(1) > :nth-child(1) > .flex > .w-full", {
      timeout: 6000,
    }).type(validEmail);
    cy.get(":nth-child(1) > :nth-child(1) > .flex > .w-full", {
      timeout: 6000,
    }).should("have.value", validEmail);
    cy.get(":nth-child(2) > .flex > .relative > .w-full", {
      timeout: 6000,
    }).type(validPassword);
    cy.get(":nth-child(2) > .flex > .relative > .w-full", {
      timeout: 6000,
    }).should("have.value", validPassword);
    cy.get("button", { timeout: 10000 }).contains("Login").click();

    cy.url().should("include", "/dashboard/welcome");
    cy.get(".border > .relative > .flex").click();
    cy.get("span.block.px-2.pb-1.text-xs.text-neutral-dark-1").contains(
      validEmail
    );
    cy.get(".my-8").contains(
      "Your Powerful Real-Time event management and communication hub"
    );
    cy.get(".inline-flex").contains("Get Started");
    cy.window().then((window) => {
      const value = window.localStorage.getItem("token");
      expect(value).to.exist;
    });
  });
});
