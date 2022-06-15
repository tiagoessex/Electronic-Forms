import { UIFormElementsItem } from './UIFormElementsItem.js'
import { UIDropMenu } from './UIDropMenu.js'
import { Div, Hx } from '/static/js/ui/BuildingBlocks.js'
import { ELEMENTS_TYPE } from '../elements/constants.js';
import { Translator } from '/static/js/Translator.js';
import { subStr } from '/static/js/jsutils.js';

const CONTAINER = document.getElementById('form-elements-menu');


export class UIFormElementsMenu extends Div {
    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor (context) {
        super(); 
        this.dbTables = {};
        this.context = context;

        this.addClass("nav flex-column flex-nowrap text-black p-2");
        this.attachTo(CONTAINER);
        const h4 = new Hx('4');
        h4.addClass("text-center text-white");
        h4.setTextContent(Translator.translate("ELEMENTS"));
        h4.attachTo(this);    
        const menu = new Div();
        menu.addClass("list-group");
        menu.attachTo(this);

        this.FFG_DBField = new UIDropMenu(Translator.translate("DB"),"FF-DBFields", menu,"fa fa-database");    
        const FFG_Editables = new UIDropMenu(Translator.translate("Editables"),"FF-Editables", menu,'fas fa-edit');
        const FFG_Static = new UIDropMenu(Translator.translate("Static"),"FF-Static", menu,'fa fa-building');
        const FFG_Auto = new UIDropMenu(Translator.translate("Auto"),"FF-Auto", menu,'fa fa-cogs');        
        
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Text"), ELEMENTS_TYPE.TEXT));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Email"), ELEMENTS_TYPE.EMAIL));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Phone"), ELEMENTS_TYPE.PHONE));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Website"), ELEMENTS_TYPE.WEBSITE));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("TextBox"), ELEMENTS_TYPE.TEXTBOX));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Number"), ELEMENTS_TYPE.NUMBER));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Drop Down"), ELEMENTS_TYPE.DROPDOWN));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Checkbox"), ELEMENTS_TYPE.CHECKBOX));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Radio"), ELEMENTS_TYPE.RADIO));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Date"), ELEMENTS_TYPE.DATE));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Time"), ELEMENTS_TYPE.TIME));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Photo"), ELEMENTS_TYPE.PHOTO));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Barcode Text"), ELEMENTS_TYPE.BARCODE_TEXT));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Barcode Image"), ELEMENTS_TYPE.BARCODE_IMAGE));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("GPS Text"), ELEMENTS_TYPE.GPS_TEXT));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("GPS Map"), ELEMENTS_TYPE.GPS_MAP));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Signature"), ELEMENTS_TYPE.SIGNATURE));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Drawing"), ELEMENTS_TYPE.DRAWING));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("User Image"), ELEMENTS_TYPE.USERIMAGE));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Table"), ELEMENTS_TYPE.TABLE));
        FFG_Editables.add(new UIFormElementsItem(context, Translator.translate("Foodex"), ELEMENTS_TYPE.FOODEX));

        FFG_Static.add(new UIFormElementsItem(context, Translator.translate("Text Label"), ELEMENTS_TYPE.TEXTLABEL));
        FFG_Static.add(new UIFormElementsItem(context, Translator.translate("Image"), ELEMENTS_TYPE.IMAGE));
        FFG_Static.add(new UIFormElementsItem(context, Translator.translate("Box"), ELEMENTS_TYPE.BOX));
        FFG_Static.add(new UIFormElementsItem(context, Translator.translate("Circle"), ELEMENTS_TYPE.CIRCLE));
        FFG_Static.add(new UIFormElementsItem(context, Translator.translate("Horizontal Line"), ELEMENTS_TYPE.HORIZONTALLINE));
        FFG_Static.add(new UIFormElementsItem(context, Translator.translate("Vertical Line"), ELEMENTS_TYPE.VERTICALLINE));
        FFG_Static.add(new UIFormElementsItem(context, Translator.translate("Static Table"), ELEMENTS_TYPE.STATICTABLE));

        FFG_Auto.add(new UIFormElementsItem(context, Translator.translate("Page Number"), ELEMENTS_TYPE.PAGENUMBER));
        FFG_Auto.add(new UIFormElementsItem(context, Translator.translate("Number of Pages"), ELEMENTS_TYPE.NUMBEROFPAGES));


        context.signals.onStuffDone.dispatch('UIFormElementsMenu ready!');
    }

    /**
     * Creates a dropdown in the DB Fields representing a database table.
     * Any new element representing a field from this table, will be parent to this dropdown.
     * @param {string} table_name Name of the table.
     */
    addDBTable(table_name) {
        const name = subStr(table_name, 8, 12);
        const new_table = new UIDropMenu(name,"FF-" + table_name, this.FFG_DBField, "fa fa-table", false);
        this.dbTables[table_name] = new_table;
        this.FFG_DBField.add(new_table); 
    }

    /**
     * Adds a new element representing a field of a db table.
     * @param {string} table_name Table name.
     * @param {string} field_name Field's name.
     * @param {ELEMENT_TYPE} type Element type.
     * @param {object} data Extra data.
     */
    addDBField = (table_name, field_name, type, data) => {
        // create table if doesn't exist
        if (table_name && !(table_name in this.dbTables)) {
            this.addDBTable(table_name);
        }
        // add field
        if (field_name) {
            let name = field_name;
            if (data) {
                name += ' [' + ELEMENTS_TYPE[type].name + ']';
            }
            this.dbTables[table_name].add(new UIFormElementsItem(this.context, name, ELEMENTS_TYPE[type], data));
        }
    }
}
