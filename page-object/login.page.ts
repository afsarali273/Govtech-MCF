import {expect, Page} from "@playwright/test";
import {BOOK_KEEPER_DASHBOARD_URL, CLERK_DASHBOARD_URL} from "../utils/api-endpoints";


export class LoginPage{
    private page: Page;
    private readonly usernameInput = '[id="username-in"]';
    private readonly passwordInput = '[id="password-in"]';
    private readonly submitButton = 'input[type="submit"]';


    constructor(page: Page) {
        this.page = page;
    }

    async login(username: string, password: string) {
        await this.page.fill(this.usernameInput, username);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.submitButton);
    }

    async loginAs(userType: 'Clerk'|'BK'){
        await this.login(LoginCredentials[userType].userName, LoginCredentials[userType].password);
        await this.waitForURL(LoginCredentials[userType].navigationUrl);
    }

    async waitForURL(url: string) {
        await this.page.waitForURL(url);
    }

    async verifyDashboard(headingTitle: string, subTitle: string) {
        const heading = await this.page.locator('h1');
        const subHeading = await this.page.locator('span').first();
        await expect(heading).toHaveText(headingTitle);
        await expect(subHeading).toHaveText(subTitle);
    }

}


const LoginCredentials = {
    Clerk: {
        userName: 'clerk',
        password: 'clerk',
        navigationUrl: CLERK_DASHBOARD_URL
    },
    BK: {
        userName: 'bk',
        password: 'bk',
        navigationUrl: BOOK_KEEPER_DASHBOARD_URL
    }
}
