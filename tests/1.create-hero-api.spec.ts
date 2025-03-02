import {test, expect} from '@playwright/test';
import {WorkingClassHeroBuilder} from "../utils/data/working-class-heros-builder";
import {apiEndpoints} from "../utils/api-endpoints";
import {CommonUtils} from "../utils/common-utils";
import {ApiUtils} from "../utils/ApiUtils";

test.describe('AC1: Create a working class hero with valid payload', () => {
    test('Create a working class hero with valid payload', async ({ request }) => {

        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();

        const {responseBody} = await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,200);
        expect(responseBody).toHaveProperty('message');
        expect(responseBody).toHaveProperty('timestamp');

        // Check if the hero was created successfully in the database
        await CommonUtils.verifyDatabaseEntriesForHero([heroData.natid], 1);
    });
});

test.describe('AC2: Create a working class hero with invalid payload', () => {

    test('Invalid natid format should return 400 error', async ({ request }) => {

        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.natid = "natid-INVALID";

        const {responseBody} = await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,400)
        console.log(responseBody);
        expect(responseBody).toHaveProperty('errorMsg', 'Invalid natid');
    });

    test('Name length out of bounds should return 400 error', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.name = "";

        const {responseBody} = await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,400);
        const errorMessages = ['Invalid name', 'Name cannot be blank', 'Name must be between 1 and 100 characters'];
        expect(responseBody.errorMsg.split(',')).toEqual(expect.arrayContaining(errorMessages));

    });

    test('Invalid gender value should return 400 error', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.gender = 'OTHER';

        const {responseBody} = await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,400);
        expect(responseBody).toHaveProperty('errorMsg', 'Invalid gender');
    });

    test('Salary cannot be negative', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.salary = -10.00;

        const {responseBody} = await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,400);
        expect(responseBody).toHaveProperty('errorMsg', 'Salary must be greater than or equals to zero');
    });

    test('BrowniePoints and deathDate are nullable', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        heroData.browniePoints = null;
        heroData.deathDate = null;

        const {responseBody} = await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,200);
        expect(responseBody).toHaveProperty('message');
        expect(responseBody).toHaveProperty('timestamp');
    });
});

test.describe('AC3: Duplicate natid should return 400 error', () => {
    test('Duplicate natid should return 400 error', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder()
        const heroData = workingClassHeroBuilder.getHero();
        const natid = heroData.natid;

       await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,200);

        const {responseBody} = await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,400);
        expect(responseBody).toHaveProperty('errorMsg', `Working Class Hero of natid: ${natid} already exists!`);
    });
});

test.describe('AC4: Verify record is created in database table WORKING CLASS HEROES', () => {
    test('Verify record is created in database table WORKING CLASS HEROES', async ({ request }) => {
        const workingClassHeroBuilder = new WorkingClassHeroBuilder();
        const heroData = workingClassHeroBuilder.getHero();

        await ApiUtils.post(request,apiEndpoints.CREATE_HERO,heroData,200);

        const queryRes = await CommonUtils.verifyDatabaseEntriesForHero([heroData.natid],1);
        // Verify the hero was created successfully in the database
        expect(queryRes[0].natid).toBe(heroData.natid);
    });
});


