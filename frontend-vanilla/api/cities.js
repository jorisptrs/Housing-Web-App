import City from "../models/city.js"
import apiCall from "./call.js";


export default {
    // Retrieves the list of cities
    async getCities(contentType = "application/json") {

        const apiResponse = await apiCall("cities", "GET",contentType=contentType);
        if(!apiResponse.ok) throw new Error(await apiResponse.text());
        
        return (await apiResponse.json()).map(City.fromJson);
    }
}
