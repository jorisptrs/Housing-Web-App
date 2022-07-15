import propertySummaries from "../api/properties.js";
import properties from "../api/properties.js";
import ModelPropertySummary from "../models/property-summary.js";
import ModelStatistics from "../models/statistics.js";
import Statistics from "./statistics.js";
import PropertySummary from "./property-summary.js";
import propertyFilterStorage from "../storage/property-filter-storage.js";
import EditProperty from "./update-property.js";
import NewProperty from "./edit-box.js";

export class PropertySelectedEvent extends Event {
    /** @type {string} */ propertyId;

    constructor(propertyId) {
        super("property-selected");
        this.propertyId = propertyId;
    }
}

export default class FilterLocation extends HTMLElement {
    /** @type {HTMLInputElement} */ #latitude;
    /** @type {HTMLInputElement} */ #longitude;
    /** @type {HTMLButtonElement} */ #buttonFilter;
    /** @type {HTMLButtonElement} */ #buttonUpdate;
    /** @type {HTMLButtonElement} */ #buttonDelete;

    /** @type {HTMLDivElement} */ #results;
    /** @type {HTMLDivElement} */ #updatePanel;

    /** @type {boolean} */ #hasResults = false;
    // update panel

    constructor() {
        super();

        const template = document.getElementById("filter-location");
        const templateContent = template.content;
        
        this.attachShadow({ mode:"open"});
        this.shadowRoot.appendChild(templateContent.cloneNode(true));

        this.#latitude = this.shadowRoot.getElementById("latitude");
        this.#longitude = this.shadowRoot.getElementById("longitude");
        
        this.#buttonFilter = this.shadowRoot.getElementById("filter");
        this.#buttonUpdate = this.shadowRoot.getElementById("update");
        this.#buttonDelete = this.shadowRoot.getElementById("delete");
        this.#updatePanel = this.shadowRoot.getElementById("update-panel");

        this.#buttonFilter.addEventListener("click", async () => {
            await this.filter();
            this.updateButtons()
        });

        this.#buttonUpdate.addEventListener("click", async () => {
            await this.updateProperty();
        });
        this.#buttonDelete.addEventListener("click", async () => {
            await this.deleteProperty();
        });
        
        this.#results = this.shadowRoot.getElementById("properties");
    }

    updateButtons() {
        if (this.#hasResults) {
            console.log(this.#hasResults);
            this.#buttonDelete.disabled = false;
            this.#buttonUpdate.disabled = false;
        } 
        if (!this.#hasResults) {
            console.log(this.#hasResults);
            this.#buttonDelete.disabled = true;
            this.#buttonUpdate.disabled = true;
        }
    }

    async filter() {
        /** @type {ModelPropertySummary} */ let propertyResults;
        try {
            propertyResults = await properties.getPropertyByLocation(this.#latitude.value, this.#longitude.value);
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
        }
    }
    async updateProperty() {
        
        this.#updatePanel.innerHTML = "";
        let editor = new NewProperty(true, this.#longitude.value, this.#latitude.value);
        this.#updatePanel.appendChild(editor);
    }

    async deleteProperty() {
        let deleteResponse;
        try {
            deleteResponse = await properties.getPropertyByLocation(this.#latitude.value, this.#longitude.value, "DELETE");
        } catch(e) {
            alert(e);
            console.log(e);
        }
        alert(`Delete successful`);
        window.location.href="/index.html";
    }

}

window.customElements.define("filter-location", FilterLocation);