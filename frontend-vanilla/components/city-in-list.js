export default class CityInList extends HTMLElement {
    get id() {
        return this.getAttribute("id");
    }

    set id(value) {
        if(value == null){
            this.removeAttribute("id");
        } else {
            this.setAttribute("id", value);
        }
    }

    constructor() {
        super();

        const template = document.getElementById("city-in-list");
        const templateContent = template.content;

        this.attachShadow({ mode:"open" });
        this.shadowRoot.appendChild(templateContent.cloneNode(true));
    }
}

window.customElements.define("city-in-list", CityInList);

