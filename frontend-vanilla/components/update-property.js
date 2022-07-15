import properties from "../api/properties.js";
import storage from "../storage/property-filter-storage.js";

export default class EditProperty extends HTMLElement {
    // ------- for editting
    /** @type {HTMLSelectElement} */ #editFurnished;
    /** @type {HTMLSelectElement} */ #editGender;
    /** @type {HTMLSelectElement} */ #editIsRoomActive;
    /** @type {HTMLInputElement} */  #editRent;
    /** @type {HTMLInputElement} */  #editAdditionalCost;
    /** @type {HTMLInputElement} */  #editDeposit;
    /** @type {HTMLButtonElement} */ #updateButton;
    propertyId;
    data;
    constructor(propertyId, data) {
        super();
        this.propertyId = propertyId;
        this.data = data;
        const template = document.getElementById("property-detail-edit");
        const templateContent = template.content;

        this.attachShadow({ mode:"open"});
        this.shadowRoot.appendChild(templateContent.cloneNode(true));
    
        this.#editFurnished = this.shadowRoot.getElementById("furnished-edit");
        this.#editGender = this.shadowRoot.getElementById("gender-edit");
        this.#editIsRoomActive = this.shadowRoot.getElementById("is-room-active-edit");
        this.#editRent = this.shadowRoot.getElementById("rent-edit");
        this.#editAdditionalCost = this.shadowRoot.getElementById("added-costs-edit");
        this.#editDeposit = this.shadowRoot.getElementById("deposit-edit");
        this.#updateButton = this.shadowRoot.getElementById("submit-update");

        this.addSelectionOptions(this.#editFurnished, "Furnish status", storage.getIsFurnishedOptions(), 
                        storage.getIsFurnishedSelected(), storage.setIsFurnishedSelected);
        this.addSelectionOptions(this.#editGender, "Gender", storage.getGenderOptions(), 
                        storage.getGenderSelected(), storage.setGenderSelected);
        this.addSelectionOptions(this.#editIsRoomActive, "Is Room Active", storage.getIsRoomActiveOptions(), 
                        storage.getIsRoomActiveSelected(), storage.setIsRoomActiveSelected);
        
        this.#updateButton.addEventListener("click", async () => {
            await this.updateProperty();
        });
    }

    async updateProperty() {
        if (this.#editIsRoomActive.value != "") {
            console.log(typeof this.#editIsRoomActive.value);
            this.data["isRoomActive"] = (this.#editIsRoomActive.value == "true");
        };
        if (this.#editGender.value != "") {
            this.data["gender"] = this.#editGender.value;
        };
        if (this.#editFurnished.value != "") {
            this.data["furnished"] = this.#editFurnished.value;
        };
        if (this.#editGender.value != "") {
            this.data["gender"] = this.#editGender.value;
        };
        if (this.#editRent.value != "") {
            this.data["cost"]["rent"] = this.#editRent.value;
        };
        if (this.#editAdditionalCost.value != "") {
            this.data["cost"]["additionalCost"] = this.#editAdditionalCost.value;
        };
        if (this.#editDeposit.value != "") {
            this.data["cost"]["deposit"] = this.#editDeposit.value;
        };
        console.log("data inside", this.data);
        console.log("typeof isRoomActive", typeof this.data["isRoomActive"])
        let updateResponse;
        try {
            // we had to use this function name because we were getting an error which we could not solve
            // the error said "<function-name> is not a function. It said this for any function name we would attempt."
            updateResponse = await properties.getPropertyById(this.propertyId, "PUT", this.data);
        } catch(e) {
            alert(e);
            console.log(e);
        }
        alert("Property updated");
        location.reload();
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

window.customElements.define("edit-property", EditProperty);