describe("Telex Faq Page", () => {
  const baseRoute = Cypress.env("baseUrl");

  it("has page title", () => {
    cy.visit(`${baseRoute}/faq`);
    cy.contains("Got Questions?");
    cy.contains(
      "Explore common questions and answers to get the most out of Telex."
    );
  });
  it("test faq accordion if it works", () => {
    cy.visit(`${baseRoute}/faq`);

    // check the accordion first if there is a div element which represent the body of accodion content
    cy.get('div[data-orientation="vertical"]')
      .first()
      ?.find('div[class="pb-4 pt-0 text-[#767676]"]')
      .should("not.exist");
    cy.get('div[data-orientation="vertical"]')
      .first()
      .click()
      ?.find('div[class="pb-4 pt-0 text-[#767676]"]')
      .should("exist");
  });

  it("Test Call To action", () => {
    cy.visit(`${baseRoute}/faq`);
    cy.contains("Get in Touch with Telex");
    cy.contains(
      "Our team is a dedicated to responing to your inquiries. If you have questions or require further assistance, plase don't hesitate to reach out."
    );
    cy.get("button").contains("Contact Us");
  });
});
