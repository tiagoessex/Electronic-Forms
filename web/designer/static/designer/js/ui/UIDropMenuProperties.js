import { UIDropMenu } from './UIDropMenu.js'
import { Table, TableCol } from '/static/js/ui/BuildingBlocks.js'

/**
 * Class representing a single dropdown perperties menu 
 * @extends UIDropMenu
 */
 export class UIDropMenuProperties extends UIDropMenu {
    /**
     * Constructor.
     * @param {string} title Title/text of the dropdown.
     * @param {string} id ID.
     * @param {node | ?} container Parent node.
     * @param {string} icon Font awesome icon.
     */
	constructor(title, id, container, icon) {
		super(title, id, container, icon, true, true); 
		this.addClass('UIDropMenuProperties');

        // expand the dropdown
        this.items.addClass("show");

        // and add a new container format: table        
        this.table = new Table();
        this.table.addClass("text-black bg-white");
        this.table.setStyle("width", "100%");
        this.table.attachTo(this.items);        

        const colgroup = document.createElement("colgroup");
        this.table.dom.appendChild(colgroup);

        const col_1 = new TableCol();
        col_1.setAttribute("span","1");
        col_1.setStyle("width","45%");
        col_1.attachTo(colgroup);
        const col_2 = new TableCol();
        col_2.setAttribute("span","1");
        col_2.setStyle("width","65%");
        col_2.attachTo(colgroup);
        
    }

    /**
     * Adds a UIFormElementsItem | UIPropertiesItem.
     * @param {UIDropMenuProperties} field UIFormElementsItem | UIPropertiesItem to add to the dropdown menu.
     */
    add(field) {
        field.attachTo(this.table);
    }

}
