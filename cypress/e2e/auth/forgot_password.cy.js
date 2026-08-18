describe("should test that an error is displayed to the user, if an invalid token is used", () => {
  const now = Date.now();
  const email = "xowertyghjko.com";
  const username = `user${now}`;
  const password = "Test123";
  const newPassword = "tesTer23456";
  const baseUrl = Cypress.env("baseUrl");

  it("create an account", () => {
    cy.visit(baseUrl);
    cy.contains("Get started").eq(0).click();
    cy.contains("Email address").parent()?.find("input").type(email);
    cy.contains("Username").parent()?.find("input").type(username);
    cy.contains("Password").parent()?.find("input").type(password);
    cy.contains("Create Account").click();
    cy.wait(2500);
  });

  it("login to user account with the existing credentials", () => {
    cy.visit(baseUrl + "/auth/login");
    cy.url().should("include", "/auth/login");
    cy.get(":nth-child(1) > :nth-child(1) > .flex > .w-full").type(email);
    cy.get(":nth-child(2) > .flex > .relative > .w-full").type(password);
    cy.get("button").contains("Login").click();
    cy.wait(2500);
  });

  it("click the forgot password text", () => {
    cy.visit(baseUrl + "/auth/login");
    cy.contains("Forget Password").click();
    cy.contains("h1", "Forgot Password").should("be.visible");
    cy.contains("Email address").parent()?.find("input").type(email);
    cy.get("button").contains("Submit").click();
    cy.wait(2500);
    cy.url().should("include", `/auth/reset-password?email=`);
    cy.contains("label", "Enter OTP code").should("be.visible");
    cy.contains("label", "Enter new password").should("be.visible");
    cy.contains("label", "Confirm new password").should("be.visible");
    cy.contains("label", "Enter OTP code")
      .parent()
      ?.find("input")
      .type("326303");
    cy.contains("label", "Enter new password")
      .parent()
      ?.find("input")
      .type(newPassword);
    cy.contains("label", "Confirm new password")
      .parent()
      ?.find("input")
      .type(newPassword);
    cy.get("button").contains("Reset Password").click();
    cy.wait(2000);
    cy.contains("invalid or expired token", { timeout: 5000 }).should("exist");
  });
});
