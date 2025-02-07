import { faker } from "@faker-js/faker";

describe('Contact List App', () => {
    let user;

    before(() => {
        // Prepare test data - dynamic test data generation
        user = generateUserData();
    });

    beforeEach(() => {
        // Arrange - access the site
        cy.visit('/');
        cy.contains('Contact List App');
    });

    context('Un-registered user log in attempt', () => {
        it('login fails with incorrect credentials', () => {
            // Act
            userLogin(user);

            // Assert
            cy.get("#error").should("have.text", "Incorrect username or password");
        });
    });

    context('User tries to register with empty fields', () => {
        it('login fails with user validation failure', () => {
            //Act
            cy.get("#signup").click();
            cy.url().should('eq', `${Cypress.config('baseUrl')}/addUser`);
            cy.contains('Add User');
            cy.get("#submit").click();

            //Assert
            cy.get("#error").should("have.text", "User validation failed: firstName: Path `firstName` is required., lastName: Path `lastName` is required., email: Email is invalid, password: Path `password` is required.");
        });
    });

    context('User registers successfully', () => {
        it('user registration with valid values', () => {
            //Act
            cy.get("#signup").click();
            cy.url().should('eq', `${Cypress.config('baseUrl')}/addUser`);
            cy.contains('Add User');

            fillUserRegistrationForm(user);
            cy.get("#submit").click();

            //Assert
            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`)
            cy.contains('Contact List')
            cy.get("#logout").should('have.text', 'Logout')
        });
    });

    context('User tries to add contact with empty fields', () => {
        it('contact registration fails with contact validation failure', () => {
            //Act
            userLogin(user);

            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`)
            cy.get("#add-contact").click()
            cy.url().should('eq', `${Cypress.config('baseUrl')}/addContact`)

            cy.get("#submit").click();

            //Assert
            cy.get("#error").should("have.text", "Contact validation failed: firstName: Path `firstName` is required., lastName: Path `lastName` is required.");
        });
    });

    context('User adds a contact successfully', () => {
        let contact;

        it('user adds a contact with valid values', () => {
            // Arrange - random test data generation for adding contacts
            contact = generateContactData();

            //Act
            userLogin(user);

            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`);
            cy.get("#add-contact").click();
            cy.url().should('eq', `${Cypress.config('baseUrl')}/addContact`);

            fillContactForm(contact);
            cy.get("#submit").click();

            //Assert
            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`);
            cy.contains('Contact List');
            validateContactTable(contact);
        });
    });

    context('User logs out successfully', () => {
        it('log out', () => {
            //Act
            userLogin(user);
            cy.url().should('eq', `${Cypress.config('baseUrl')}/contactList`);
            userLogOut();

            //Assert
            validateLoginPage();
        });
    });

    function validateLoginPage() {
        cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
        cy.contains('Contact List App');
    }

    function userLogin(user) {
        cy.get("#email").type(user.email);
        cy.get("#password").type(user.password);
        cy.get("#submit").click();
    }

    function generateUserData() {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        return {
            firstName: firstName,
            lastName: lastName,
            email: `${firstName}.${lastName}@example.com`,
            password: "Sugar123Bravo$",
        }
    }

    function fillUserRegistrationForm(user) {
        cy.get("#firstName").type(user.firstName);
        cy.get("#lastName").type(user.lastName);
        cy.get("#email").type(user.email);
        cy.get("#password").type(user.password);
    }

    function generateContactData() {
        const contactFirstName = faker.person.firstName();
        const contactLastName = faker.person.lastName();
        return {
            contactFirstName: contactFirstName,
            contactLastName: contactLastName,
            contactEmail: `${contactFirstName}.${contactLastName}@example.com`,
            contactPhone: faker.phone.number({ style: 'international' }),
            contactBirthDate: faker.date.birthdate().toISOString().slice(0, 10).replace(/-/g, '-'),
            contactStreetAddress: faker.location.streetAddress(),
            contactPostalCode: faker.location.zipCode(),
            contactCity: faker.location.city(),
            contactCountry: faker.location.country(),
        }
    }

    function fillContactForm(contact) {
        cy.get("#firstName").type(contact.contactFirstName);
        cy.get("#lastName").type(contact.contactLastName);
        cy.get("#birthdate").type(contact.contactBirthDate);
        cy.get("#email").type(contact.contactEmail);
        cy.get("#phone").type(contact.contactPhone);
        cy.get("#street1").type(contact.contactStreetAddress);
        cy.get("#city").type(contact.contactCity);
        cy.get("#postalCode").type(contact.contactPostalCode);
        cy.get("#country").type(contact.contactCountry);
    }

    function validateContactTable(contact) {
        cy.get("#myTable")
            .find("tr:last")
            .within(() => {
                cy.get("td").eq(1).should("have.text", `${contact.contactFirstName} ${contact.contactLastName}`);
                cy.get("td").eq(2).should("have.text", contact.contactBirthDate);
                cy.get("td").eq(3).invoke("text").then((email) => {
                    expect(email.trim().toLowerCase()).to.eq(contact.contactEmail.toLowerCase());
                });
                cy.get("td").eq(4).should("have.text", contact.contactPhone);
                cy.get("td").eq(5).invoke("text")
                    .then((streetAddress) => {
                        const cleanedAddress = streetAddress.replace(/\u00A0/g, " ").trim(); // remove &nbsp; and trim
                        expect(cleanedAddress).to.eq(contact.contactStreetAddress);
                });
                cy.get("td").eq(6).invoke("text")
                    .then((text) => {
                        // Normalize multiple spaces to a single space
                        const actualText = text.replace(/\s+/g, " ").trim(); // Replace multiple spaces with a single one
                        const expectedText = `${contact.contactCity} ${contact.contactPostalCode}`.replace(/\s+/g, " ").trim(); // normalize the expected text
                        expect(actualText).to.eq(expectedText);
                    });
                cy.get("td").eq(7).should("have.text", contact.contactCountry);
        });
    }

    function userLogOut() {
        cy.get("#logout").click();
    }
 })