import { faker } from "@faker-js/faker";

describe('User login', () => {

    let firstName, lastName, email, password;

    before(() => {
        // Prepare test data - random and dynamic test data generation
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        email = `${firstName}.${lastName}@example.com`;
        password = "Sugar123Bravo$";
    });

    beforeEach(() => {
        // Arrange - access the site
        cy.visit('/');
        cy.contains('Contact List App');
    });

    context('Un-registered user tries to log in', () => {
        it('invalid login test', () => {
            // Act
            cy.get("#email").type(email);
            cy.get("#password").type(password);
            cy.get("#submit").click();

            // Assert
            cy.get("#error").should("have.text", "Incorrect username or password");
        });
    });

    context('User tries to register with empty fields', () => {
        it('empty credentials entered for user registration', () => {
            //Act
            cy.get("#signup").click()
            cy.url().should('eq', `${Cypress.config('baseUrl')}/addUser`)
            cy.contains('Add User')
            cy.get("#submit").click()

            //Assert
            cy.get("#error").should("have.text", "User validation failed: firstName: Path `firstName` is required., lastName: Path `lastName` is required., email: Email is invalid, password: Path `password` is required.")
        });
    });

    context('User registers successfully', () => {
        it('user registration with valid values', () => {
            //Act
            cy.get("#signup").click()
            cy.url().should('eq', `${Cypress.config('baseUrl')}/addUser`)
            cy.contains('Add User')
            cy.get("#firstName").type(firstName)
            cy.get("#lastName").type(lastName)
            cy.get("#email").type(email)
            cy.get("#password").type(password)
            cy.get("#submit").click();

            //Assert
            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`)
            cy.contains('Contact List')
            cy.get("#logout").should('have.text', 'Logout')
        });
    });

    context('User tries to add empty fields', () => {
        it('Add contact with empty fields', () => {
            //Act
            cy.get("#email").type(email);
            cy.get("#password").type(password);
            cy.get("#submit").click();

            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`)
            cy.get("#add-contact").click()
            cy.url().should('eq', `${Cypress.config('baseUrl')}/addContact`)

            cy.get("#submit").click();

            //Assert
            cy.get("#error").should("have.text", "Contact validation failed: firstName: Path `firstName` is required., lastName: Path `lastName` is required.");
        });
    });

    context('User adds a contact successfully', () => {
        it('Add contact', () => {
            // Arrange - random test data generation for adding contacts
            const contactFirstName = faker.person.firstName();
            const contactLastName = faker.person.lastName();
            const contactEmail = `${contactFirstName}.${contactLastName}@example.com`;
            const contactPhone = faker.phone.number({ style: 'international' });
            const contactBirthDate = faker.date.birthdate();
            // Convert the Date object to a string in the desired format (yyyy-MM-dd)
            const formattedBirthDate = contactBirthDate.toISOString().slice(0, 10).replace(/-/g, '-');
            const contactStreetAddress = faker.location.streetAddress();
            const contactPostalCode = faker.location.zipCode();
            const contactCity = faker.location.city();
            const contactCountry = faker.location.country();

            //Act
            cy.get("#email").type(email);
            cy.get("#password").type(password);
            cy.get("#submit").click();
;
            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`);
            cy.get("#add-contact").click();
            cy.url().should('eq', `${Cypress.config('baseUrl')}/addContact`);

            cy.get("#firstName").type(contactFirstName);
            cy.get("#lastName").type(contactLastName);
            cy.get("#birthdate").type(formattedBirthDate);
            cy.get("#phone").type(contactPhone);
            cy.get("#email").type(contactEmail);
            cy.get("#street1").type(contactStreetAddress);
            cy.get("#city").type(contactCity);
            cy.get("#postalCode").type(contactPostalCode);
            cy.get("#country").type(contactCountry);
            cy.get("#submit").click();

            //Assert
            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`)
            cy.contains('Contact List')
            cy.get("#myTable")
                .find("tr:last")
                .within(() => {
                    cy.get("td").eq(1).should("have.text", `${contactFirstName} ${contactLastName}`);
                    cy.get("td").eq(2).should("have.text", formattedBirthDate);
                    cy.get("td").eq(3).invoke("text").then((email) => {
                        expect(email.trim().toLowerCase()).to.eq(contactEmail.toLowerCase());
                    });
                    cy.get("td").eq(4).should("have.text", contactPhone);
                    cy.get("td").eq(5).invoke("text")
                        .then((streetAddress) => {
                            const cleanedAddress = streetAddress.replace(/\u00A0/g, " ").trim(); // remove &nbsp; and trim
                            expect(cleanedAddress).to.eq(contactStreetAddress);
                    });
                    cy.get("td").eq(6).invoke("text")
                        .then((text) => {
                            // Normalize multiple spaces to a single space
                            const cleanedText = text.replace(/\s+/g, " ").trim(); // Replace multiple spaces with a single one
                            const expectedText = `${contactCity} ${contactPostalCode}`.replace(/\s+/g, " ").trim(); // Also normalize the expected text
                            expect(cleanedText).to.eq(expectedText); // Compare cleaned values
                      });
                    cy.get("td").eq(7).should("have.text", contactCountry);
                });
        });
    });
 })