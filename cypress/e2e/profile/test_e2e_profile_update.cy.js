describe("edit profile settings", () => {
  const fullNameUpdate = "Ziza Updatedss";
  const usernameUpdate = "testingtelex24";
  const validEmail = "testingtelex24@yopmail.com";
  const validPassword = "Backup2020@";
  const phoneUpdate = "08400000094";

  it("should be able to login and navigate to the profile page and update the information there", () => {
    const baseUrl = Cypress.env("baseUrl");
    const loginRoute = `${baseUrl}/auth/login`;
    cy.visit(loginRoute); // route to the login page  ;

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

    cy.url().should("include", "/dashboard");

    cy.window().then((window) => {
      const token = window.localStorage.getItem("token");
      expect(token).to.exist;
      cy.visit(`${baseUrl}/dashboard/settings/profile`);
    });

    // open edit profile
    cy.get("button.whitespace-nowrap.rounded-md.text-sm", {
      timeout: 6000,
    })
      .contains("Edit Profile")
      .click();

    cy.wait(1000);

    cy.get("input#phone", {
      timeout: 6000,
    })
      .clear()
      .type(phoneUpdate);
    cy.wait(1000);

    cy.get("input#user_name", {
      timeout: 20000,
    })
      .clear()
      .type(usernameUpdate);
    cy.wait(1000);
    cy.get("input#full_name", {
      timeout: 20000,
    })
      .clear()
      .type(fullNameUpdate);

    cy.get("input#email", {
      timeout: 6000,
    })
      .clear()
      .type(validEmail);

    // save changes
    cy.get("button.inline-flex.items-center.justify-center", {
      timeout: 8000,
    })
      .contains("Save changes")
      .click();

    cy.wait(2000);

    cy.get(".text-neutral-600.text-base").then(($elements) => {
      // const elementsArray = $elements.get();
      const d = {
        fullnae: $elements.eq(0).text(),
        email: $elements.eq(1).text(),
        number: $elements.eq(2).text(),
        username: $elements.eq(3).text(),
        4: $elements.eq(4).text(),
      };
      cy.wait(1000);

      const fullNameElement = $elements.eq(0);

      cy.wrap(fullNameElement).invoke("text").should("equal", fullNameUpdate);

      const emailElement = $elements.eq(1);
      cy.wrap(emailElement).invoke("text").should("equal", validEmail);

      const numberElement = $elements.eq(2);
      cy.wrap(numberElement).invoke("text").should("equal", phoneUpdate);

      const userNameElement = $elements.eq(3);
      cy.wrap(userNameElement).invoke("text").should("equal", usernameUpdate);
    });
  });
});
