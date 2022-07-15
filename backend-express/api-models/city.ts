import { IsNotEmpty, Min } from "class-validator";
import { City as DbCity } from "models/city";
import { PropertySummary } from "./property-summary";

/**
 * Api city class
 */
export class City {
    id: number;
    @IsNotEmpty()
    name: string;
    properties: PropertySummary[] = [];

    /**
     * Converts a city js object from the database model to the api model 
     * @param city city object according to database model
     * @returns city js object according to database model
     */
    public static fromDatabase(city : DbCity) : City {
        return {
            id: city.id,
            name: city.name,
            properties: city.properties?.map(PropertySummary.fromDatabase) ?? []
        };
    }
}