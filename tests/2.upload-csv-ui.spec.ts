import {expect} from "@playwright/test";
import * as path from "node:path";
import * as fs from "node:fs";
import { FileUtils } from "../utils/file-utils";
import GlobalDataStore from "../utils/GlobalDataStore";
import { WorkingClassHero } from "../utils/data/working-class-heros-builder";
import {LOGIN_URL} from "../utils/api-endpoints";
import {DashboardPage} from "../page-object/dashboard.page";
import {test} from "../page-object/base-page";
import {CommonUtils} from "../utils/common-utils";

function cleanupFile(filePath: string) {
    fs.unlinkSync(filePath);
}

test.beforeEach('Navigation to Login Page', async ({page}) => {
    await page.goto(LOGIN_URL);
})

test('Successfully upload and create heroes from a valid CSV file', async ({ page, loginPage }) => {
    const filePath = FileUtils.createCleanCsvFileForHeroes(3);
    console.log(`CSV file path: ${filePath}`);

    // Login and upload file
    await loginPage.loginAs('Clerk');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.uploadCsvFile(filePath);
    await expect(await dashboardPage.getSuccessMessageEl()).toHaveText('Created Successfully!');

    // Verify the records are persisted in the database
    const herosUploaded: WorkingClassHero[] = GlobalDataStore.get('heroesCleanData');
    const natIds = await Promise.all(herosUploaded.map(async (hero) => hero.natid));
    await CommonUtils.verifyDatabaseEntriesForHero(natIds, 3); // AC1: Verify that 3 records were persisted

    // Cleanup
    cleanupFile(filePath);
});

test('Upload a CSV file with an erroneous record and create valid heroes', async ({ page, loginPage }) => {
    const filePath = FileUtils.createPartialCleanCsvFileForHeroes(3);
    console.log(`CSV file path: ${filePath}`);

    // Login and upload file
    await loginPage.loginAs('Clerk');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.uploadCsvFile(filePath);
    await expect(await dashboardPage.getFailureMessageEl()).toHaveText('There are 1 records which were not persisted! Please contact tech support for help!');

    // Verify the records are persisted in the database
    const herosUploaded: WorkingClassHero[] = GlobalDataStore.get('heroesPartialCleanData');
    const natIds = await Promise.all(herosUploaded.map(async (hero) => hero.natid));
    console.log(natIds);

    await CommonUtils.verifyDatabaseEntriesForHero(natIds, 2); // AC4: Verify 2 records were persisted

    // Cleanup
    cleanupFile(filePath);
});

test('Upload an invalid CSV file format (missing required fields)', async ({ page, loginPage }) => {
    const invalidCsvData = `natid,name,gender,birthDate
natid-01,Alice,FEMALE,1990-01-01T12:00:00`;

    const csvFilePath = path.join(__dirname, 'invalid-format.csv');
    fs.writeFileSync(csvFilePath, invalidCsvData);

    // Login and upload file
    await loginPage.loginAs('Clerk');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.uploadCsvFile(csvFilePath);
    await expect(await dashboardPage.getFailureMessageEl()).toHaveText('Unable to process csv file! Please contact tech support for help!');

    // Cleanup
    cleanupFile(csvFilePath);
});
