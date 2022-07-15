
export default class City {
    /** @type {number}*/
    id;

    /** @type {number} */
    name;

    static fromJson(json) {
        return Object.assign(new City(), json);
    }
}