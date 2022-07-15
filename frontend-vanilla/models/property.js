import City from "./city.js";

export class Cost {
    /** @type {number}*/    additionalCost;
    /** @type {number}*/    deposit;
    /** @type {number}*/    rent;
    /** @type {number}*/    rentPerAreaSqm;

    /**
     * Convert from JSON to Review instance
     * @param {object} json JSON from API
     * @returns {Cost}
     */
     static fromJson(json) {
        return Object.assign(new Cost(), json);
    }
}

export class Location {
    /** @type {number} */   longitude;
    /** @type {number} */   latitude;
    /**
     * Convert from JSON to Review instance
     * @param {object} json JSON from API
     * @returns {Location}
     */
     static fromJson(json) {
        return Object.assign(new Location(), json);
    }
}

export default class Property {
    /** @type {number} */   propertyID;
    /** @type {boolean}*/   isRoomActive;
    /** @type {number} */   areaSqm;
    /** @type {string} */   gender;
    /** @type {string} */   furnished;
    /** @type {string} */   coverImageUrl;
    /** @type {Cost} */     cost;
    /** @type {Location} */ location;
    /** @type {City} */ city;
    

    static fromJson(json) {
        let prop = new Property();
        prop.propertyID = json.propertyID;
        prop.isRoomActive = json.isRoomActive;
        prop.areaSqm = json.areaSqm;
        prop.gender = json.gender;
        prop.furnished = json.furnished;
        prop.coverImageUrl = json.coverImageUrl;
        prop.cost = Cost.fromJson(json.cost);
        prop.location = Location.fromJson(json.location);
        prop.city = City.fromJson(json.city);
        return prop;
    }
}