import { faker } from "@faker-js/faker";

// Generate a random user
export function generateUserData() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
        firstName: firstName,
        lastName: lastName,
        email: `${firstName}.${lastName}@example.com`,
        password: "Sugar123Bravo$",
    };
}

// Generate a random contact
export function generateContactData() {
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
    };
}