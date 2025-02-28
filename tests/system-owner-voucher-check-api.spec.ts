// API URL for retrieving vouchers by person and type
import {expect, test} from "@playwright/test";

const vouchersUrl = 'https://your-api-url.com/api/v1/voucher/by-person-and-type';

test('Successfully retrieve the number of vouchers each customer has for each category', async ({ request }) => {
    const response = await request.get(vouchersUrl);

    // Verify response status code is 200 (OK)
    expect(response.status()).toBe(200);

    // Parse response JSON
    const responseBody = await response.json();

    // Verify the structure of the response data
    expect(Array.isArray(responseBody.data)).toBe(true);
    if (responseBody.data.length > 0) {
        responseBody.data.forEach(item => {
            expect(item).toHaveProperty('name');
            expect(item).toHaveProperty('voucherType');
            expect(item).toHaveProperty('count');
            expect(typeof item.name).toBe('string');
            expect(typeof item.voucherType).toBe('string');
            expect(typeof item.count).toBe('number');
        });
    }
});

test('No vouchers available for a customer', async ({ request }) => {
    const response = await request.get(vouchersUrl);

    // Verify response status code is 200 (OK)
    expect(response.status()).toBe(200);

    // Parse response JSON
    const responseBody = await response.json();

    // Verify the response contains an empty "data" array
    expect(responseBody.data).toEqual([]);
});
