import {expect, test} from "@playwright/test";

const oweMoneyUrl = 'http://localhost:9997/api/v1/hero/owe-money';

test('Successfully check if a working class hero owes money', async ({ request }) => {
    const response = await request.get(`${oweMoneyUrl}?natid=1`);

    // Verify response status code is 200 (OK)
    expect(response.status()).toBe(200);

    // Verify response body matches expected payload
    const responseBody = await response.json();
    expect(responseBody.message.data).toBe('natid-1');
    expect(responseBody.message.status).toBe('OWE');
    expect(responseBody.timestamp).toBeTruthy();
});

test('Fail when the natid is not numeric', async ({ request }) => {
    const response = await request.get(`${oweMoneyUrl}?natid=abc`);

    // Verify response status code is 400 (Bad Request)
    expect(response.status()).toBe(400);

    // Verify the response body contains an error indicating that natid must be numeric
    const responseBody = await response.json();
    expect(responseBody.message).toContain('natid must be numeric');
});

test('Successfully check if a working class hero does not owe money', async ({ request }) => {
    const response = await request.get(`${oweMoneyUrl}?natid=2`);

    // Verify response status code is 200 (OK)
    expect(response.status()).toBe(200);

    // Verify response body matches expected payload
    const responseBody = await response.json();
    expect(responseBody.message.data).toBe('natid-2');
    expect(responseBody.message.status).toBe('NIL');
    expect(responseBody.timestamp).toBeTruthy();
});
