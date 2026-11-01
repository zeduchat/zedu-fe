const apiResponse = (data) => ({
  statusCode: 200,
  body: { status: "success", status_code: 200, data },
});

describe("organisation deletion password verification", () => {
  const orgId = "test-organisation-id";
  const route = "/test-org/settings/organisation/general";

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js",
      {
        statusCode: 200,
        headers: { "content-type": "application/javascript" },
        body: `
          window.OneSignal = {
            init: () => Promise.resolve(),
            Notifications: {
              requestPermission: () => Promise.resolve(),
              addEventListener: () => {},
              removeEventListener: () => {},
            },
          };
          window.OneSignalDeferred.forEach((callback) => callback(window.OneSignal));
        `,
      }
    );
    cy.intercept("GET", "**/mock-gtm.js*", {
      statusCode: 200,
      headers: { "content-type": "application/javascript" },
      body: "",
    });
    cy.intercept("GET", "**/api/v1/**", apiResponse([]));
    cy.intercept("GET", "**/profile", apiResponse({ id: "test-user-id" }));
    cy.intercept(
      "GET",
      `**/organisations/${orgId}`,
      apiResponse({
        id: orgId,
        name: "Test Organisation",
        role: "owner",
        organisation_slug: "test-org",
      })
    );
    cy.intercept("GET", "**/permissions", apiResponse([]));
    cy.intercept("GET", `**/organisations/${orgId}/roles`, apiResponse([]));
    cy.intercept("GET", `**/organisations/${orgId}/invites`, apiResponse([]));
    cy.intercept("GET", "**/organisations/*/users*", apiResponse([]));
    cy.intercept("GET", "**/users/organisations", apiResponse([]));
    cy.visit(route, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "cypress-test-token");
        win.localStorage.setItem("orgId", orgId);
        win.localStorage.setItem("orgSlug", "test-org");
      },
    });
    cy.contains("button", "Decline", { timeout: 20000 }).click();
    cy.contains("button", "Delete this organisation", {
      timeout: 20000,
    }).should("be.visible");
  });

  const openConfirmation = () => {
    cy.contains("button", "Delete this organisation").click();
    cy.contains("button", "Continue").click();
    cy.get("#password").type("incorrect-password");
    cy.get("#consent").check();
  };

  it("sends the password and keeps the dialog open after rejection", () => {
    cy.intercept("DELETE", `**/organisations/${orgId}`, (request) => {
      expect(request.body).to.deep.equal({ password: "incorrect-password" });
      request.reply({
        statusCode: 400,
        body: { message: "password verification failed" },
      });
    }).as("deleteOrganisation");

    openConfirmation();
    cy.contains("button", "Delete Account").click();

    cy.wait("@deleteOrganisation");
    cy.get('[role="dialog"] [role="alert"]')
      .should("be.visible")
      .and("contain", "password verification failed");
    cy.get("#password").should("be.visible");
    cy.url().should("include", route);
    cy.contains("Organisation deleted successfully").should("not.exist");
  });

  it("submits only once when the delete action is clicked repeatedly", () => {
    let requestCount = 0;
    cy.intercept("DELETE", `**/organisations/${orgId}`, (request) => {
      requestCount += 1;
      request.reply({
        delay: 300,
        statusCode: 400,
        body: { message: "password verification failed" },
      });
    }).as("deleteOrganisation");

    openConfirmation();
    cy.contains("button", "Delete Account").then(($button) => {
      const button = $button[0];
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    cy.wait("@deleteOrganisation");
    cy.wait(400);
    cy.wrap(null).should(() => expect(requestCount).to.equal(1));
  });
});
