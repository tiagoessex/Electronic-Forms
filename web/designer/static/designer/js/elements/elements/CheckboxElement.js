
import { BaseElement } from './BaseElement.js';
import { ELEMENTS_TYPE } from '../constants.js';
import { PROPERTIES_ID } from '../../constants/constants.js';
import { Text } from '/static/js/ui/BuildingBlocks.js';
import { DEFAULT_FONT_SIZE } from '../../constants/dimensions.js';


/**
 * Checkbox element.
 * 
 * Notes : The label adjusts according to the box size.
 * 
 */
export class CheckboxElement extends BaseElement {
    /**
     * Constructor.
     * @param {ELEMENTS_TYPE} type Type of element (defined in constants.js)
     * @param {object} props Object corresponding to the properties (see UIPropertiesMenu.js).
     * @param {node} parent Node parent of the Element.
     * @param {Context} context Context.
     * @param {number} left Left position coordinate.
     * @param {number} top Top postion coordinate.
     * @param {string} id Id of the element.
     * @param {rgb[a]} background Background color.
     */      
    constructor(type=ELEMENTS_TYPE.NONE, props = null, parent=null, context=null, left, top, id, background=null) {
        super(type, props, parent, context, left, top, id, background);

        this.setStyle("border",props?props[PROPERTIES_ID.BORDERPROPERTY]:"solid");
        this.setStyle("border-width",(props?props[PROPERTIES_ID.BORDERWIDTHPROPERTY]:"1") + 'px');

        this.label = new Text(id).attachTo(this);
        this.label.setStyle("position",'absolute');
        this.label.setStyle("white-space",'nowrap');
        this.label.setStyle('text-decoration',props?props[PROPERTIES_ID.FONTDECORATIONPROPERTY]:"initial");
        
        if (props) {
            // position the label
            // horizontally
            this.label.dom.style.left = (parseInt(this.dom.style.width) + 4) + 'px';
            // vertically
            let font_size = parseInt(this.dom.style.fontSize);
            if (font_size !== font_size) {    // check if nan
                font_size = DEFAULT_FONT_SIZE;
            }
            this.label.dom.style.top = (parseInt(this.dom.style.height) / 2 - font_size) + 'px';
            if (props[PROPERTIES_ID.SHOWLABELPROPERTY] === 'yes') {
                this.label.setTextContent(props[PROPERTIES_ID.LABELPROPERTY] !==''?props[PROPERTIES_ID.LABELPROPERTY]:id);//'Checkbox');                
            } else {
                this.label.setTextContent('');
            }
        } else {
            this.label.setStyle("left",'30px');
        }

        /**
         * On resize, the label position also required update.
         */        
        this.signal_onElementResized = context.signals.onElementResized.add((element, width, height) => {
            if (element !== this) return;
            const label = this.dom.childNodes[4];
            // horizontal
            label.style.left = (width + 4) + 'px';
            // vertically
            let font_size = parseInt(this.dom.style.fontSize);
            if (font_size !== font_size)    // check if nan
                font_size = DEFAULT_FONT_SIZE;
            label.style.top = (height / 2 - font_size) + 'px';

        });

    }

    /**
     * Cleanup operations.
     */
    clear() {
        super.clear();
        this.signal_onElementResized.detach();
    }

    /**
     * Gets the checkbox label.
     * @returns The label component.
     */
    getLabel() {
        return this.label;
    }

    /**
     * Sets the text of the label.
     * @param {string} new_label New label.
     */
    setLabel(new_label) {
        this.label.setTextContent(new_label);
    }
}
