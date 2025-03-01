import {expect, Page} from "@playwright/test";

export class DashboardPage{
    private page: Page;
    private readonly heading = 'h1';
    private readonly subTitle = 'span';

    // Upload section
    private readonly uploadButton = '[id="dropdownMenuButton2"]';
    private readonly uploadCsvFileOption = 'text=Upload a csv file';

    // Message
    private readonly successMessage = "[id=\"notification-block\"]";
    private readonly failureMessage = "[id=\"notification-block\"] p";

    private readonly taxReliefButton = "[id=\"tax_relief_btn\"]";


    constructor(page: Page) {
        this.page = page;
    }

    async verifyDashboard(headingTitle: string, subTitle: string) {
        const heading = this.page.locator(this.heading);
        const subHeading = this.page.locator(this.subTitle).first();
        await expect(heading).toHaveText(headingTitle);
        await expect(subHeading).toHaveText(subTitle);
    }

    async uploadCsvFile(filePath: string) {
        await this.page.click(this.uploadButton);
        await this.page.click(this.uploadCsvFileOption);
        await this.page.getByRole('textbox', { name: 'Upload CSV file' }).setInputFiles(filePath);
        await this.page.getByRole('button', { name: 'Create' }).click();
    }

    async downloadTaxReliefFile(){
        const downloadPromise = this.page.waitForEvent('download');
        await this.page.locator(this.taxReliefButton).click();
        return await downloadPromise;
    }

    async getSuccessMessageEl(){
        return this.page.locator(this.successMessage);
    }

    async getFailureMessageEl(){
        return this.page.locator(this.failureMessage);
    }
}