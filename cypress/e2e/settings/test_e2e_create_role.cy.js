describe("", () => {
  const validEmail = `firsttype${Date.now()}@email.com`;
  const validPassword = "Backup2020@";
  const baseUrl = Cypress.env("baseUrl");

  before(() => {
    cy.visit(baseUrl);
    cy.contains("Start free trial").eq(0).click();
    cy.contains("Email address").parent()?.find("input").type(validEmail);
    // cy.contains("Username").parent()?.find("input").type(validUsername);
    cy.contains("Password").parent()?.find("input").type(validPassword);
    cy.contains("Create Account").click();
    cy.wait(2500);
    cy.contains("user created successfully", { timeout: 10000 }).should(
      "exist"
    );
    // fill the login page with actuall data
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
    cy.get("button", { timeout: 20000 }).contains("Login").click(); // try to login
    cy.wait(1000);

    //Redirect to Welcome page
    cy.url().should("include", "/dashboard/welcome");
    cy.contains("Welcome to Telex.").should("be.visible");
    cy.contains("button", "Get Started").click();

    //Input organization data
    cy.get('input[name="organisationName"]').type(
      "OrganisationName" + `${Date.now()}`
    );
    cy.get('input[name="organisationType"]').type("OrganisationType");
    cy.get('button:contains("Select")').eq(0).click();
    cy.contains('[role="option"]', "United States").click({ force: true });
    cy.get('button:contains("Select")').click();
    cy.contains('[role="option"]', "Alabama").click({ force: true });
    cy.get('button:contains("Submit")').click();
    cy.get('button:contains("Proceed")').click();
  });

  it("should be able to create role", () => {
    cy.visit(baseUrl + "/dashboard/settings/roles-and-permissions");

    cy.contains("button", "Create a new role").click();
    cy.wait(1000);
    const roleName = `${Date.now()}`;
    cy.get("#roleName", {
      timeout: 6000,
    }).type(roleName);

    cy.get("#roleDescription", {
      timeout: 6000,
    }).type(roleName);
    cy.contains("button", "Create role").click();
    cy.wait(4000);

    cy.contains("You have created your new role successfully!", {
      timeout: 10000,
    }).should("exist");

    //
  });
});
