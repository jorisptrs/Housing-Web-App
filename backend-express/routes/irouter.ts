import { Application } from "express";

export interface IRouter {
    /**
     * A utility interface defining some generic router class
     * that supports registering some routes at an ExpressJS "Application"
     * @param app express app
     */
    attach(app: Application): void;
}