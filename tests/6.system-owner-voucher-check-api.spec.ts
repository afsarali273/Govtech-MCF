import { expect, test } from "@playwright/test";
import { WorkingClassHeroBuilder } from "../utils/data/working-class-heros-builder";
import {apiEndpoints} from "../utils/api-endpoints";
import {ApiUtils} from "../utils/ApiUtils";


// Helper function to create hero data with vouchers
function createHeroWithVouchers(): any {
    const heroData = new WorkingClassHeroBuilder().getHero();
    heroData.vouchers = [
        { voucherName: "VOUCHER 1", voucherType: "TRAVEL" },
        { voucherName: "VOUCHER 2", voucherType: "FOOD" },
        { voucherName: "VOUCHER 3", voucherType: "TRAVEL" },
        { voucherName: "VOUCHER 4", voucherType: "FOOD" },
        { voucherName: "VOUCHER 5", voucherType: "TRAVEL" },
        { voucherName: "VOUCHER 6", voucherType: "FOOD" },
        { voucherName: "VOUCHER 7", voucherType: "TRAVEL" },
        { voucherName: "VOUCHER 8", voucherType: "FOOD" },
        { voucherName: "VOUCHER 9", voucherType: "TRAVEL" },
        { voucherName: "VOUCHER 10", voucherType: "FOOD" },
    ];
    return heroData;
}

// Helper function to validate response structure
function validateVoucherResponseStructure(responseBody: any) {
    expect(Array.isArray(responseBody.data)).toBe(true);
    responseBody.data.forEach((item: any) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('voucherType');
        expect(item).toHaveProperty('count');
        expect(typeof item.name).toBe('string');
        expect(typeof item.voucherType).toBe('string');
        expect(typeof item.count).toBe('number');
    });
}

// Helper function to get hero data from the response
function getHeroDataFromResponse(responseBody: any, heroName: string) {
    return responseBody.data.filter((item: any) => item.name === heroName);
}

// Helper function to validate voucher counts for a hero
function validateVoucherCount(heroDataInResponse: any, expectedCounts: number[]) {
    expect(heroDataInResponse).toHaveLength(expectedCounts.length);
    expectedCounts.forEach((expectedCount, index) => {
        expect(heroDataInResponse[index].count).toBe(expectedCount);
    });
}

test('Successfully retrieve the number of vouchers each customer has for each category', async ({ request }) => {
    // Create Hero with Vouchers
    const heroData = createHeroWithVouchers();

    // Create the hero via API
    await ApiUtils.post(request,apiEndpoints.CREATE_HERO_WITH_VOUCHER,heroData,200, false);

    // Retrieve Vouchers
    const response = await request.get(apiEndpoints.GET_VOUCHER_COUNT);
    expect(response.status()).toBe(200);

    const {responseBody} = await ApiUtils.get(request, apiEndpoints.GET_VOUCHER_COUNT)

    // Validate response structure
    validateVoucherResponseStructure(responseBody);

    // Get hero data from response
    const heroDataInResponse = getHeroDataFromResponse(responseBody, heroData.name);

    // Verify voucher counts for the hero (5 TRAVEL, 5 FOOD)
    validateVoucherCount(heroDataInResponse, [5, 5]);
});
