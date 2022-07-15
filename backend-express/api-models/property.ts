import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min } from "class-validator";
import { Property as DbProperty } from "models/property";
import { CitySummary } from "./city-summary";

class Cost {
    @Min(0)
    rent: number = 0;

    @Min(0)
    @IsOptional()
    additionalCost?: number = 0;

    @Min(0)
    @IsOptional()
    deposit?: number = 0;
    
    rentPerAreaSqm?: number;
}

class Location {
    longitude: number;
    
    latitude: number;
}

enum Gender {
    Male,
    Female,
    Mixed,
    Unknown
}
enum Furnish {
    Furnished,
    Unfurnished,
    Uncarpeted,
    Unknown
}

/**
 * Api property class
 */
export class Property {
    propertyID: string;
    @IsBoolean()
    @IsOptional()
    isRoomActive?: boolean;
    @Min(0)
    @IsOptional()
    areaSqm?: number;
    @IsEnum(Gender)
    @IsOptional()
    gender?: string;
    @IsEnum(Furnish)
    @IsOptional()
    furnished?: string;
    @IsUrl()
    @IsOptional()
    coverImageUrl?: string;
    cost: Cost = new Cost;
    location: Location = new Location;
    city: CitySummary = new CitySummary;

    /**
     * Converts a property js object from the database model to the api model 
     * @param DbProperty property object according to database model
     * @returns property js object according to database model
     */
    public static fromDatabase(property: DbProperty): Property {
        return {
            propertyID: property.propertyID,
            isRoomActive: property.isRoomActive,
            areaSqm: property.areaSqm,
            gender: property.gender,
            furnished: property.furnished,
            coverImageUrl: property.coverImageUrl,
            cost: {
                rent: property.cost.rent,
                additionalCost: property.cost.additionalCost,
                deposit: property.cost.deposit,
                rentPerAreaSqm: property.cost.rentPerAreaSqm
            },
            location: {
                longitude: property.location.longitude,
                latitude: property.location.latitude
            },
            city: {
                id: property.city.id,
                name: property.city.name
            }
        };
    }
}