import { Column } from "typeorm";

export class Cost {
    @Column()
    rent: number;

    @Column()
    additionalCost?: number;
    
    @Column()
    deposit?: number;

    @Column()
    rentPerAreaSqm?: number;
}