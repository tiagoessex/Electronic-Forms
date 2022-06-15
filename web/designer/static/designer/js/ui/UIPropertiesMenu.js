import { Div, Hx } from '/static/js/ui/BuildingBlocks.js'
import { UIDropMenuProperties } from './UIDropMenuProperties.js'
import { INPUT_TYPE, UIPropertiesItem } from './UIPropertiesItem.js';
import { READONLYCOLOR } from '../constants/colors.js';
import { PROPERTIES_ID, PROPERTIES_GROUPS } from '../constants/constants.js';
import { Translator } from '/static/js/Translator.js';


const container = document.getElementById("properties-menu");
const PROPERTIES_FORM_ID = 'properties-form';

export class UIPropertiesMenu extends Div {
    
    static DEFAULTPROPS = null; // Default properties

    /**
     * Constructor.
     * @param {Context} context Context.
     */
    constructor (context) {
        super();
        
        this.addClass("nav flex-column flex-nowrap text-black p-2");
        this.attachTo(container);

        const h4 = new Hx('4').attachTo(this); 
        h4.addClass("text-center text-white");
        h4.setTextContent(Translator.translate("PROPERTIES"));
        
        // a form for serialization
        const form = document.createElement('form');
        this.dom.appendChild(form);
        form.id = PROPERTIES_FORM_ID;

        const menu = new Div().attachTo(form);
        menu.addClass("list-group");

        const PG_Location = new UIDropMenuProperties(Translator.translate("Location"),"P-Location", menu,"fa fa-map-marker-alt");    

        const PG_Field = new UIDropMenuProperties(Translator.translate("Field"),"P-Field", menu,'fa fa-font');
        const PG_Display = new UIDropMenuProperties(Translator.translate("Display"),"P-Display", menu,'fa fa-eye');
        //const PG_Quick = new UIDropMenuProperties("Quick E/A","P-Quick-EA", menu,'flash');

        PG_Location.add(new UIPropertiesItem(context, Translator.translate("Page:"),PROPERTIES_ID.PAGENUMBERPROPERTY,INPUT_TYPE.NUMBER,{attributes: {readonly: true, min:0, max:100, value:1, step: 1 }, styles:{background:READONLYCOLOR}}));
        PG_Location.add(new UIPropertiesItem(context, Translator.translate("Section:"),PROPERTIES_ID.SECTIONPROPERTY,INPUT_TYPE.SELECT));
        PG_Location.add(new UIPropertiesItem(context, Translator.translate("LV Header:"),PROPERTIES_ID.LISTHEADERPROPERTY,INPUT_TYPE.SELECT, {options:{"yes":"Yes","no":"No"}, attributes: {value:"no"}}));


        PG_Field.add(new UIPropertiesItem(context, Translator.translate("ID:"),PROPERTIES_ID.IDPROPERTY,INPUT_TYPE.TEXT,{attributes: {readonly: true}, styles:{background:READONLYCOLOR}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Name:"),PROPERTIES_ID.NAMEPROPERTY,INPUT_TYPE.TEXT,{attributes: {placeholder: Translator.translate("Element's name")}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Label/Text:"),PROPERTIES_ID.LABELPROPERTY,INPUT_TYPE.TEXTBUTTON, {attributes: {placeholder:Translator.translate("Label or Text")},"icon":"..."})); //INPUT_TYPE.TEXT,{attributes: {placeholder: "Default is name"}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Show Label:"),PROPERTIES_ID.SHOWLABELPROPERTY,INPUT_TYPE.SELECT, {options:{"yes":"Yes","no":"No"}, attributes: {value:"yes"}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Default Value:"),PROPERTIES_ID.DEFAULTPROPERTY,INPUT_TYPE.TEXT,{attributes: {placeholder: Translator.translate("Default value")}}));    
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Enabled:"),PROPERTIES_ID.ENABLEDPROPERTY,INPUT_TYPE.SELECT, {options:{"yes":"Yes","no":"No"}, attributes: {value:"yes"}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Crossed:"),PROPERTIES_ID.CROSSEDPROPERTY,INPUT_TYPE.SELECT, {options:{"yes":"Yes","no":"No"}, attributes: {value:"no"}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Placeholder:"),PROPERTIES_ID.PLACEHODLERPROPERTY,INPUT_TYPE.TEXT,{attributes: {placeholder: Translator.translate("Placeholder")}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Max Length:"),PROPERTIES_ID.MAXLENGTHPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Max length"), min:0, max:10000, value:100, step: 1 }}));

        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Max Value:"),PROPERTIES_ID.MAXPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Max value"), max:10000, value:100 }}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Min Value:"),PROPERTIES_ID.MINPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Min value"), min:-10000, value:0 }}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Step:"),PROPERTIES_ID.STEPPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Step"), min:-100, max:100, step:0.1, value:1 }}));

        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Uppercase:"),PROPERTIES_ID.UPPERCASEPROPERTY,INPUT_TYPE.SELECT, {options:{"yes":"Yes","no":"No"}, attributes: {value:"no"}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Required:"),PROPERTIES_ID.REQUIREDPROPERTY,INPUT_TYPE.SELECT, {options:{"yes":"Yes","no":"No"}, attributes: {value:"no"}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Checked:"),PROPERTIES_ID.CHECKEDPROPERTY,INPUT_TYPE.SELECT, {options:{"yes":"Yes","no":"No"}, attributes: {value:"no"}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Items:"),PROPERTIES_ID.ITEMSPROPERTY,INPUT_TYPE.BUTTON, {"text":Translator.translate("Define Items")}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Database:"),PROPERTIES_ID.DATABASEPROPERTY,INPUT_TYPE.TEXTBUTTON, {attributes: {placeholder:Translator.translate("Linked to ..."), readonly: true},"icon":"..."}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Group:"),PROPERTIES_ID.GROUPPROPERTY,INPUT_TYPE.SELECT, {options:{'none':'None'}, attributes: {value:'none'}}));
        //PG_Field.add(new UIPropertiesItem(context, "Group:",PROPERTIES_ID.GROUPPROPERTY,INPUT_TYPE.TEXT, {attributes: {readonly:true, value: DEFAULT_GROUP_NAME}, styles:{background:READONLYCOLOR}}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Pattern:"),PROPERTIES_ID.PATTERNPROPERTY,INPUT_TYPE.TEXTBUTTON, {attributes: {placeholder:Translator.translate("Regular expression"), value:""},"icon":"..."}));
        PG_Field.add(new UIPropertiesItem(context, Translator.translate("Image Url:"),PROPERTIES_ID.IMAGEURLPROPERTY,INPUT_TYPE.TEXTBUTTON, {attributes: {placeholder:Translator.translate("Image url ..."), readonly: true},"icon":"..."}));

        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Visible:"),PROPERTIES_ID.VISIBLEPROPERTY,INPUT_TYPE.SELECT, {options:{"yes":"Yes","no":"No"}}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Z-Index:"),PROPERTIES_ID.ZINDEXPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: "Z-Index", min:1, max:20000, value:10, step: 1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Top:"),PROPERTIES_ID.TOPPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Top position"), min:0, max:1500, value:0, step: 1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Left:"),PROPERTIES_ID.LEFTPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Left position"), min:0, max:1500, value:0, step: 1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Width:"),PROPERTIES_ID.WIDTHPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Width"), min:0, max:1500, value:250, step: 1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Height:"),PROPERTIES_ID.HEIGHTPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Height"), min:0, max:1500, value:26, step: 1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Font:"),PROPERTIES_ID.FONTPROPERTY,INPUT_TYPE.SELECT, {options:{"Times":"Times","Arial":"Arial","monospace":"monospace"}, value:"Times"}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Font Size:"),PROPERTIES_ID.FONTSIZEPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: "Font's size", min:0, max:100, value:16, step: 1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Style:"),PROPERTIES_ID.FONTSTYLEPROPERTY,INPUT_TYPE.SELECT, {options:{"normal":"normal","italic":"italic"}}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Decoration:"),PROPERTIES_ID.FONTDECORATIONPROPERTY,INPUT_TYPE.SELECT, {options:{"none":"None", "overline":"Overline","line-through":"Line Through","underline":"Underline"}, attributes: {value:"none"}}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Weight:"),PROPERTIES_ID.FONTWEIGHTPROPERTY,INPUT_TYPE.SELECT, {options:{"normal":"normal","bold":"bold"}}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("H. Alignment:"),PROPERTIES_ID.HORIZONTALALIGNMENTPROPERTY,INPUT_TYPE.SELECT, {options:{"left":"Left","right":"Right","center":"Center","justify":"Justify"}, value:"left"}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Color:"),PROPERTIES_ID.COLORPROPERTY,INPUT_TYPE.COLOR, {attributes: {"value":'#000000'}}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Back Color:"),PROPERTIES_ID.BACKCOLORPROPERTY,INPUT_TYPE.COLOR, {attributes: {"value":'#ffffff'}}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Back Alpha:"),PROPERTIES_ID.BACKALPHAPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: "Alpha", min:0, max:1, value:0.2, step: 0.1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Borders:"),PROPERTIES_ID.BORDERBORDERSPROPERTY,INPUT_TYPE.SELECT, {options:{"top":"Top","bottom":"Bottom","left":"Left","right":"Right", "all":"All"}, attributes: {value:"all"}}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Border Style:"),PROPERTIES_ID.BORDERPROPERTY,INPUT_TYPE.SELECT, {options:{"solid":"Solid","dotted":"Dotted","dashed":"Dashed","inset":"Inset", "none":"None"}, attributes: {value:"none"}}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Border Width:"),PROPERTIES_ID.BORDERWIDTHPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: "Width", min:0, max:100, value:1, step: 1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Border Radius:"),PROPERTIES_ID.BORDERRADIUSPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: "Radius", min:0, max:100, value:0, step: 1 }}));
        PG_Display.add(new UIPropertiesItem(context, Translator.translate("Rotation:"),PROPERTIES_ID.ROTATIONPROPERTY,INPUT_TYPE.NUMBER,{attributes: {placeholder: Translator.translate("Radius"), min:-360, max:360, value:0, step: 1 }}));

        UIPropertiesMenu.DEFAULTPROPS = UIPropertiesMenu.getProperties();

        context.signals.onStuffDone.dispatch('UIPropertiesMenu ready!');
    }


    /**
     * Get all the value of all properties.
     * @returns Object with the values of all current properties
     */
    static getProperties() {
        let form_data = $('#' + PROPERTIES_FORM_ID).serializeArray();
        let data = {};
        $(form_data).each(function(index, obj){
            data[obj.name] = obj.value;
        });
        return data;
    }

    /**
     * Restores the values of the properties.
     * @param {object} dataObj Object with the properties values.
     */
    static restoreProperties(dataObj) {
        for (const key in dataObj) {
            document.getElementById(key).value = dataObj[key];
        }
    }


    /**
     * Shows/hides properties fields according to a specific type
     * @param {hex} type Visibility flags (check elements/constants.js)
     */
    static setPropertiesVisibility(type) {
        for (const g in PROPERTIES_GROUPS) {
            let flags = type.visibility[g];
            for (let i =0; i<PROPERTIES_GROUPS[g].length; i++) {
                let ele = document.getElementById(PROPERTIES_GROUPS[g][i]);
                if (1 & flags) {   
                    $(ele).show();
                } else {
                    $(ele).hide();
                }
                flags = flags >>> 1;        
            }
        }
    }


}
