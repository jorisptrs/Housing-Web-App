import { Application } from "express";
import { PropertiesRouter } from "./properties-router";
import { IRouter } from "./irouter";
import { CitiesRouter as CitiesRouter } from "./cities-router";

export class MainRouter implements IRouter {
    /**
     * This "main router" combines all controller-specific routers
     * and registers all their routes.
     * @param app express app
     */
    public attach(app: Application): void {
        (new PropertiesRouter()).attach(app);
        (new CitiesRouter()).attach(app);
    }
}
