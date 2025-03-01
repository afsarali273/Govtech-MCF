import { expect } from "@playwright/test";
import * as fs from "node:fs";
import DatabaseUtil from "../utils/DatabaseUtil";
import {LOGIN_URL} from "../utils/api-endpoints";
import {test} from "../page-object/base-page";

// Constants
const taxReliefFilePathPrefix = './downloads/tax_relief_';

test.beforeEach('Navigation to Login Page', async ({page}) => {
    await page.goto(LOGIN_URL);
})

test('Generate tax relief file with records', async ({ loginPage, dashboardPage}) => {
    await loginPage.loginAs('BK');

    // Delete Egress file from DB if any
    await deleteEgressFile();

    await dashboardPage.verifyDashboard('Book Keeper Dashboard', 'Welcome Home Moh Peh!');

    // Generate tax relief file
    const download = await dashboardPage.downloadTaxReliefFile();

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
    const lastLine = lines[lines.length - 1]; // Get second last line (last line should be empty)
    expect(lines.length).toBeGreaterThan(10);
    expect(Number(lastLine)).toBe(lines.length-1);
    // Verify the format of first line
    const firstLine = lines[0];
    const firstLineParts = firstLine.split(',');
    expect(firstLineParts).toHaveLength(2);
}