export default class Statistics extends HTMLElement {
    
    
    constructor() {
        super();

        const template = document.getElementById("city-stats");
        const templateContent = template.content;

        this.attachShadow({ mode:"open" });
        this.shadowRoot.appendChild(templateContent.cloneNode(true));
    }
}

window.customElements.define("city-stats", Statistics);