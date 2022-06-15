
import { PROPERTIES_ID } from './constants/constants.js';
import { PropertyTabActions } from './PropertyTabActions.js';


/**
 * Copy / Paste the formatting values of an element to another.
 */
export class Brush {
    /**
     * Constructor.
     */
    constructor() {
        // Properties that can be copied/pasted
        // Check constants/constants.js
        this.formatting = {
            VISIBLEPROPERTY:'',
            CROSSEDPROPERTY:'',
            ZINDEXPROPERTY:'',
            FONTPROPERTY:'',
            FONTSIZEPROPERTY:'',
            FONTSTYLEPROPERTY:'',
            FONTDECORATIONPROPERTY:'',
            FONTWEIGHTPROPERTY:'',
            HORIZONTALALIGNMENTPROPERTY:'',
            COLORPROPERTY:'',
            BACKCOLORPROPERTY:'',
            BACKALPHAPROPERTY:'',
            BORDERBORDERSPROPERTY:'',
            BORDERPROPERTY:'', 
            BORDERWIDTHPROPERTY:'',
            BORDERRADIUSPROPERTY:'',
            ROTATIONPROPERTY:'',
        }

        this.element_id = null;
        this.table_config = null;
    }

    /**
     * Makes a copy of all relevant properties of an element.
     * @param {Element} origin_element Element to fetch the properties from.
     */
    copy(origin_element) {
        this.element_id = origin_element.dom.id;
        for (const key in this.formatting) {
            this.formatting[key] = origin_element.props[PROPERTIES_ID[key]];
        }
        
        // if it's a table then copy all config except a few properties
        if (origin_element.dom.dataset.type === 'TABLE') {
            this.table_config = {...origin_element.getTableConfig()};
            delete this.table_config.data_cols;
            delete this.table_config.n_cols;
            delete this.table_config.n_rows;
            delete this.table_config.width;
        } else {
            this.table_config = null;
        }

    }

    /**
     * Pastes the properties stored into the selected elements.
     * @param {Context} context Context.
     * @param {Array of Elements} destiny_elements Elements to copy the stored properties to.
     * @returns 
     */
    paste(context, destiny_elements) {
        // the same element?
        if (destiny_elements.length == 1 && destiny_elements[0].dom.id === this.element_id) {
            return;
        }
        if (!this.table_config) {
            for (const key in this.formatting) {
                PropertyTabActions(context, PROPERTIES_ID[key], this.formatting[key], destiny_elements);
            }
        }
        // if table, set the values
        destiny_elements.forEach(element => {
            if (element.dom.dataset.type === 'TABLE') {
                const new_config = Object.assign(element.getTableConfig(), this.table_config)
                element.init(new_config, true);    
            }
        })

    }

}