import {expect} from "@playwright/test";
import DatabaseUtil from "./DatabaseUtil";

export class CommonUtils{

    // Utility Function to Verify Vouchers in Database
    public static  async verifyVouchersInDatabase(natid: string, expectedVoucherCount: number) {
        const query = `
        SELECT v.name, wch.natid
        FROM working_class_heroes AS wch
        INNER JOIN vouchers AS v ON wch.id = v.working_class_hero_id
        WHERE wch.natid = '${natid}';
    `;
        const queryRes = await DatabaseUtil.getInstance().get(query);
        expect(queryRes).toHaveLength(expectedVoucherCount);
    }

    public static async  verifyDatabaseEntriesForHero(natIds: string[], expectedLength: number) {
        const query = `SELECT * FROM working_class_heroes WHERE natid IN ('${natIds.join("','")}')`;
        const queryRes = await DatabaseUtil.getInstance().get(query);
        console.log(queryRes);
        expect(queryRes, {message: 'Persisted Data in DB does not match'}).toHaveLength(expectedLength);
    }
}