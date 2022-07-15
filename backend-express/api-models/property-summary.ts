import { IsNotEmpty, Min } from "class-validator";
import { Property as DbProperty } from "models/property";

/**
 * Summary of property used to avoid circular links in property payloads and in
 * cases where not all information is required
 */
export class PropertySummary {
    @IsNotEmpty()
    propertyID: string;
    @Min(0)
    rent: number;
    @IsNotEmpty()
    cityName: string;

    /**
     * Converts a property js object from the database model to a property
     * summary in the api model 
     * @param DbProperty property object according to database model
     * @returns property summary js object according to database model
     */
    public static fromDatabase(property : DbProperty) : PropertySummary {
        return {
            propertyID: property.propertyID,
            rent: property.cost.rent,
            cityName: property.city.name
        };
    }
}