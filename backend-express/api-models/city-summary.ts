import { IsNotEmpty, Min } from "class-validator";
import { City as DbCity } from "models/city";

/**
 * Summary of city used to avoid circular links in property payloads
 */
export class CitySummary {
    @Min(0)
    id: number;
    @IsNotEmpty()
    name: string;

    /**
     * Converts a city js object from the database model to a city summary in the api model 
     * @param city city object according to database model
     * @returns city summary js object according to database model
     */
    public static fromDatabase(city : DbCity) : CitySummary {
        return {
            id: city.id,
            name: city.name
        };
    }
}