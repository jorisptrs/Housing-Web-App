import Property from "../models/property.js";
import PropertySummary from "../models/property-summary.js";
import Statistics from "../models/statistics.js";
import apiCall from "./call.js";


export default {
    /**
     * Finds a list of properties with the selected parameters
     * 
     * @param {number} cityID 
     * @param {number} limit
     * @param {string} orderBy 
     * @param {string} orderDir 
     * @param {boolean} isRoomActive 
     * @param {string} isFurnished 
     * @param {string} gender 
     * @param {number} rentMin 
     * @param {number} rentMax 
     * @returns {Promise<PropertySummary[]>}
     */

    // Finds properties in a selected city and the selected filters
    async getPropertiesInCity(contentType = "application/json", cityID=null, 
                            limit=null, orderBy=null, 
                            orderDir=null, isRoomActive=null,
                            isFurnished=null, gender=null,
                            rentMin=null, rentMax=null,
                            ) 
    {   
        var data = { 
                limit: limit,
                "order-by": orderBy,
                "order-dir": orderDir,
                "is-room-active": isRoomActive,
                "is-furnished": isFurnished,
                "gender": gender,
                "rent-min": rentMin,
                "rent-max": rentMax,
        }
        const apiResponse = await apiCall(`city/${cityID}/properties`, "GET", contentType=contentType, data) 
        if(!apiResponse.ok) {   
            throw new Error(await apiResponse.text());
        }
        console.log("api response", apiResponse);
        return (await apiResponse.json()).map(PropertySummary.fromJson)
    },
    // Retrieves a property based on its id
    async getPropertyById(propertyId, request = "GET", data=null, contentType = "application/json") {
        const apiResponse = await apiCall(`properties/${propertyId}`, request, contentType=contentType, data);
        if(!apiResponse.ok) {
            throw new Error(await apiResponse.text())
        };
        if(request == "GET"){
            return Property.fromJson(await apiResponse.json());
        } else {
            return apiResponse.ok;
        }
    },

    // Retreives properties with selcted latitude and longitude
    async getPropertyByLocation(latitude, longitude, request="GET", contentType = "application/json") {
        var data = {
            "latitude" : latitude,
            "longitude" : longitude
        };
        const apiResponse = await apiCall(`properties`, request, contentType=contentType, data); 
        if(!apiResponse.ok) throw new Error(await apiResponse.text());
        if(request == "GET"){
            console.log("response", apiResponse);
            return (await apiResponse.json()).map(PropertySummary.fromJson)
        } else {
            return apiResponse.ok;
        }
    },

    async putPropertyByLocation(longitude, latitude, data, contentType = "application/json") {
        let params = {
            "longitude": longitude,
            "latitude" : latitude
        }
        const apiResponse = await apiCall(`properties`, "PUT", contentType=contentType, data, params); 
        if(!apiResponse.ok) throw new Error(await apiResponse.text());
        return apiResponse.ok;
        
    },
     
    async postNewProperty(data, contentType="application/json") {
        const apiResponse = await apiCall(`properties`, "POST", contentType=contentType, data); 
        if(!apiResponse.ok) throw new Error(await apiResponse.text());
        return apiResponse.ok;
    },

    async getStatisticsOfCity(contentType = "application/json", cityID, 
                            limit,isRoomActive,
                            isFurnished, gender,
                            rentMin, rentMax,
                            ) 
    //Retrieves the statistics of the properies in the same city 
    // and taking into account the selected filters
    {   var data = { 
                limit: limit,
                "is-room-active": isRoomActive,
                "is-furnished": isFurnished,
                "gender": gender,
                "rent-min": rentMin,
                "rent-max": rentMax,
        }
        const apiResponse = await apiCall(`city/${cityID}/statistics`, "GET", contentType=contentType, data) 
        if(!apiResponse.ok) throw new Error(await apiResponse.text());
        return Statistics.fromJson(await apiResponse.json())
    }
}