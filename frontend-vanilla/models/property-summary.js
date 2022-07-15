export default class PropertySummary {
    /** @type {string}*/
    propertyID;

    /** @type {number} */
    rent;

    /** @type {string} */
    "city-name";

    static fromJson(json) {
        return Object.assign(new PropertySummary(), json);
    }
}