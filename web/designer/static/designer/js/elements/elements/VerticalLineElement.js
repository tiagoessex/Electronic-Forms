
import { BaseElement } from './BaseElement.js';
import { ELEMENTS_TYPE } from '../constants.js';
import { PROPERTIES_ID } from '../../constants/constants.js';

/**
 * Vertical line => div with left border.
 */
export class VerticalLineElement extends BaseElement {
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

        this.props[PROPERTIES_ID.BORDERBORDERSPROPERTY] = 'left';
        this.setStyle("-webkit-border-radius",(props?props[PROPERTIES_ID.BORDERRADIUSPROPERTY]:"0") + 'px');
        this.setStyle("-moz-border-radius",(props?props[PROPERTIES_ID.BORDERRADIUSPROPERTY]:"0") + 'px');
        this.setStyle("border-radius",(props?props[PROPERTIES_ID.BORDERRADIUSPROPERTY]:"0") + 'px');                
        this.setStyle("border-width",(props?props[PROPERTIES_ID.BORDERWIDTHPROPERTY]:"1") + 'px');
        if (props)                
            this.dom.style.borderStyle = "none none none " + props[PROPERTIES_ID.BORDERPROPERTY];
        else
            this.dom.style.borderStyle = "none none none solid"; 

    }
}
