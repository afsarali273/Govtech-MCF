import { expect } from '@playwright/test';

export class ApiUtils {

    static async post(request: any, url: string, data: any, expectedStatus: number = 200, isResponseBody: boolean = true) {
        const response = await request.post(url, { data });
        expect(response.status()).toBe(expectedStatus);

        let responseBody: any;
        if(isResponseBody){
            responseBody = await response.json();
        }

        return { response, responseBody };
    }

    static async get(request: any, url: string, expectedStatus: number = 200) {
        const response = await request.get(url);
        expect(response.status()).toBe(expectedStatus);

        const responseBody = await response.json();
        return { response, responseBody };
    }
}
