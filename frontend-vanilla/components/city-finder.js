import cities from "../api/cities.js"
import ApiCity from "../models/city.js";
import CityInList from "./city-in-list.js";


export class CitySelectedEvent extends Event {
    /** @type {number} */ cityId;
    /** @type {string} */ cityName;

    /**
     * @param {number} cityId 
     * @param {string} cityName 
     */
    constructor(cityId, cityName) {
        super("city-selected");

        this.cityId = cityId;
        this.cityName = cityName;
    }
}

export default class CityFinder extends HTMLElement {
    /** @type {HTMLInputElement} */ #nameSearch;
    /** @type {HTMLButtonElement} */ #find;
    /** @type {HTMLDivElement} */ #results;
  
    /** @type {boolean} */ #hasResults = false;

    constructor() {
        super();

        const template = document.getElementById("city-finder");
        const templateContent = template.content;

        this.attachShadow({ mode:"open"});
        this.shadowRoot.appendChild(templateContent.cloneNode(true));

        this.#nameSearch = this.shadowRoot.getElementById("city-name");
        this.#find = this.shadowRoot.getElementById("find");
        this.#results = this.shadowRoot.getElementById("cities");
        
        this.#find.addEventListener("click", async () => {
            await this.search();
        });
    }

    async search() {
        /** @type {ApiCity} */
        let cityResult;
        try {
            cityResult = await cities.getCities();
        } catch(e) {
            alert(e);
            return;
        }

        this.#results.innerHTML = "";
        this.#hasResults = false;

        for (let city of cityResult) {
            let searchTerm = this.#nameSearch.value.toLowerCase();
            if(city.name.toLowerCase().includes(searchTerm)){
                let cityView = new CityInList();
                cityView.id = city.id;

                let nameSpan = document.createElement("span");
                nameSpan.slot = "name";
                nameSpan.innerText = city.name;
                
                cityView.appendChild(nameSpan);

                cityView.addEventListener("click", () => {
                    this.dispatchEvent(new CitySelectedEvent(city.id, city.name));
                });

                this.#results.appendChild(cityView);
                this.#hasResults = true;
            }
        }
        if (this.#hasResults == false) {
            let noResults = document.createElement("span");
            noResults.innerText = "No results, try again.";
            this.#results.appendChild(noResults);
        }
    }
};

window.customElements.define("city-finder", CityFinder);
