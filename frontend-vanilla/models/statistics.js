export default class Statistics {
     /** @type {number}*/
     meanDeposit;

     /** @type {number} */
     medianDeposit;
 
     /** @type {number} */
     stdDeposit;

    /** @type {number}*/
    meanRent;

    /** @type {number} */
    medianRent;

    /** @type {number} */
    stdRent;

    static fromJson(json) {
        let statistics = new Statistics()

        // statistics.meanDeposit = json["mean-deposit"];
        // statistics.medianDeposit = json["median-deposit"];
        // statistics.stdDeposit = json["standard-deviation-deposit"];
        // statistics.meanRent = json["mean-rental-cost"];
        // statistics.medianRent = json["median-rental-cost"];
        // statistics.stdRent = json["standard-deviation-rental-cost"];
        statistics.meanDeposit = json.meanDeposit;
        statistics.medianDeposit = json.medianDeposit;
        statistics.stdDeposit = json.standardDeviationDeposit;
        statistics.meanRent = json.meanRent;
        statistics.medianRent = json.medianRent;
        statistics.stdRent = json.standardDeviationRent;
        return statistics
    }
}