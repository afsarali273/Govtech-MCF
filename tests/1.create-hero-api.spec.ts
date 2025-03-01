import {test, expect} from '@playwright/test';
import {WorkingClassHeroBuilder} from "../utils/data/working-class-heros-builder";
import DatabaseUtil from "../utils/DatabaseUtil";
import {apiEndpoints} from "../utils/api-endpoints";

 const apiUrl = apiEndpoints.CREATE_HERO;

test.describe('AC1: Create a working class hero with valid payload', () => {
    test('Create a working class hero with valid payload', async ({ request }) => {

        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();

        console.log(heroData);

        const response = await request.post(apiUrl, { data: heroData });

        // Check if the status code is 201 (Created)
        expect(response.status()).toBe(200)

        const responseBody = await response.json();
        expect(response.status()).toBe(200);
        expect(responseBody).toHaveProperty('message');
        expect(responseBody).toHaveProperty('timestamp');

        // Check if the hero was created successfully in the database

    });
});

test.describe('AC2: Create a working class hero with invalid payload', () => {

    test('Invalid natid format should return 400 error', async ({ request }) => {

        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.natid = "natid-INVALID";


        const response = await request.post(apiUrl, { data: heroData });

        // Expecting 400 Bad Request
        expect(response.status()).toBe(400);

        // Check for error message regarding natid format
        const responseBody = await response.json();
        console.log(responseBody);
        expect(responseBody).toHaveProperty('errorMsg', 'Invalid natid');
    });

    test('Name length out of bounds should return 400 error', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.name = "";

        const response = await request.post(apiUrl, { data: heroData });

        // Expecting 400 Bad Request
        expect(response.status()).toBe(400);

        // Check for error message regarding name length
        const responseBody = await response.json();
        const errorMessages = ['Invalid name', 'Name cannot be blank', 'Name must be between 1 and 100 characters'];
        expect(responseBody.errorMsg.split(',')).toEqual(expect.arrayContaining(errorMessages));

    });

    test('Invalid gender value should return 400 error', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.gender = 'OTHER';

        const response = await request.post(apiUrl, { data: heroData });

        // Expecting 400 Bad Request
        expect(response.status()).toBe(400);

        // Check for error message regarding gender validation
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('errorMsg', 'Invalid gender');
    });

    test('Salary cannot be negative', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.salary = -10.00;

        const response = await request.post(apiUrl, { data: heroData });

        // Expecting 400 Bad Request
        expect(response.status()).toBe(400);

        // Check for error message regarding salary validation
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('errorMsg', 'Salary must be greater than or equals to zero');
    });

    test('BrowniePoints and deathDate are nullable', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.browniePoints = null;
        heroData.deathDate = null;

        const response = await request.post(apiUrl, { data: heroData });

        // Expecting 201 Created
        expect(response.status()).toBe(200);

        // Check if response indicates successful creation
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('message');
        expect(responseBody).toHaveProperty('timestamp');
    });
});

test.describe('AC3: Duplicate natid should return 400 error', () => {
    test('Duplicate natid should return 400 error', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        const natid = heroData.natid;

        const response1 = await request.post(apiUrl, { data: heroData });

        // Check if the status code is 200 (Created)
        expect(response1.status()).toBe(200);

        // Now, try creating a second hero with the same natid
        const response2 = await request.post(apiUrl, { data: heroData });

        // Expecting 400 Bad Request due to duplicate natid
        expect(response2.status()).toBe(400);

        // Check for error message
        const responseBody = await response2.json();
        expect(responseBody).toHaveProperty('errorMsg', `Working Class Hero of natid: ${natid} already exists!`);
    });
});

test.describe('AC4: Verify record is created in database table WORKING CLASS HEROES', () => {
    test('Verify record is created in database table WORKING CLASS HEROES', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder();
        const heroData = workingClassHeroBuilder.getHero();

        const response = await request.post(apiUrl, { data: heroData });
        expect(response.status()).toBe(200);

        // Verify the hero was created successfully in the database
        const query = `SELECT * FROM working_class_heroes WHERE natid = '${heroData.natid}'`;
        const queryRes = await DatabaseUtil.getInstance().get(query);
        console.log(queryRes);
        expect(queryRes).toHaveLength(1);
        expect(queryRes[0].natid).toBe(heroData.natid);
    });
});


