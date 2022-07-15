import { Column } from "typeorm";

export class Location {
    @Column()
    longitude: number;
    
    @Column()
    latitude: number;
}