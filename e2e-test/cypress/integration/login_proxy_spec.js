describe("Login with proxy", () => {
  beforeEach(() => {
    cy.visit(`/`);
  });

  it("should login with a valid cookie", () => {
    cy.setCookie(
      "authorizationToken",
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtc3RlaW4iLCJtZXRhZGF0YSI6eyJleHRlcm5hbElkIjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklpd2lZV3huSWpvaVVsTkJMVTlCUlZBaUxDSnJhV1FpT2lKbE9UZFpaWE0zTVZsbGIwRlVia1JmYlcxa1dFcE9Va3RyYVRoR0xUaDViVFZwZFZkbVJHTTBaMFJWSW4wLk1sTUZ4c0t5c3lER1pXV3hZTkZpRFF3c0ZXOUF4aFoyaXVCRURhbHNJWE1QZy1QdE5PR2NHVTlic3VwQkt6Mzd0QXlyRDc5RmMxLWZMVkpJYlh3MVRYVm1GX1hyaE9TT2h0Q09tTE9QUW8xNDRmR0QtcjZWZGRnQmhvdWZOTTJzNlh2RDVrMnpWSlJQOEkyRU9VMHJSeDhpby1NMzd1ZnFsUGJRRXd3QkNJZjRZWjk0U3JMclRXdy1HeFpmaEtydzN5ZGhvMEpNakh5cmdUR1pwcnR2YlJzQVZLMTVVMXd4cHViRm9LZ3plWDl4cmFlYlpYSHJlSVpXbmU5QXljY3c0eWNrLWdfdXAyXzB3dEF1aHVGdlZUTFhjcllVTlRpX1lSM3dJcVZLX3l3a0d6MVhNaDZzTG5OSmxZeWZLTDFqcmM5bDBXNW1qeGxrbU5jNC1hWTZVUS5HN0MtcEhYLWk2RWtyZm5JbmtMeHhBLlBXVHZtckJLYXlheU5FckNnLUtQNGZDUzgyRjItdHJTLUJBaS1DV2ZHQ3hVOVFqMUJ4cHBXX1RXR3l5cElha0wuQUN2Umx1elVFX2hsdDc2bDZzZnNCUSJ9LCJjc3JmIjoiRUhTdFBySG5PM0dCMjE2VCIsImp0aSI6Ijc1N2NhOGE2LWY5NWMtNGUwZi1iNjFlLTgwNTRhMTMxZTIwMiIsImlhdCI6MTY5Njg0MjIzMywiZXhwIjoxOTU2MDQyMjMzfQ.vaiRQGckw9eQJ6aplot2HVmBHXO1R_SgdAbyYkFQot4"
    );
    cy.visit("/login?token=EHStPrHnO3GB216T");

    cy.get("#logoutbutton").should("be.visible");

    cy.visit(`/projects`);
    cy.get("[data-test=project-creation]").should("be.visible");
  });
});
