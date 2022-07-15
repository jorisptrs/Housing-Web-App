import { Request, Response } from "express";
import { plainToClass, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { IQueryHelper, sendCustom, typeContent } from "./helpers";
import { getConnection, SelectQueryBuilder } from "typeorm";

import { Property as DbProperty, Property } from "models/property";
import { City as DbCity } from "models/city";
import { Property as ApiProperty } from "api-models/property";
import { PropertySummary as ApiPropertySummary } from "api-models/property-summary";

export class PropertiesController {
    
    /**
     * Create a new property object
     * @param req the incoming request defining the property
     * @param res the outgoing response
     */
    public async createPropertyAsync (req: Request, res: Response): Promise<void> {
        // get body as json even if csv
        const content = await typeContent(req);
        // We convert the request body to a property object
        const apiProperty = plainToInstance(ApiProperty, content);

        // Check if the body is valid
        if (!(await isValid(apiProperty, req, res))) return;

        let rentArea = 0
        //make sure we don't devide by 0
        if ((apiProperty.areaSqm ?? 0) > 0) rentArea = apiProperty.cost.rent / apiProperty.areaSqm;

        // We convert the API model into a real application model
        let property : DbProperty = {
            propertyID: apiProperty.propertyID,
            isRoomActive: apiProperty.isRoomActive ?? true,
            areaSqm: apiProperty.areaSqm ?? 0,
            gender: apiProperty.gender ?? null,
            furnished: apiProperty.furnished ?? null,
            coverImageUrl: apiProperty.coverImageUrl ?? null,

            cost: {
                rent: apiProperty.cost.rent,
                additionalCost: apiProperty.cost.additionalCost ?? 0,
                deposit: apiProperty.cost.deposit ?? 0,
                rentPerAreaSqm: rentArea ?? 0
            },
            location: {
                longitude: apiProperty.location.longitude,
                latitude: apiProperty.location.latitude
            },
            city: null
        };

        // We check that the property does not yet exist
        const propertyRepository = getConnection().getRepository(DbProperty);

        const existingCount = await propertyRepository
            .createQueryBuilder("property")
            .where("property.propertyID = :id", { id: property.propertyID })
            .getCount();

        if (existingCount > 0) {
            res.status(409); // Conflict
            sendCustom(res, req.header('accept'), { error: "Property already exists" });
            return;
        }

        // Retrieve existing city
        property.city = await getConnection().getRepository(DbCity)
            .createQueryBuilder("city")
            .where("city.id = :id", { id: apiProperty.city.id })
            .getOne();
        
        // Store the new property
        let dbEntry = propertyRepository.create(property);
        await propertyRepository.save(dbEntry);

        res.status(201)
        sendCustom(res, req.header('accept'), dbEntry.propertyID);
    }
    
    /**
     * Retrieve property objects that match coordinates
     * @param req the incoming request with the coordinates
     * @param res the outgoing response with a list of matching properties
     */
    public async getPropertiesAsync (req: Request, res: Response): Promise<void> {
        // Validate that values were provided        
        if (!(req.query.latitude && req.query.longitude)) {
            res.status(400);
            sendCustom(res, req.header('accept'), { error: "Missing required fields" });
            return;            
        }
        // We convert the request query parameters to a filter class
        const filter = plainToClass(Filter, req.query, { enableImplicitConversion: true });

        // We create a properties query and apply the sorting/filtering/paging
        let query = getConnection().getRepository(DbProperty).createQueryBuilder("property")
            .leftJoinAndSelect("property.city", "city");
        query = filter.apply(query);

        // We asynchronously retrieve the results from the database, convert those
        // to API models and send them to the client.
        let properties = await query.getMany();
        if (properties.length == 0) {
            res.status(204);
            sendCustom(res, req.header('accept'), { error: "No properties found", details: properties });
            return;
        }
        sendCustom(res, req.header('accept'), properties.map(ApiPropertySummary.fromDatabase));
    }

    /**
     * Update all selected properties
     * @param req the incoming request defining the location
     * @param res the outgoing response with updated properties
     */
    public async updatePropertiesAsync (req: Request, res: Response): Promise<void> {
        // Validate that values were provided
        if (!(req.query.latitude && req.query.longitude && req.body)) {
            res.status(400);
            sendCustom(res, req.header('accept'), { error: "Missing required fields" });
            return;            
        }
        // get body as json even if csv
        const content = await typeContent(req);
        // We convert the request body to a property object
        const apiProperty = plainToClass(ApiProperty, content, { enableImplicitConversion: true });
        
        const propertyRepository = getConnection().getRepository(DbProperty);

        // We convert the request query parameters to a filter class
        const filter = plainToClass(Filter, req.query, { enableImplicitConversion: true });

        //Check if the body is valid
        if (!(await isValid(apiProperty, req, res))) return;
        
        // We create a properties query and apply the sorting/filtering/paging
        let query = await propertyRepository.createQueryBuilder("property");
        query = filter.apply(query);

        // We asynchronously retrieve the results from the database, change the values as needed
        // and update the db
        let properties = await query.getMany();

        for (var property of properties)
        {
            property.isRoomActive = apiProperty.isRoomActive ?? true;
            property.areaSqm = apiProperty.areaSqm ?? 0;
            property.gender = apiProperty.gender ?? null;
            property.furnished = apiProperty.furnished ?? null;
            property.coverImageUrl = apiProperty.coverImageUrl ?? null;
            property.cost.rent = apiProperty.cost.rent;
            property.cost.additionalCost = apiProperty.cost.additionalCost ?? 0;
            property.cost.deposit = apiProperty.cost.deposit ?? 0;
            let rentArea = 0
            // make sure we don't devide by 0
            if ((apiProperty.areaSqm ?? 0) > 0) rentArea = apiProperty.cost.rent / apiProperty.areaSqm;
            property.cost.rentPerAreaSqm = rentArea
            property.location.longitude = apiProperty.location.longitude;
            property.location.latitude = apiProperty.location.latitude;
            // Retrieve existing city
            property.city = await getConnection().getRepository(DbCity)
                .findOne(apiProperty.city.id,{
                    relations: ["properties"]
                })
            await propertyRepository.save(property);
        }
        
        sendCustom(res, req.header('accept'), properties.map(ApiProperty.fromDatabase));
    }
    
    /**
     * Delete all properties that match location
     * @param req the incoming request with location
     * @param res the outgoing response, empy at success
     */
    public async deletePropertiesAsync (req: Request, res: Response): Promise<void> {
        // Validate that values were provided        
        if (!(req.query.latitude && req.query.longitude)) {
            res.status(400);
            sendCustom(res, req.header('accept'), { error: "Missing required fields" });
            return;            
        }
        
        // We convert the request query parameters to a filter class
        const filter = plainToClass(Filter, req.query, { enableImplicitConversion: true });

        const propertyRepository = getConnection().getRepository(DbProperty);


        // We create a properties query and apply the sorting/filtering/paging
        let query = await propertyRepository.createQueryBuilder("property");
        query = filter.apply(query);

        // We asynchronously retrieve the results from the database, and delete them.
        let properties = await query.getMany();

        for (const property of properties)
            await propertyRepository.delete(property.propertyID);

        res.status(204);
        res.json();
    }
    
    /**
     * Get property object that matches id
     * @param req the incoming request with id
     * @param res the outgoing response with matching property
     */
    public async getPropertyAsync (req: Request<{ propertyID: string }>, res: Response): Promise<void> {
        let property = await getConnection().getRepository(DbProperty).findOne(req.params.propertyID,{
            relations: ["city"]
        });

        if (!property) {
            res.status(404);
            res.json();
            return;
        }

        sendCustom(res, req.header('accept'), ApiProperty.fromDatabase(property));
    }
    
    /**
     * Update a property
     * @param req the incoming request with the id of the to be updated property
     * @param res the outgoing response with updated property
     */
    public async updatePropertyAsync (req: Request<{ propertyID: string }, {}, ApiProperty>, res: Response): Promise<void> {
        // get body as json even if csv
        const content = await typeContent(req);
        
        // We convert the request body to a property object
        const apiProperty = plainToClass(ApiProperty, content, { enableImplicitConversion: true });

        // Check if the body is valid
        if (!(await isValid(apiProperty, req, res))) return;

        const propertyRepository = getConnection().getRepository(DbProperty);

        let property = await propertyRepository.findOne(req.params.propertyID);
        if (!property) {
            res.status(404);
            res.json();
            return;
        }
        property.isRoomActive = apiProperty.isRoomActive ?? true;
        property.areaSqm = apiProperty.areaSqm ?? 0;
        property.gender = apiProperty.gender ?? null;
        property.furnished = apiProperty.furnished ?? null;
        property.coverImageUrl = apiProperty.coverImageUrl ?? null;
        property.cost.rent = apiProperty.cost.rent;
        property.cost.additionalCost = apiProperty.cost.additionalCost ?? 0;
        property.cost.deposit = apiProperty.cost.deposit ?? 0;
        let rentArea = 0
        //make sure we don't devide by 0
        if ((apiProperty.areaSqm ?? 0) > 0) rentArea = apiProperty.cost.rent / apiProperty.areaSqm;
        property.cost.rentPerAreaSqm = rentArea;
        property.location.longitude = apiProperty.location.longitude;
        property.location.latitude = apiProperty.location.latitude;
        
        // Retrieve existing city
        property.city = await getConnection().getRepository(DbCity)
                .findOne(apiProperty.city.id,{
                    relations: ["properties"]
                })

        await propertyRepository.save(property);
        sendCustom(res, req.header('accept'), ApiProperty.fromDatabase(property));
    }
    
    /**
     * Delete a property that matches id
     * @param req the incoming request with id
     * @param res the outgoing response, empy at success
     */
    public async deletePropertyAsync (req: Request<{ propertyID: string }>, res: Response): Promise<void> {
        const propertyRepository = getConnection().getRepository(DbProperty);

        let property = await propertyRepository.findOne(req.params.propertyID);
        if (!property) {
            res.status(404);
        } else {
            await propertyRepository.delete(req.params.propertyID);
            res.status(204)
        }
        res.json();
    }

    /**
     * Retrieve the cover image url of a selected property
     * @param req the incoming request with the id of the property
     * @param res the outgoing response with the url
     */
    public async getPropertyCoverImageUrlAsync (req: Request<{ propertyID: string }>, res: Response): Promise<void> {
        let property = await getConnection().getRepository(DbProperty).findOne(req.params.propertyID, { select: ["coverImageUrl"] });
        if (!property) {
            res.status(204);
            res.json();
            return;
        }

        sendCustom(res, req.header('accept'), property.coverImageUrl ?? null);
    }
    
    /**
     * Delete a property cover image that matches id
     * @param req the incoming request with id
     * @param res the outgoing response, empy at success
     */
    public async deletePropertyCoverImageUrlAsync (req: Request<{ propertyID: string }>, res: Response): Promise<void> {
        const propertyRepository = getConnection().getRepository(DbProperty);

        let property = await propertyRepository.findOne(req.params.propertyID);
        if (!property) {
            res.status(404);
            
            return;
        }

        property.coverImageUrl = null;

        await propertyRepository.save(property);
        res.status(204);
        res.json();
    }

}

/**
 * Validates if the input property a request follows the logical structure of the database
 * @param property created property
 * @param req the incoming request
 * @param res the outgoing response, with error code incase of non valid input
 */
async function isValid (property: ApiProperty, req: Request, res: Response): Promise<boolean> {
    // Use the inbuild Typeorm validation
    const validationResult = await validate(property, { validationError: { target: false }});

    if (validationResult.length > 0) {
        res.status(400);
        sendCustom(res, req.header('accept'), { error: "Property validation error", details: validationResult });
        return false;
    }
    return true;
}

/**
* Compose a field filter by longitude and latitude
*/
class Filter implements IQueryHelper<DbProperty> {
    longitude: number;
    latitude: number;

    /**
     * Applies the filters to a typeorm query
     * @param query
     * @returns modified input query
     */
    public apply(query : SelectQueryBuilder<DbProperty>) : SelectQueryBuilder<DbProperty> {
        if (this.longitude) query = query.andWhere("property.longitude = :longitude", { longitude: this.longitude });
        if (this.latitude) query = query.andWhere("property.latitude = :latitude", { latitude: this.latitude });
        return query;
    }
}