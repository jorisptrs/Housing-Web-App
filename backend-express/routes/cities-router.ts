import { CitiesController } from "controllers/cities-controller";
import { Application } from "express";
import { IRouter } from "./irouter";
import * as asyncHandler from "express-async-handler";

export class CitiesRouter implements IRouter {
    protected controller : CitiesController = new CitiesController;

    public attach(app: Application): void {
        app.route('/city/:id/properties')
            .get(asyncHandler(this.controller.getCityPropertiesAsync));
                // Retrieve a list of properties in a city
                // Depending on query parameters filtered by rent range xor truncated (top-N)
        
        app.route('/city/:id/statistics')
            .get(asyncHandler(this.controller.getCityStatisticsAsync));
                // Retrieve a property-statistics in a city

        app.route('/cities')
            .get(asyncHandler(this.controller.getCitiesAsync));
                // Retrieve all cities
    }
}