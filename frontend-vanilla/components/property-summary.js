export default class PropertySummary extends HTMLElement {
    /** @type {string} */
    get propertyID() {
        return this.getAttribute("id");
    }

    set propertyID(value) {
        if (value == null) {
            this.removeAttribute("id");
        } else {
            this.setAttribute("id", value);
        }
    }

    constructor() {
        super();

        const template = document.getElementById("property-summary");
        const templateContent = template.content;

        this.attachShadow({ mode:"open" });
        this.shadowRoot.appendChild(templateContent.cloneNode(true));
    }
}

window.customElements.define("property-summary", PropertySummary);