import { expect, Page, test } from "@playwright/test";
import * as fs from "node:fs";
import DatabaseUtil from "../utils/DatabaseUtil";
import {BOOK_KEEPER_DASHBOARD_URL, LOGIN_URL} from "../utils/api-endpoints";

// Constants
const taxReliefFilePathPrefix = './downloads/tax_relief_';

// Utility Functions

// Login as Book Keeper
async function loginAsBookKeeper(page: Page) {
    await page.goto(LOGIN_URL);
    await page.fill('[id="username-in"]', 'bk');
    await page.fill('[id="password-in"]', 'bk');
    await page.click('input[type="submit"]');
    await page.waitForURL(BOOK_KEEPER_DASHBOARD_URL);

    await verifyDashboard(page);
}

// Verify the Bookkeeper Dashboard
async function verifyDashboard(page: Page) {
    const headingTitle = await page.locator('h1');
    const subTitle = await page.locator('span').first();
    await expect(headingTitle).toHaveText('Book Keeper Dashboard');
    await expect(subTitle).toHaveText('Welcome Home Moh Peh!');
}

// Delete existing Egress file from the database
async function deleteEgressFile() {
    const query = `DELETE FROM file WHERE file_type = "TAX_RELIEF"`;
    await DatabaseUtil.getInstance().delete(query);
}

// Verify that records are persisted in the database
async function verifyDatabaseEntries(expectedLength: number) {
    const query = `SELECT * FROM file WHERE file_type = "TAX_RELIEF"`;
    const queryRes = await DatabaseUtil.getInstance().get(query);
    expect(queryRes).toHaveLength(expectedLength);
}

// Save the downloaded file
async function saveDownloadedFile(download: any) {
    const newFilePath = `${taxReliefFilePathPrefix}${new Date().getTime()}.csv`;
    await download.saveAs(newFilePath);
    return newFilePath;
}

// Read and verify the content of the CSV file
function verifyFileContent(filePath: string) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
    const lastLine = lines[lines.length - 2]; // Get second last line (last line should be empty)
    expect(lines.length).toBeGreaterThan(10);
    expect(lastLine).toContain('10');
    // Verify the format of first line
    const firstLine = lines[0];
    const firstLineParts = firstLine.split(',');
    expect(firstLineParts).toHaveLength(2);
}

// Test for successfully generating tax relief egress file with records
test('Generate tax relief file with records', async ({ page }) => {
    await loginAsBookKeeper(page);

    // Delete Egress file if it exists
    await deleteEgressFile();

    // Generate tax relief file
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[id="tax_relief_btn"]').click();
    const download = await downloadPromise;

    // Save the downloaded file and verify it exists
    const downloadedFilePath = await saveDownloadedFile(download);

    // AC1: File is egressed successfully
    expect(fs.existsSync(downloadedFilePath)).toBeTruthy();

    // Verify the file content
    // AC2: File contain a body where each line is in the format: <natid>,<tax relief amount>
    verifyFileContent(downloadedFilePath);

    // Verify database entries
    //AC4: Each time a file process is being triggered, a file of FILE TYPE: TAX RELIEF record is being persisted into a database table FILE
    await verifyDatabaseEntries(1);
});
