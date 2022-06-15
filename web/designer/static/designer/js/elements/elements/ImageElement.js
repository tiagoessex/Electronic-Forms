
import { BaseElement } from './BaseElement.js';
import { ELEMENTS_TYPE } from '../constants.js';
import { PROPERTIES_ID } from '../../constants/constants.js';
import { Img } from '/static/js/ui/BuildingBlocks.js';

/**
 * Simple div with a background image.
 */
export class ImageElement extends BaseElement {
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
     * @param {string} image Url of the image.
     */      
    constructor(type=ELEMENTS_TYPE.NONE, props = null, parent=null, context=null, left, top, id, background=null, image) {
        super(type, props, parent, context, left, top, id, background);

        if (type !== ELEMENTS_TYPE.IMAGE) {
            this.setStyle("border",props?props[PROPERTIES_ID.BORDERPROPERTY]:"solid");
            this.setStyle("border-width",(props?props[PROPERTIES_ID.BORDERWIDTHPROPERTY]:"1") + 'px');
        }
        
       this.img = new Img(image).attachTo(this);
       this.img.setStyle("background-repeat","no-repeat");
       this.img.setStyle("background-position","center");
       this.img.setStyle('-webkit-background-size','cover');
       this.img.setStyle('-moz-background-size','cover');
       this.img.setStyle('-o-background-size','cover');
       this.img.setStyle('background-size','cover');
       this.img.setStyle('width','100%');
       this.img.setStyle('height','100%');
    }

    setImage(src) {
        this.img.dom.src = src;
    }
}
