describe("Telex Blog Page", () => {
  const baseRoute = Cypress.env("baseUrl");

  it("test blog card and detail page", () => {
    cy.visit(`${baseRoute}/blogs`);
    cy.wait(2000);
    // first check if we have at least one card
    cy.get(
      'div[class="flex flex-col sm:gap-2 hover:cursor-pointer hover:shadow-lg rounded-sm overflow-hidden max-sm:max-w-[200px]"]'
    )
      .first()
      .should("exist");

    // save the heading and body of this first card then go to detail page and use the variable to do a search if they exist
    let heading = "";
    let body = "";
    cy.get(
      'div[class="flex flex-col sm:gap-2 hover:cursor-pointer hover:shadow-lg rounded-sm overflow-hidden max-sm:max-w-[200px]"]'
    )
      .first()
      ?.find("h6")
      .then(($el) => {
        // Extract the text content of the element
        heading = $el.text();
      });
    cy.get(
      'div[class="flex flex-col sm:gap-2 hover:cursor-pointer hover:shadow-lg rounded-sm overflow-hidden max-sm:max-w-[200px]"]'
    )
      .first()
      ?.find('p[class="body-regular"]')
      .then(($el) => {
        // Extract the text content of the element
        body = $el.text();
      });

    cy.then(() => {
      cy.get(
        'div[class="flex flex-col sm:gap-2 hover:cursor-pointer hover:shadow-lg rounded-sm overflow-hidden max-sm:max-w-[200px]"]'
      )
        .first()
        .click();
      cy.wait(3000);
      cy.contains(heading);
      cy.contains(body);
    });
  });

  it("test blog search", () => {
    cy.visit(`${baseRoute}/blogs`);
    cy.wait(2000);

    // first because of test we need to make sure there is at least one card here
    cy.get(
      'div[class="flex flex-col sm:gap-2 hover:cursor-pointer hover:shadow-lg rounded-sm overflow-hidden max-sm:max-w-[200px]"]'
    )
      .first()
      .should("exist");
    // let get the text from the existing card so we can use it to search
    let heading = "";
    cy.get(
      'div[class="flex flex-col sm:gap-2 hover:cursor-pointer hover:shadow-lg rounded-sm overflow-hidden max-sm:max-w-[200px]"]'
    )
      .first()
      ?.find("h6")
      .then(($el) => {
        // Extract the text content of the element
        heading = $el.text();
      });

    cy.then(() => {
      cy.wait(1000);

      cy.get("input", {
        timeout: 6000,
      })
        .first()
        .type(heading);

      cy.wait(1000);
      cy.get(
        'div[class="flex flex-col sm:gap-2 hover:cursor-pointer hover:shadow-lg rounded-sm overflow-hidden max-sm:max-w-[200px]"]'
      ).contains(heading);
    });
  });
});
