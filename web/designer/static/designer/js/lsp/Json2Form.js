

/**
 * Restore all elements, groups, sections and e/a.
 */
 export class Json2Form {
     /**
      * 
      * @param {Context} context Context.
      * @param {object} data Data to restore.
      * @param {FormView} formview 
      * @param {ListView} listview 
      * @param {GroupsView} groupsview 
      * @param {EAView} eaview 
      * @param {Properties} properties 
      */
    constructor(context, data, formview, listview, groupsview, eaview, properties) {
        this.context = context;
        this.data = data;
        this.formview = formview;
        this.listview = listview;
        this.groupsview = groupsview;
        this.eaview = eaview;
        this.properties = properties;

        if (this.data && this.data !== undefined && this.data !== '') this.restoreViews();
    };

    restoreViews() {

        this.context.signals.onProgress.dispatch("Setting up the sections ...");

        // restore sections
        try {
	        this.listview.sections_manager.restoreSections(this.data);
        } catch (error) {
            throw({message: "Dev error: restore:sections_manager.restoreSections > " + error});
        }

        this.context.signals.onProgress.dispatch("Setting up the groups ...");
        // restore groups
        try {
            this.groupsview.groups_manager.restore(this.data.hasOwnProperty('groups')?this.data.groups:{});
            this.groupsview.groups_manager.collapse();
        } catch (error) {
            throw({message: "Dev error: restore:groups_manager > " + error});
        }            

        this.context.signals.onProgress.dispatch("Preparing pages ...");
        // restore pages and background images
        try {
            this.formview.pages_manager.restore(this.data);
        } catch (error) {
            throw({message: "Dev error: restore:pages_manager > " + error});
        }            

        this.context.signals.onProgress.dispatch("Setting up the repeating elements ...");
        // restore repeatable manager
        try {
            this.formview.repeated_elements_manager.restore(this.data.hasOwnProperty('repeatables')?this.data.repeatables:[]);        
        } catch (error) {
            throw({message: "Dev error: restore:repeated_elements_manager > " + error});
        }

        this.context.signals.onProgress.dispatch("Setting up all elements ...");
        // restore elements
        try {
            const repeated_elements = this.formview.repeated_elements_manager.getList();
            this.formview.elements_manager.restore(this.data, repeated_elements);
        } catch (error) {
            throw({message: "Dev error: restore:elements_manager > " + error});
        }

        this.context.signals.onProgress.dispatch("Setting up dropdown elements ...");
        // restore dropdowns manager and items
        try {
            this.formview.dopbox_elements_manager.restore(this.data.hasOwnProperty('dropdowns')?this.data.dropdowns:{});
        } catch (error) {
            throw({message: "Dev error: restore:dopbox_elements_manager > " + error});
        }

        this.context.signals.onProgress.dispatch("Finishing setting up the sections ...");
        // restore section items representing groups
        try {
            this.listview.sections_manager.restoreGroups(this.data)
            // restore section items order
            this.listview.sections_manager.restoreOrder(this.data);
        } catch (error) {
            throw({message: "Dev error: restore:sections_manager > " + error});
        }            

        // ---------------------------------
        // all elements were loaded
        this.context.signals.onElementsLoadEnded.dispatch();
        // ---------------------------------

        this.context.signals.onProgress.dispatch("Finishing setting up the groups ...");
        // add elements to the groups
        try {
            this.groupsview.groups_manager.restoreElements();
        } catch (error) {
            throw({message: "Dev error: restore:groups_manager > " + error});
        }            

        this.context.signals.onProgress.dispatch("Setting up the E/A ...");
        // restore E/A
        try {
            this.eaview.ea_manager.restore(this.data.hasOwnProperty('eas')?this.data.eas:{});
            this.eaview.ea_manager.collapse();
        } catch (error) {
            throw({message: "Dev error: restore:ea_manager > " + error});
        }            

        this.context.signals.onProgress.dispatch("Loading and setting up completed!");
    }    

}

