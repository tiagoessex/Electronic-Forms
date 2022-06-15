
/**
 * Gather and prepare all data to be saved, send or whathever.
 */
export class Form2Json {
    constructor(formview, listview, groupsview, eaview, properties ) {
        this.formview = formview;
        this.listview = listview;
        this.groupsview = groupsview;
        this.eaview = eaview;
        this.properties = properties;
    }

    getJson() {    
        const data = {};
        const sections_data = this.getSectionsData();
        const pages_data = this.getPagesData();
        data['id'] = this.properties.id;
        data['name'] = this.properties.name;
        data['description'] = this.properties.description;
        data['date_created'] = this.properties.date_created;
        data['rasters'] = pages_data[0];
        data['pages'] = pages_data[1];
        data['dropdowns'] =  JSON.parse(JSON.stringify(this.getDropDownData()));
        data['repeatables'] =  JSON.parse(JSON.stringify(this.getRepeatableData()));
        data['counter'] = JSON.parse(JSON.stringify(this.formview.elements_manager.getCounter()));
        data['groups'] = this.getGroupsData();
        [data['elements'], data['tables']] = this.getElementsData();
        data['sections'] = sections_data[0];
        data['sections_items'] = sections_data[1];
        data['sections_groups'] = sections_data[2];
        data['eas'] = this.getEAData();

        //console.log(data);
        return data;
    }

    getEAData() {
        try {
            return this.eaview.ea_manager.save();
        } catch (error) {
            throw ("Dev error: save:getEAData > ", error);
        }         
    }

    getGroupsData() {
        try {
            return this.groupsview.groups_manager.save();
        } catch (error) {
            throw ("Dev error: save:getGroupsData > ", error);
        }        
    }

    getPagesData() {
        try {
            return this.formview.pages_manager.save();
        } catch (error) {
            throw ("Dev error: save:getPagesData > ", error);
        }        
    }

    getSectionsData() {
        try {
            return this.listview.sections_manager.save();
        } catch (error) {
            throw ("Dev error: save:getSectionsData > ", error);
        }
    }
    
    getElementsData() {
        try {
            return this.formview.elements_manager.save();
        } catch (error) {
            throw ("Dev error: save:getElementsData > ", error);
        }        
    }

    getDropDownData() {
        try {
            return this.formview.dopbox_elements_manager.save();
        } catch (error) {
            throw ("Dev error: save:getDropDownData > ", error);
        }        
    }

    getRepeatableData() {
        try {
            return this.formview.repeated_elements_manager.save();
        } catch (error) {
            throw ("Dev error: save:getRepeatableData > ", error);
        }        
    }  
    
}

