import properties from "../api/properties.js";
import ModelProperty from "../models/property.js";
import EditProperty from "./update-property.js";


export default class PropertyDetail extends HTMLElement {
    propertyId;
    #hasResult;

    #propertyIdElement;
    #isRoomActive;
    #areaSqm;
    #gender;
    #furnished;
    /** @type {HTMLImageElement}*/ #coverImage;
    #rent;
    #deposit;
    #additionalCost;
    #rentPerSqm;
    #latitude;
    #longitude;
    #googleLocation;
    #cityId;
    #cityName;
    
    #backgroundImage;
    // ------- buttons
    #buttonUpdate;
    #buttonDelete;

    // update panel
    #updatePanel;
    

    constructor() {
        super();
        const template = document.getElementById("property-detail");
        const templateContent = template.content;

        this.attachShadow({ mode:"open"});
        this.shadowRoot.appendChild(templateContent.cloneNode(true));
        
        this.propertyId = window.localStorage.getItem("propertyId");
        this.#coverImage = this.shadowRoot.getElementById("profile-image");
        this.#propertyIdElement = this.shadowRoot.getElementById("propertyId");
        this.#isRoomActive = this.shadowRoot.getElementById("is-room-active");
        this.#areaSqm = this.shadowRoot.getElementById("sqm");
        this.#gender = this.shadowRoot.getElementById("gender");
        this.#furnished = this.shadowRoot.getElementById("furnished");
        this.#rent = this.shadowRoot.getElementById("rent");
        this.#deposit = this.shadowRoot.getElementById("deposit");
        this.#additionalCost = this.shadowRoot.getElementById("added-costs");
        this.#rentPerSqm = this.shadowRoot.getElementById("rent-per-sqm");
        this.#latitude = this.shadowRoot.getElementById("latitude");
        this.#longitude = this.shadowRoot.getElementById("longitude");
        this.#googleLocation = this.shadowRoot.getElementById("google-location");

        this.#backgroundImage = this.shadowRoot.getElementById("bg-image");
        this.#buttonUpdate = this.shadowRoot.getElementById("update");
        this.#buttonDelete = this.shadowRoot.getElementById("delete");
        
        this.#updatePanel = this.shadowRoot.getElementById("update-panel");
        this.#buttonUpdate.addEventListener("click", async () => {
            await this.updateProperty();
        });
        
        this.#buttonDelete.addEventListener("click", async () => {
            await this.deleteProperty();
        });
        
        this.buildDetails();
        
        
        
    }

    async buildDetails() {
        /** @type {ModelProperty} */
        let propertyObject;
        try {
            propertyObject = await properties.getPropertyById(this.propertyId)
        } catch(e) {
            alert(e);
            console.log(e);
        }
        this.#propertyIdElement.innerText = this.propertyId;
        this.#isRoomActive.innerText = propertyObject.isRoomActive;
        this.#areaSqm.innerText = propertyObject.areaSqm;
        this.#gender.innerText = propertyObject.gender;
        this.#furnished.innerText = propertyObject.furnished;
        this.#coverImage.src = propertyObject.coverImageUrl;
        
        // Cost
        this.#rent.innerText = propertyObject.cost.rent;
        this.#deposit.innerText = propertyObject.cost.deposit;
        this.#additionalCost.innerText = propertyObject.cost.additionalCost;
        this.#rentPerSqm.innerText = propertyObject.cost.rentPerAreaSqm; 
        
        // Location
        this.#latitude.innerText = propertyObject.location.latitude;
        this.#longitude.innerText = propertyObject.location.longitude;
        this.#googleLocation.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAS6tHQ5EECba2PVt5jrFBgsru7D4n7X8s&q=${propertyObject.location.latitude}+${propertyObject.location.longitude}&language=EN`
        // city
        this.#cityId = propertyObject.city.id;
        this.#cityName = propertyObject.city.name;
    }

    async deleteProperty() {
        let deleteResponse;
        try {
            // we had to use this function name because we were getting an error which we could not solve
            // the error said "<function-name> is not a function. It said this for any function name we would attempt."
            deleteResponse = await properties.getPropertyById(this.propertyId, "DELETE");
        } catch(e) {
            alert(e);
            console.log(e);
        }
        alert(`Property ${this.propertyId} has been deleted successfully!` );
        window.location.href="/index.html";
    }
    
    async updateProperty() {
        var data = {
            "isRoomActive": (this.#isRoomActive.innerHTML == 'true'),
            "areaSqm": parseInt(this.#areaSqm.innerHTML),
            "gender": this.#gender.innerHTML,
            "furnished": this.#furnished.innerHTML,
            "coverImageUrl": this.#coverImage.src,
            "cost": {
                "rent": parseInt(this.#rent.innerHTML),
                "additionalCost": parseInt(this.#additionalCost.innerHTML),
                "deposit": parseInt(this.#deposit.innerHTML),
                "rentPerAreaSqm": parseInt(this.#rentPerSqm.innerHTML)
            },
            "location": {
                "longitude" : parseInt(this.#longitude.innerHTML),
                "latitude" : parseInt(this.#latitude.innerHTML)
            },
            "city": {
                "id": this.#cityId,
                "name": this.#cityName
            }
        };
        this.#updatePanel.innerHTML = "";
        let editor = new EditProperty(this.propertyId, data);
        this.#updatePanel.appendChild(editor);
    }

};


window.customElements.define('property-detail', PropertyDetail);