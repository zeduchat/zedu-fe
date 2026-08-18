describe("e2e tests for change password on profile information", () => {
  it("verify change password on profile information", () => {
    const baseRoute = Cypress.env("baseUrl");
    //Visit base url
    cy.visit(baseRoute);

    //Click Signup button
    cy.get('a:contains("Get started")').eq(0).click();

    //Input signup data
    const email = `firsttype${Date.now()}@email.com`;
    cy.contains("Email address").parent()?.find("input").type(email);
    cy.contains("Username").parent()?.find("input").type("UserName");
    cy.contains("Password").parent()?.find("input").type("UserLast1234*");
    cy.contains("Create Account").click();
    cy.wait(2000);
    cy.contains("user created successfully", { timeout: 10000 }).should(
      "exist"
    );

    //Input login data
    cy.location("pathname").should("eq", "/auth/login");
    cy.contains("Email address").parent()?.find("input").type(email);
    cy.contains("Password").parent()?.find("input").type("UserLast1234*");
    cy.contains("button", "Login").click();
    cy.wait(5000);

    //Redirect to Welcome page
    cy.url().should("include", "/dashboard/welcome");
    cy.contains("Welcome to Telex.").should("be.visible");
    cy.contains("button", "Get Started").click();

    //Input organization data
    cy.get('input[name="organisationName"]').type("OrganisationName");
    cy.get('input[name="organisationType"]').type("OrganisationType");
    cy.get('button:contains("Select")').eq(0).click();
    cy.contains('[role="option"]', "United States").click({ force: true });
    cy.get('button:contains("Select")').click();
    cy.contains('[role="option"]', "Alabama").click({ force: true });
    cy.get('button:contains("Submit")').click();
    cy.get('button:contains("Proceed")').click();

    //Click the Settings buttons
    cy.get('a:contains("Settings")').click();
    cy.get('button:contains("Profile Information")').click();
    cy.get('a:contains("General")').click();

    //Verify change password on profile information
    cy.contains("Change Password").click();
    cy.get('input[id="currentPassword"]').type("UserLast1234*");
    cy.get('input[id="newPassword"]').type("UserLast1234**");
    cy.get('input[id="confirmPassword"]').type("UserLast1234**");
    cy.get('button:contains("Save changes")').click();
  });
});
