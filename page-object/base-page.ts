import {LoginPage} from "./login.page";
import {DashboardPage} from "./dashboard.page";
import { test as baseTest } from '@playwright/test';

export const test = baseTest.extend<{ loginPage: LoginPage, dashboardPage: DashboardPage }>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    }
});