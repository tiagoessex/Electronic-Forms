
import { BaseElement } from './BaseElement.js';
import { ELEMENTS_TYPE } from '../constants.js';
import { PROPERTIES_ID } from '../../constants/constants.js';

/**
 * Simple div with text inside.
 */
export class TextElement extends BaseElement {
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

        if (props) {
            const label = props[PROPERTIES_ID.LABELPROPERTY];
            const name = props[PROPERTIES_ID.NAMEPROPERTY];
            let text = '';
            if (type.name === ELEMENTS_TYPE.TEXTLABEL.name)
                text = name !== ''? name : (label !== ''? label : id);
            else
                text = name !== ''? name : id;
            this.setText(text)
        } else {
            this.setText(id);
        }
        
    }
}
