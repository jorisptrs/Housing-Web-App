import propertySummaries from "../api/properties.js";
import properties from "../api/properties.js";
import ModelPropertySummary from "../models/property-summary.js";
import ModelStatistics from "../models/statistics.js";
import Statistics from "./statistics.js";
import PropertySummary from "./property-summary.js";
import propertyFilterStorage from "../storage/property-filter-storage.js";

export class PropertySelectedEvent extends Event {
    /** @type {string} */ propertyId;

    constructor(propertyId) {
        super("property-selected");
        this.propertyId = propertyId;
    }
}

export default class PropertiesFilter extends HTMLElement {
    /** @type {number} */ cityId;
    /** @type {string} */ cityName;

    /** @type {HTMLInputElement} */ #limit;
    /** @type {HTMLSelectElement} */ #orderBy;
    /** @type {HTMLSelectElement} */ #orderDir;
    /** @type {HTMLSelectElement} */ #isRoomActive;
    /** @type {HTMLSelectElement} */ #isFurnished;
    /** @type {HTMLSelectElement} */ #gender;
    /** @type {HTMLInputElement} */ #rentMin;
    /** @type {HTMLInputElement} */ #rentMax;
    /** @type {HTMLButtonElement} */ #filter;
    /** @type {HTMLButtonElement} */ #statistics;
    
    /** @type {HTMLDivElement} */ #results;

    /** @type {boolean} */ #hasResults = false;


    constructor() {
        super();

        this.cityId = window.localStorage.getItem("cityId");
        this.cityName = window.localStorage.getItem("cityName");

        const template = document.getElementById("property-filter");
        const templateContent = template.content;
        
        this.attachShadow({ mode:"open"});
        this.shadowRoot.appendChild(templateContent.cloneNode(true));

        this.shadowRoot.getElementById("city-id").innerText = this.cityId;
        this.shadowRoot.getElementById("city-name").innerText = this.cityName;

        this.#limit = this.shadowRoot.getElementById("limit");
        this.#orderBy = this.shadowRoot.getElementById("order-by");
        this.#orderDir = this.shadowRoot.getElementById("order-dir");
        this.#isRoomActive = this.shadowRoot.getElementById("is-room-active");
        this.#isFurnished = this.shadowRoot.getElementById("is-furnished");
        this.#gender = this.shadowRoot.getElementById("gender");
        this.#rentMin = this.shadowRoot.getElementById("rent-min");
        this.#rentMax = this.shadowRoot.getElementById("rent-max");
        this.#filter = this.shadowRoot.getElementById("filter");
        this.#statistics = this.shadowRoot.getElementById("show-statistics");
        this.#results = this.shadowRoot.getElementById("properties");

        this.addSelectionOptions(this.#orderBy, "Order By", propertyFilterStorage.getOrderByOptions(), 
                        propertyFilterStorage.getOrderBySelected(), propertyFilterStorage.setOrderBySelected);
        this.addSelectionOptions(this.#orderDir, "Order Direction", propertyFilterStorage.getOrderDirOptions(), 
                        propertyFilterStorage.getOrderDirSelected(), propertyFilterStorage.setOrderDirSelected);
        this.addSelectionOptions(this.#isRoomActive, "Is Room Active", propertyFilterStorage.getIsRoomActiveOptions(), 
                        propertyFilterStorage.getIsRoomActiveSelected(), propertyFilterStorage.setIsRoomActiveSelected);
        this.addSelectionOptions(this.#isFurnished, "Is Furnished", propertyFilterStorage.getIsFurnishedOptions(), 
                        propertyFilterStorage.getIsFurnishedSelected(), propertyFilterStorage.setIsFurnishedSelected);
        this.addSelectionOptions(this.#gender, "Prefered Gender", propertyFilterStorage.getGenderOptions(), 
                        propertyFilterStorage.getGenderSelected(), propertyFilterStorage.setGenderSelected);

        this.#filter.addEventListener("click", async () => {
            await this.filter();
        });

        this.#statistics.addEventListener("click", async () => {
            await this.getStatistics();
        })

    }

    addSelectionOptions(dropDownElem, text, options, selection, setFunction) {
        // Order by
        let optionElem = document.createElement("option");
        optionElem.value = "";
        optionElem.innerHTML = text;
        optionElem.disabled = true;
        optionElem.selected = selection === null;

        dropDownElem.appendChild(optionElem);

        for(let option of options) {
            optionElem = document.createElement("option");
            optionElem.value = option;
            optionElem.text = option;
            optionElem.selected = option === selection;

            dropDownElem.appendChild(optionElem);
        }
        dropDownElem.addEventListener("change", this.changeSelection.bind(this, setFunction, selection ,dropDownElem))
    }

    changeSelection(dropDownElem, selection, setFunction){
        const value = dropDownElem.value;
        try {
            setFunction(value);
            selection = dropDownElem.value;
        } catch(e) {
            dropDownElem.value = selection;
        }
    }

    async filter() {
        if(this.#limit.value == "") {
            this.#limit.value = 100;
        }

        /** @type {ModelPropertySummary} */ let propertyResults;
        try {
            propertyResults = await properties.getPropertiesInCity("application/json",this.cityId,this.#limit.value,
                                                this.#orderBy.value, this.#orderDir.value, this.#isRoomActive.value, 
                                                this.#isFurnished.value, this.#gender.value, this.#rentMin.value, 
                                                this.#rentMax.value);
        } catch(e) {
            this.#results.innerHTML = "";
            let noResults = document.createElement("span");
            noResults.innerText = "No results, try again.";
            this.#results.appendChild(noResults);
            this.#hasResults = false;
            return;
        }
        
        this.#results.innerHTML = "";
        this.#hasResults = false;

        let index = 0;
        for (let property of propertyResults) {
            let propertySummaryView = new PropertySummary();
            propertySummaryView.propertyID = property.propertyID;

            let typeSpan = document.createElement("span");
            typeSpan.slot = "type";
            typeSpan.innerText = `type: ${property.propertyID.split("-")[0]}`;
            
            let rentSpan = document.createElement("span");
            rentSpan.slot = "rent";
            rentSpan.innerText =`rent: ${property.rent}` ;
            
            propertySummaryView.appendChild(typeSpan);
            propertySummaryView.appendChild(rentSpan);
            
            propertySummaryView.addEventListener("click", () => {
                this.dispatchEvent(new PropertySelectedEvent(property.propertyID));
            });
            
            this.#results.appendChild(propertySummaryView);
            this.#hasResults = true;
            index = index+1;
        }
        
        if (this.#hasResults == false) {
            let noResults = document.createElement("span");
            noResults.innerText = "No results, try again.";
            this.#results.appendChild(noResults);
        }
    }

    async getStatistics() {
        if(this.#limit.value == "") {
            this.#limit.value = 100;
        }
        let statsResult;
        try {
            statsResult = await properties.getStatisticsOfCity("application/json",this.cityId,this.#limit.value,
                                            this.#isRoomActive.value, this.#isFurnished.value, this.#gender.value, 
                                            this.#rentMin.value, this.#rentMax.value);
        } catch(e) {
            alert(e);
            console.log(e);
            this.#hasResults = false;
        }

        this.#results.innerHTML = "";
        this.#hasResults = false;

        let statsView = new Statistics();
        
        let depositMean = document.createElement("slot");
        depositMean.slot = "mean-deposit";
        depositMean.innerText = statsResult.meanDeposit;

        let depositMedian = document.createElement("slot");
        depositMedian.slot = "median-deposit";
        depositMedian.innerText = statsResult.medianDeposit;

        let depositStd = document.createElement("slot");
        depositStd.slot = "std-deposit";
        depositStd.innerText = statsResult.stdDeposit;
        
        let rentMean = document.createElement("slot");
        rentMean.slot = "mean-rent";
        rentMean.innerText = statsResult.meanRent;

        let rentMedian = document.createElement("slot");
        rentMedian.slot = "median-rent";
        rentMedian.innerText = statsResult.medianRent;

        let rentStd = document.createElement("slot");
        rentStd.slot = "std-rent";
        rentStd.innerText = statsResult.stdRent;

        statsView.appendChild(depositMean);
        statsView.appendChild(depositMedian);
        statsView.appendChild(depositStd);
        statsView.appendChild(rentMean);
        statsView.appendChild(rentMedian);
        statsView.appendChild(rentStd);

        this.#results.appendChild(statsView);
        this.#hasResults = true        
    }   

}

window.customElements.define("property-filter", PropertiesFilter);