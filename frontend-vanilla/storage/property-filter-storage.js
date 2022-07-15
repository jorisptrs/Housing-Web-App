export default {
    // GET OPTIONS --------------------------------------
    /**
     * Returns the options by which the list can be ordered
     * @returns {string}
     */
    getOrderByOptions() {
        return ["rent", "rent/areaSqm"];
    },
    /**
     * Returns the options for the direction of the ordering
     * @returns {string}
     */
    getOrderDirOptions() {
        return ["ascending", "descending"];
    },
    /**
     * Returns the options for the active status of the property
     * @returns {boolean}
     */
    getIsRoomActiveOptions() {
        return [true, false];
    },
    /**
     * Returns the options for furnishing of the property
     * @returns {string}
     */
    getIsFurnishedOptions() {
        return ["Furnished", "Unfurnished", "Uncarpeted", "Unknown"];
    },
    /**
     * Returns the options for the gender of the inhabitants 
     * @returns {string}
     */
    getGenderOptions() {
        return ["Mixed", "Male", "Female"];
    },


    // GET SELECTED ------------------------------------

    /**
     * Returns the stored order preference
     * @returns {string}
     */
    getOrderBySelected() {
        return window.localStorage.getItem("order");
    },
    /**
     * Returns the stored direction preference
     * @returns {string}
     */
    getOrderDirSelected() {
        return window.localStorage.getItem("orderDirection");
    },
    /**
     * Returns the stored status of the room preference
     * @returns {boolean}
     */
    getIsRoomActiveSelected() {
        return window.localStorage.getItem("roomActive");
    },
    /**
     * Returns the stored preference for the furnishing
     * @returns {string}
     */
    getIsFurnishedSelected() {
        return window.localStorage.getItem("roomFurnished");
    },
    /**
     * Returns the stored gender preference
     * @returns {string}
     */
    getGenderSelected() {
        return window.localStorage.getItem("gender");
    },


    // SET ---------------------------------------------

    /**
     * Stores the given order preference after checking its validity
     * @param {string} value
     */
    setOrderBySelected(value) {
        if(this.getOrderBySelected().indexOf(value) === -1){
            throw new Error("Invalid choice");
        }
        window.localStorage.setItem("order", value)
    },
    /**
     * Stores the given direction preference after checking its validity
     * @param {string} value
     */
    setOrderDirSelected(value) {
        if(this.getOrderDirSelected().indexOf(value) === -1){
            throw new Error("Invalid choice");
        }
        window.localStorage.setItem("orderDirection", value)
    },
    /**
     * Stores the given status preference after checking its validity
     * @param {string} value
     */
    setIsRoomActiveSelected(value) {
        if(this.getIsRoomActiveSelected().indexOf(value) === -1){
            throw new Error("Invalid choice");
        }
        window.localStorage.setItem("roomActive", value)
    },
    /**
     * Stores the given preference for the furnishing after checking its validity
     * @param {string} value
     */
    setIsFurnishedSelected(value) {
        if(this.getIsFurnishedSelected().indexOf(value) === -1){
            throw new Error("Invalid choice");
        }
        window.localStorage.setItem("roomFurnished", value)
    },
    /**
     * Stores the given gender preference after checking its validity
     * @param {string} value
     */
    setGenderSelected(value) {
        if(this.getGenderOptions().indexOf(value) === -1){
            throw new Error("Invalid choice");
        }
        window.localStorage.setItem("gender", value)
    },
    
}