import { PropertiesController } from "controllers/properties-controller";
import { Application } from "express";
import { IRouter } from "./irouter";
import * as asyncHandler from "express-async-handler";

export class PropertiesRouter implements IRouter {
    protected controller : PropertiesController = new PropertiesController;

    public attach(app: Application): void {
        app.route('/properties')
            .post(asyncHandler(this.controller.createPropertyAsync)) // Create a new property object
            // Selection - e.g. via coordinates - happens in the controller using the query parameters.
            .get(asyncHandler(this.controller.getPropertiesAsync)) // Retrieve all selected properties
            .put(asyncHandler(this.controller.updatePropertiesAsync)) // Update all selected properties
            .delete(asyncHandler(this.controller.deletePropertiesAsync)); // Delete all selected properties
        
        app.route('/properties/:propertyID')
            .get(asyncHandler(this.controller.getPropertyAsync)) // Retrieve a selected property
            .put(asyncHandler(this.controller.updatePropertyAsync)) // Update a property
            .delete(asyncHandler(this.controller.deletePropertyAsync)); // Delete a property

        app.route('/properties/:propertyID/coverImageUrl')
            .get(asyncHandler(this.controller.getPropertyCoverImageUrlAsync)) // Retrieve the cover image url of a selected property
            .delete(asyncHandler(this.controller.deletePropertyCoverImageUrlAsync)); // Delete the cover image url of a selected property
    }
}