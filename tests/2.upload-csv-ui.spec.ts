import {expect, Page, test} from "@playwright/test";
import * as path from "node:path";
import * as fs from "node:fs";
import { FileUtils } from "../utils/file-utils";
import GlobalDataStore from "../utils/GlobalDataStore";
import { WorkingClassHero } from "../utils/data/working-class-heros-builder";
import DatabaseUtil from "../utils/DatabaseUtil";
import {CLERK_DASHBOARD_URL, LOGIN_URL} from "../utils/api-endpoints";


async function loginAsClerk(page: Page) {
    await page.goto(LOGIN_URL);
    await page.fill('[id="username-in"]', 'clerk');
    await page.fill('[id="password-in"]', 'clerk');
    await page.click('input[type="submit"]');
    await page.waitForURL(CLERK_DASHBOARD_URL);
    const headingTitle = await page.locator('h1');
    const subTitle = await page.locator('span');
    await expect(headingTitle).toHaveText('Clerk Dashboard');
    await expect(subTitle).toHaveText('Welcome Home Clark!');
}

async function uploadCsvFile(page: Page, filePath: string) {
    await page.click('[id="dropdownMenuButton2"]');
    await page.click('text=Upload a csv file');
    await page.getByRole('textbox', { name: 'Upload CSV file' }).setInputFiles(filePath);
    await page.getByRole('button', { name: 'Create' }).click();
}

async function verifyDatabaseEntries(natIds: string[], expectedLength: number) {
    const query = `SELECT * FROM working_class_heroes WHERE natid IN ('${natIds.join("','")}')`;
    const queryRes = await DatabaseUtil.getInstance().get(query);
    console.log(queryRes);
    expect(queryRes, {message: 'Persisted Data in DB does not match'}).toHaveLength(expectedLength);
}

function cleanupFile(filePath: string) {
    fs.unlinkSync(filePath);
}

test('Successfully upload and create heroes from a valid CSV file', async ({ page }) => {
    const filePath = FileUtils.createCleanCsvFileForHeroes(3);
    console.log(`CSV file path: ${filePath}`);

    // Login and upload file
    await loginAsClerk(page);
    await uploadCsvFile(page, filePath);
    await expect(page.locator('[id="notification-block"]')).toHaveText('Created Successfully!');

    // Verify the records are persisted in the database
    const herosUploaded: WorkingClassHero[] = GlobalDataStore.get('heroesCleanData');
    const natIds = await Promise.all(herosUploaded.map(async (hero) => hero.natid));
    await verifyDatabaseEntries(natIds, 3); // AC1: Verify that 3 records were persisted

    // Cleanup
    cleanupFile(filePath);
});

test('Upload a CSV file with an erroneous record and create valid heroes', async ({ page }) => {
    const filePath = FileUtils.createPartialCleanCsvFileForHeroes(3);
    console.log(`CSV file path: ${filePath}`);

    // Login and upload file
    await loginAsClerk(page);
    await uploadCsvFile(page, filePath);
    await expect(page.locator('[id="notification-block"] p')).toHaveText('There are 1 records which were not persisted! Please contact tech support for help!');

    // Verify the records are persisted in the database
    const herosUploaded: WorkingClassHero[] = GlobalDataStore.get('heroesPartialCleanData');
    const natIds = await Promise.all(herosUploaded.map(async (hero) => hero.natid));
    console.log(natIds);

    await verifyDatabaseEntries(natIds, 2); // AC4: Verify 2 records were persisted

    // Cleanup
    cleanupFile(filePath);
});

test('Upload an invalid CSV file format (missing required fields)', async ({ page }) => {
    const invalidCsvData = `natid,name,gender,birthDate
natid-01,Alice,FEMALE,1990-01-01T12:00:00`;

    const csvFilePath = path.join(__dirname, 'invalid-format.csv');
    fs.writeFileSync(csvFilePath, invalidCsvData);

    // Login and upload file
    await loginAsClerk(page);
    await uploadCsvFile(page, csvFilePath);
    await expect(page.locator('[id="notification-block"] p')).toHaveText('Unable to process csv file! Please contact tech support for help!');

    // Cleanup
    cleanupFile(csvFilePath);
});
