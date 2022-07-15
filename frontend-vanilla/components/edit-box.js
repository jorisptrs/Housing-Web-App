import properties from "../api/properties.js";
import storage from "../storage/property-filter-storage.js";

export default class NewProperty extends HTMLElement {
    // ------- for editting
    /** @type {HTMLInputElement} */  #propertyIdElement;
    /** @type {HTMLSelectElement} */ #isRoomActive;
    /** @type {HTMLInputElement} */  #areaSqm;
    /** @type {HTMLSelectElement} */ #gender;
    /** @type {HTMLSelectElement} */ #furnished;
    /** @type {HTMLInputElement}*/   #coverImage;
    /** @type {HTMLInputElement} */  #rent;
    /** @type {HTMLInputElement} */  #deposit;
    /** @type {HTMLInputElement} */  #additionalCost;
    /** @type {HTMLInputElement} */  #latitude;
    /** @type {HTMLInputElement} */  #longitude;
    /** @type {HTMLInputElement} */  #cityId;
    /** @type {HTMLInputElement} */  #cityName;
    
    /** @type {HTMLButtonElement} */ #submitButton;
    /** @type {boolean} */ put;
    /** @type {number} */ longitudeVal;
    /** @type {number} */ latitudeVal;
    
    constructor(put=false, longitude=null, latitude=null) {
        super();
        this.put = put;
        this.longitudeVal = longitude;
        this.latitudeVal = latitude;
        const template = document.getElementById("property-edit-box");
        const templateContent = template.content;

        this.attachShadow({ mode:"open"});
        this.shadowRoot.appendChild(templateContent.cloneNode(true));
        
        this.propertyId = window.localStorage.getItem("propertyId");
        this.#propertyIdElement = this.shadowRoot.getElementById("property-id-edit");
        
        this.#isRoomActive = this.shadowRoot.getElementById("is-room-active-edit");
        this.#areaSqm = this.shadowRoot.getElementById("sqm-edit");
        this.#gender = this.shadowRoot.getElementById("gender-edit");
        this.#furnished = this.shadowRoot.getElementById("furnished-edit");
        this.#coverImage = this.shadowRoot.getElementById("profile-image-edit");
        
        this.#rent = this.shadowRoot.getElementById("rent-edit");
        this.#deposit = this.shadowRoot.getElementById("deposit-edit");
        this.#additionalCost = this.shadowRoot.getElementById("added-costs-edit");
        
        this.#latitude = this.shadowRoot.getElementById("latitude-edit");
        this.#longitude = this.shadowRoot.getElementById("longitude-edit");
        
        this.#cityId = this.shadowRoot.getElementById("city-id-edit");
        this.#cityName = this.shadowRoot.getElementById("city-name-edit")
        
        

        this.addSelectionOptions(this.#isRoomActive, "Is Room Active", storage.getIsRoomActiveOptions(), 
                        storage.getIsRoomActiveSelected(), storage.setIsRoomActiveSelected);
                        
        this.addSelectionOptions(this.#gender, "Gender", storage.getGenderOptions(), 
                        storage.getGenderSelected(), storage.setGenderSelected);
        
        this.addSelectionOptions(this.#furnished, "Furnish status", storage.getIsFurnishedOptions(), 
                        storage.getIsFurnishedSelected(), storage.setIsFurnishedSelected);
        
        this.#submitButton = this.shadowRoot.getElementById("submit-update");
        this.#submitButton.addEventListener("click", async () => {
            await this.submitProperty();
        })

        if (this.put) {
            this.shadowRoot.querySelectorAll(".delete-if-put").forEach(function(element) {element.remove()})
        }
    }
    
    async submitProperty() {
        console.log(typeof (this.#isRoomActive.value == 'true'));
        if (!this.put && (this.#propertyIdElement.value == "" || 
                        this.#latitude.value == "" ||
                        this.#longitude.value == "")){
            alert("Some input fields are empty2");
            return;
        }
        if (this.#isRoomActive.value == "" ||
            this.#areaSqm.value == "" ||
            this.#gender.value == "" ||
            this.#furnished.value == "" ||
            this.#coverImage.value == "" ||
            this.#rent.value == "" ||
            this.#deposit.value == "" ||
            this.#additionalCost.value == "" ||
            this.#cityId.value == "" ||
            this.#cityName.value == ""
            ) {
                alert("Some input fields are empty");
                return;
            }

        var data = {
            "isRoomActive": (this.#isRoomActive.value == "true"),
            "areaSqm": parseInt(this.#areaSqm.value),
            "gender": this.#gender.value,
            "furnished": this.#furnished.value,
            "coverImageUrl": this.#coverImage.value,
            "cost": {
                "rent": parseInt(this.#rent.value),
                "additionalCost": parseInt(this.#additionalCost.value),
                "deposit": parseInt(this.#deposit.value),
                "rentPerAreaSqm": 0
            },
            "location": {
                "longitude" : parseInt(this.#longitude.value),
                "latitude" : parseInt(this.#latitude.value)
            },
            "city": {
                "id": this.#cityId.value,
                "name": this.#cityName.value
            }
        };
        if (!this.put) {
            data["propertyID"] = this.#propertyIdElement.value;            
        }

        console.log(data);
        let response;
        try {
            // we had to use this function name because we were getting an error which we could not solve
            // the error said "<function-name> is not a function. It said this for any function name we would attempt."
            if (this.put) {
                response = await properties.putPropertyByLocation(this.longitudeVal, this.latitudeVal, data);    
            } else {
                response = await properties.postNewProperty(data);
            }
        } catch(e) {
            alert(e);
            console.log(e);
        }

        if (response) {
            if (this.put) {
                alert("Properties at this location have been updated");
                location.reload();
            } else {
            alert("Property posted");
            window.localStorage.setItem("propertyId", this.#propertyIdElement.value);
            window.location.href = "/property.html";
            }
        }
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
}

window.customElements.define("new-property", NewProperty);