const BASE_URL = 'http://localhost:9997';

export const apiEndpoints = {
    CREATE_HERO: `${BASE_URL}/api/v1/hero`,
    HERO_OWES_MONEY:`${BASE_URL}/api/v1/hero/owe-money`,
    CREATE_HERO_WITH_VOUCHER: `${BASE_URL}/api/v1/hero/vouchers`,
    GET_VOUCHER_COUNT: `${BASE_URL}/api/v1/voucher/by-person-and-type`
}

export const LOGIN_URL = `${BASE_URL}/login`;
export const CLERK_DASHBOARD_URL = `${BASE_URL}/clerk/dashboard`;
export const BOOK_KEEPER_DASHBOARD_URL = `${BASE_URL}/bookkeeper/dashboard`;


