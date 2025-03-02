import { expect, test } from "@playwright/test";
import { WorkingClassHeroBuilder } from "../utils/data/working-class-heros-builder";
import {apiEndpoints} from "../utils/api-endpoints";
import {CommonUtils} from "../utils/common-utils";
import {ApiUtils} from "../utils/ApiUtils";

test('Successfully create a working class hero with vouchers', async ({ request }) => {
    const heroData = new WorkingClassHeroBuilder().getHero();
    heroData.vouchers = [{ voucherName: "VOUCHER 1", voucherType: "TRAVEL" }];

    await ApiUtils.post(request,apiEndpoints.CREATE_HERO_WITH_VOUCHER,heroData,200, false);

    // Verify vouchers were created in the database
    await CommonUtils.verifyVouchersInDatabase(heroData.natid, 1);
});

// Test for Failing to Create a Working Class Hero When Vouchers Are Empty
test('Fail to create working class hero when vouchers are empty', async ({ request }) => {
    const heroData = new WorkingClassHeroBuilder().getHero();
    heroData.vouchers = [];

    await ApiUtils.post(request,apiEndpoints.CREATE_HERO_WITH_VOUCHER,heroData,400, false);

    // Verify no hero or vouchers were created in the database
    await CommonUtils.verifyVouchersInDatabase(heroData.natid, 0);
});
