import {faker} from "@faker-js/faker/locale/en_US";
import { format } from 'date-fns';

export class WorkingClassHeroBuilder {
    private hero: WorkingClassHero;

    constructor() {
        this.hero = {} as WorkingClassHero;
    }


    setNatId(): WorkingClassHeroBuilder {
        const natid = faker.number.bigInt({ min: 0, max: 9999999 });
        this.hero.natid = `natid-${natid}`;    // Set natid with the required format
        return this;
    }

    // Set name
    setName(): WorkingClassHeroBuilder {
        this.hero.name = faker.person.fullName()
        return this;
    }

    setGender(): WorkingClassHeroBuilder {
        this.hero.gender = faker.helpers.shuffle(['MALE', 'FEMALE']).pop();
        return this;
    }

    setBirthDate(): WorkingClassHeroBuilder {
        //this.hero.birthDate = faker.date.past({years: 20}).toISOString();
        this.hero.birthDate = format(faker.date.past({ years: 20 }), 'yyyy-MM-dd\'T\'HH:mm:ss');
        return this;
    }

    setDeathDate(): WorkingClassHeroBuilder {
        this.hero.deathDate = faker.datatype.boolean() ? format(faker.date.past({years: 1}), 'yyyy-MM-dd\'T\'HH:mm:ss') : null;
        return this;
    }

    setSalary(): WorkingClassHeroBuilder {
        this.hero.salary = faker.number.int({ min: 0, max: 100000 });
        return this;
    }


    setTaxPaid(): WorkingClassHeroBuilder {
        this.hero.taxPaid = faker.number.int({ min: 0, max: 10000 });
        return this;
    }

    setBrowniePoints(): WorkingClassHeroBuilder {
        this.hero.browniePoints = faker.datatype.boolean() ? faker.number.int({ min: 0, max: 100 }) : null;
        return this;
    }

    setVouchers(vouchers?: Voucher[]): WorkingClassHeroBuilder {
        this.hero.vouchers = faker.datatype.boolean() ? vouchers : null;
        return this;
    }


    build(): WorkingClassHero {
        return this.hero;
    }

    public getHero(): WorkingClassHero {
        this.setNatId();
        this.setName();
        this.setGender();
        this.setBirthDate();
        //this.setDeathDate();
        this.setSalary();
        this.setTaxPaid();
        this.setBrowniePoints();
        return this.build();
    }

    public getHeros(count: number): WorkingClassHero[] {
        const heros = [];
        for (let i = 0; i < count; i++) {
            const hero =  new WorkingClassHeroBuilder();
            heros.push(hero.getHero());
        }

        return heros;
    }
}


export interface Voucher {
    voucherName: string;
    voucherType: string;
}

export interface WorkingClassHero {
    natid: string;
    name: string;
    gender: 'MALE' | 'FEMALE' | string;
    birthDate: string;  // format: yyyy-mm-dd'T'HH:mm:ss
    deathDate: string | null;  // nullable, format: yyyy-mm-dd'T'HH:mm:ss
    salary: number;
    taxPaid: number;
    browniePoints: number | null | string;  // nullable
    vouchers?: Voucher[] | null;  // nullable
}