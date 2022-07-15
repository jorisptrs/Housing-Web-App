import { Request, Response } from "express";
import { getConnection, SelectQueryBuilder, Raw } from "typeorm";
import { IQueryHelper, Paging, sendCustom } from "./helpers";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { validate } from "class-validator";
import { std, mean, median } from "mathjs";

import { Property as DbProperty } from "models/property";
import { City as DbCity } from "models/city";
import { PropertySummary } from "api-models/property-summary";
import { CitySummary } from "api-models/city-summary";

export class CitiesController {
    
    /**
     * Retrieve a list of properties in a city. Depending on query parameters filtered by rent range xor truncated (top-N)
     * @param req the incoming request with the id of the city
     * @param res the outgoing response, modified by this method
     */
    public async getCityPropertiesAsync (req: Request<{ id: number}>, res: Response): Promise<void> {
        const filter = plainToClass(Filter, req.query, { enableImplicitConversion: true });
        const order = plainToClass(Order, req.query, { enableImplicitConversion: true });
        const paging = plainToClassFromExist(new Paging<DbProperty>(), req.query, { enableImplicitConversion: true });

        // We validate that the paging query is valid according to the rules set
        let validationResult = await validate(paging, { validationError: { target: false }});
        if (validationResult.length > 0) {
            res.status(400);
            sendCustom(res, req.header('accept'), { error: "Invalid paging settings", details: validationResult });
            return;
        }

        // We create a properties query and apply the sorting/filtering/paging
        let query = getConnection().getRepository(DbProperty).createQueryBuilder("property");
        query = filter.apply(query);
        query = order.apply(query);
        query = paging.apply(query);

        // We asynchronously retrieve the results from the database, convert those
        // to API models and send them to the client.
        let properties = await query
            .leftJoinAndSelect("property.city", "city")
            .andWhere("property.city.id = :id", { id: req.params.id })
            .getMany();
        if (properties.length == 0) {
            res.status(204);
            sendCustom(res, req.header('accept'), { error: "No properties found", details: properties });
            return;
        }
        sendCustom(res, req.header('accept'), properties.map(PropertySummary.fromDatabase));
    }
    

    /**
     * Retrieve the property-statistics of a city.
     * @param req the incoming request with the id of the city
     * @param res the outgoing response, modified by this method
     */
    public async getCityStatisticsAsync (req: Request<{ id: number}>, res: Response): Promise<void> {
        const propertyRepository = getConnection().getRepository(DbProperty);

        // Filter properties from that city
        const properties = await propertyRepository
            .createQueryBuilder("property")
            .where("property.city.id = :id", { id: req.params.id })
            .getMany();

        // If none was found
        if (properties.length == 0) {
            res.status(204);
            sendCustom(res, req.header('accept'), { error: "No properties found", details: properties });
            return;
        }
        
        // Compute stats from the queried properties and send them to the client
        let rents = [];
        let deposits = [];
        properties.forEach(property => {
            rents.push(property.cost.rent);
            deposits.push(property.cost.deposit);
        });

        let statistics = {
            meanRent: mean(rents),
            medianRent: median(rents),
            standardDeviationRent: std(rents),
            meanDeposit: mean(deposits),
            medianDeposit: median(deposits),
            standardDeviationDeposit: std(deposits)
        }

        sendCustom(res, req.header('accept'), statistics);
    }

    /**
     * Retrieve the whole list of cities.
     * @param req the incoming request
     * @param res the outgoing response, modified by this method
     */
    public async getCitiesAsync (req: Request, res: Response): Promise<void> {
        let query = getConnection().getRepository(DbCity).createQueryBuilder("city");
        // We asynchronously retrieve the results from the database, convert those
        // to API models and send them to the client.
        let cities = await query.getMany();
        if (cities.length == 0) {
            res.status(204);
            sendCustom(res, req.header('accept'), { error: "No cities found", details: cities });
            return;
        }        
        sendCustom(res, req.header('accept'), cities.map(CitySummary.fromDatabase));
    }
}

/**
 * Compose an ordering filter by several parameters
 */
class Order implements IQueryHelper<DbProperty> {
    "order-by": string;
    "order-dir": string;

    /**
     * Applies the filters to a typeorm query
     * @param query
     * @returns query modified input query
     */
    public apply(query : SelectQueryBuilder<DbProperty>) : SelectQueryBuilder<DbProperty> {
        if (!this["order-by"] || !this["order-dir"]) return query;
        if (this["order-by"] == "rent") {
            var orderVar = "property.cost.rent";
        } else {
            var orderVar = "property.cost.rentPerAreaSqm";
        }
        return query.orderBy(orderVar, this["order-dir"] === "descending" ? "DESC" : "ASC");
    }
}

/**
 * Compose a field filter by several parameters
 */
class Filter implements IQueryHelper<DbProperty> {
    isRoomActive?: boolean;
    furnished?: string;
    gender?: string;
    rentMin?: number;
    rentMax?: number;

    /**
     * Applies the filters to a typeorm query
     * @param query
     * @returns modified input query
     */
    public apply(query : SelectQueryBuilder<DbProperty>) : SelectQueryBuilder<DbProperty> {
        if (!(this["is-room-active"] === undefined)) query = query.andWhere("property.isRoomActive = :isRoomActive", { isRoomActive: (this["is-room-active"] == "true") });
        if (this.furnished) query = query.andWhere("property.furnished = :furnished", { furnished: this.furnished  });
        if (this.gender) query = query.andWhere("property.gender = :gender", { gender: this.gender });
        if (this["rent-min"]) query = query.andWhere("property.cost.rent > :rentMin", { rentMin: this["rent-min"] });
        if (this["rent-max"]) query = query.andWhere("property.cost.rent < :rentMax", { rentMax: this["rent-max"] });
        return query;
    }
}