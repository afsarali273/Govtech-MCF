import { expect, test } from "@playwright/test";
import { apiEndpoints } from "../utils/api-endpoints";
import { WorkingClassHeroBuilder } from "../utils/data/working-class-heros-builder";
import * as Joi from "joi";

// Joi schema for the response
const responseSchema = Joi.object({
    message: Joi.object({
        data: Joi.string().pattern(/^natid-\d+$/).required(),  // Format: natid-<number>
        status: Joi.string().valid('NIL', 'OWE').required(),  // Status should be "OWE" or "NIL"
    }).required(),
    timestamp: Joi.string().isoDate().required(),  // Timestamp should be a valid ISO string
});

// Function to validate API response schema
async function validateApiResponseSchema(responseBody: any, natid: string) {
    const { error } = responseSchema.validate(responseBody);

    if (error) {
        throw new Error(`API response validation failed: ${error.details.map(d => d.message).join(', ')}`);
    }

    // Check if 'data' matches the expected natid format
    expect(responseBody.message.data).toBe(`natid-${natid}`);
}

// Function to create a working class hero
async function createHero(request: any) {
    const workingClassHeroBuilder = new WorkingClassHeroBuilder();
    const heroData = workingClassHeroBuilder.getHero();
    const createHeroRes = await request.post(apiEndpoints.CREATE_HERO, { data: heroData });
    expect(createHeroRes.status()).toBe(200);
    return heroData;
}

// Test for successfully checking if a working class hero owes money
test('Successfully check if a working class hero owes money', async ({ request }) => {
    const heroData = await createHero(request);

    const heroOwesMoneyRes = await request.get(`${apiEndpoints.HERO_OWES_MONEY}?natid=${heroData.natid}`);
    expect(heroOwesMoneyRes.status()).toBe(200);

    const responseBody = await heroOwesMoneyRes.json();
    expect(responseBody.message.data).toBe(`natid-${heroData.natid}`);
    expect(responseBody.message.status).toBe('OWE');
    expect(responseBody.timestamp).toBeTruthy();

    // Validate the response schema
    await validateApiResponseSchema(responseBody, heroData.natid);
});

// Test for failing when the natid is not numeric
test('Fail when the natid is not numeric', async ({ request }) => {
    const response = await request.get(`${apiEndpoints.HERO_OWES_MONEY}?natid=abc`);
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.message).toContain('natid must be numeric');
});

// Test for successfully checking if a working class hero does not owe money
test('Successfully check if a working class hero does not owe money', async ({ request }) => {
    const response = await request.get(`${apiEndpoints.HERO_OWES_MONEY}?natid=2`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.message.data).toBe('natid-2');
    expect(responseBody.message.status).toBe('NIL');
    expect(responseBody.timestamp).toBeTruthy();
});
