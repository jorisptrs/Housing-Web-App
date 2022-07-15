import { Entity, Column, PrimaryColumn, ManyToOne} from "typeorm";
import { Location } from "./location"
import { Cost } from "./cost"
import { City } from "./city"

@Entity({ name: "Properties" })
export class Property {
    @PrimaryColumn()
    propertyID: string;
    
    @Column()
    isRoomActive: boolean;
    
    @Column()
    areaSqm?: number;
    
    @Column()
    gender?: string;
    
    @Column()
    furnished?: string;
    
    @Column()
    coverImageUrl?: string;

    @Column(() => Cost, {
        prefix: "Cost_"
    })
    cost: Cost;

    @Column(() => Location, {
        prefix: "Location_"
    })
    location: Location;

    @ManyToOne(() => City, cityID => cityID.properties, {cascade: true})
    city: City;
}