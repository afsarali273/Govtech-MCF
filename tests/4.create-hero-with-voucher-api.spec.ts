import { expect, test } from "@playwright/test";
import { WorkingClassHeroBuilder } from "../utils/data/working-class-heros-builder";
import DatabaseUtil from "../utils/DatabaseUtil";
import {apiEndpoints} from "../utils/api-endpoints";

// Constants

// Utility Function for Posting Hero Data
async function postHeroData(request: any, heroData: any) {
    return await request.post(apiEndpoints.CREATE_HERO_WITH_VOUCHER, { data: heroData });
}

// Utility Function to Verify Vouchers in Database
async function verifyVouchersInDatabase(natid: string, expectedVoucherCount: number) {
    const query = `
        SELECT v.name, wch.natid
        FROM working_class_heroes AS wch
        INNER JOIN vouchers AS v ON wch.id = v.working_class_hero_id
        WHERE wch.natid = '${natid}';
    `;
    const queryRes = await DatabaseUtil.getInstance().get(query);
    expect(queryRes).toHaveLength(expectedVoucherCount);
}

// Test for Successfully Creating a Working Class Hero with Vouchers
test('Successfully create a working class hero with vouchers', async ({ request }) => {
    const heroData = new WorkingClassHeroBuilder().getHero();
    heroData.vouchers = [{ voucherName: "VOUCHER 1", voucherType: "TRAVEL" }];

    const response = await postHeroData(request, heroData);

    // Check if the status code is 200 (Created)
    expect(response.status()).toBe(200);

    // Verify vouchers were created in the database
    await verifyVouchersInDatabase(heroData.natid, 1);
});

// Test for Failing to Create a Working Class Hero When Vouchers Are Empty
test('Fail to create working class hero when vouchers are empty', async ({ request }) => {
    const heroData = new WorkingClassHeroBuilder().getHero();
    heroData.vouchers = [];

    const response = await postHeroData(request, heroData);

    // Check if the status code is 400 (Bad Request)
    expect.soft(response.status()).toBe(400);

    // Verify no hero or vouchers were created in the database
    await verifyVouchersInDatabase(heroData.natid, 0);
});
