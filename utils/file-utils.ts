import {WorkingClassHero, WorkingClassHeroBuilder} from "./data/working-class-heros-builder";
import * as fs from "node:fs";
import * as path from "node:path";
import GlobalDataStore from "./GlobalDataStore";

export class FileUtils{

    static createCleanCsvFileForHeroes(count: number): string {
        const heroes = new WorkingClassHeroBuilder().getHeros(count) as WorkingClassHero[];
        GlobalDataStore.set('heroesCleanData', heroes);
        // csv header:  <natid>, <name>, <gender>, <birthDate>, <deathDate>, <salary>, <taxPaid>,<browniePoints>
        return FileUtils.saveCsvFile(heroes);
    }

    static createPartialCleanCsvFileForHeroes(count: number): string {
        const heroes = new WorkingClassHeroBuilder().getHeros(count) as WorkingClassHero[];
        heroes[1].gender = 'M';
        GlobalDataStore.set('heroesPartialCleanData', heroes);
        return FileUtils.saveCsvFile(heroes);
    }

    private static saveCsvFile(heroes: WorkingClassHero[]): string {
        let csvData = '';
        heroes.forEach(hero => {
            // Check if any field is null and replace with empty string
            hero.deathDate = hero.deathDate ?? '';
            hero.browniePoints = hero.browniePoints ?? '';
            csvData += `${hero.natid},${hero.name},${hero.gender},${hero.birthDate},${hero.deathDate },${hero.salary},${hero.taxPaid},${hero.browniePoints}\n`;
        });

        // save the csv file to disk
        const csvFilePath = path.join(__dirname, 'heroes.csv');
        fs.writeFileSync(csvFilePath, csvData);
        return csvFilePath;
    }
}