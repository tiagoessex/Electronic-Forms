import { HEXtoRGBA, getColors, RGBAtoHEX } from '/static/js/jscolor.js';
import { DEFAULT_FONT_SIZE } from './constants/dimensions.js';
import { ELEMENTS_TYPE } from './elements/constants.js';
import { PROPERTIES_ID } from './constants/constants.js';


 /**
 * A property was manually changed:
 *      - change the visual aspect (css) of the selected element(s)
 *      - change the props values, when necessary
 * If more than 1 element selected => only able to change a few props:
 *      - SECTIONPROPERTY
 *      - LISTHEADERPROPERTY
 *      - ENABLEDPROPERTY
 *      - CROSSEDPROPERTY
 *      - GROUPPROPERTY
 *      - VISIBLEPROPERTY
 *      - ZINDEXPROPERTY
 *      - FONTPROPERTY
 *      - FONTSIZEPROPERTY
 *      - FONTSTYLEPROPERTY
 *      - FONTDECORATIONPROPERTY
 *      - FONTWEIGHTPROPERTY
 *      - HORIZONTALALIGNMENTPROPERTY
*       - COLORPROPERTY
 *      - BACKCOLORPROPERTY
 *      - BACKALPHAPROPERTY
 *      - BORDERBORDERSPROPERTY
 *      - BORDERPROPERTY
 *      - BORDERWIDTHPROPERTY
 *      - BORDERRADIUSPROPERTY
 *      - ROTATIONPROPERTY
 * 
 * Repeatable elements props replication:
 *      - NAMEPROPERTY
 *      - LABELPROPERTY
 *      - VISIBLEPROPERTY
 *      - ZINDEXPROPERTY
 *      - TOPPROPERTY
 *      - LEFTPROPERTY
 *      - WIDTHPROPERTY
 *      - HEIGHTPROPERTY
 *      - FONTPROPERTY
 *      - FONTSIZEPROPERTY
 *      - FONTSTYLEPROPERTY
 *      - FONTDECORATIONPROPERTY
 *      - FONTWEIGHTPROPERTY
 *      - HORIZONTALALIGNMENTPROPERTY
 *      - COLORPROPERTY
 *      - BACKCOLORPROPERTY
 *      - BACKALPHAPROPERTY
 *      - BORDERBORDERSPROPERTY
 *      - BORDERPROPERTY
 *      - BORDERWIDTHPROPERTY
 *      - BORDERRADIUSPROPERTY
 *      - ROTATIONPROPERTY
 * 
 * 
 * @param {Context} context Context.
 * @param {string} id Id of the property.
 * @param {any} value New property value
 * @param {array of Elements} selected_elements Currently selected Elements.
 */
export function PropertyTabActions (context, id, value, selected_elements) {
        switch (id) {
            case PROPERTIES_ID.SECTIONPROPERTY: 
                selected_elements.forEach(element => {
                    if (!element.type.availability.list) {
                        element['props'][PROPERTIES_ID.SECTIONPROPERTY] = value;
                    } else {
                        context.signals.onElementSectionChanged.dispatch(element.dom.id,value);
                    }
                })                
                break;
            case PROPERTIES_ID.LISTHEADERPROPERTY: 
                selected_elements.forEach(element => {
                    if (element.type.availability.lv_header) {
                        element['props'][PROPERTIES_ID.LISTHEADERPROPERTY] = value;
                    }
                })                
                break;                
            case PROPERTIES_ID.NAMEPROPERTY:
                if (!selected_elements[0]) return;
                if (selected_elements[0].isRepeatable()) {
                    const chain = context.repeatables_manager.getChain(selected_elements[0].dom.id);                    
                    chain.forEach(element_id => {
                        const element = context.elements_manager.getElement(element_id);                        
                        _nameProp(context, element, value);
                    })
                } else {
                    _nameProp(context, selected_elements[0], value);
                }
                
                break;    
            case PROPERTIES_ID.LABELPROPERTY:                
                if (!selected_elements[0]) return;
                if (selected_elements[0].isRepeatable()) {
                    const chain = context.repeatables_manager.getChain(selected_elements[0].dom.id);                    
                    chain.forEach(element_id => {
                        const element = context.elements_manager.getElement(element_id);                        
                        _labelProp(context, element, value);
                    })
                } else {
                    _labelProp(context, selected_elements[0], value);
                }

                break;
            case PROPERTIES_ID.SHOWLABELPROPERTY:
                if (!selected_elements[0]) return;
                if (value === 'no') {                 
                    selected_elements[0].setLabel('');
                } else {
                    const label3 = $('#'+PROPERTIES_ID.LABELPROPERTY).val();
                    if (label3 === '') {
                        label3 = selected_elements[0].dom.id;                        
                    }
                    selected_elements[0].setLabel(label);
                }
                break;
            case PROPERTIES_ID.ENABLEDPROPERTY:
                selected_elements.forEach(element => {
                    element.props[PROPERTIES_ID.ENABLEDPROPERTY] = value;
                    value === 'yes'?element.setDisabled(false):element.setDisabled(true);
                });
                break;
            case PROPERTIES_ID.CROSSEDPROPERTY:
                selected_elements.forEach(element => {
                    element.props[PROPERTIES_ID.CROSSEDPROPERTY] = value;
                    value === 'yes'?element.setCrossed(true):element.setCrossed(false);
                });
                break;                  
            case PROPERTIES_ID.GROUPPROPERTY:
                selected_elements.forEach(element => {
                    if (element.type.availability.groups) {
                        context.signals.onElementGroupChanged.dispatch(element,value);
                    }
                });
                break;
            case PROPERTIES_ID.VISIBLEPROPERTY:
                selected_elements.forEach(element => {
                    _visibleProp(context, element, value);
                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _visibleProp(context, _element, value);
                        })
                    }
                    // ----------------------
                });
                break;                 
            case PROPERTIES_ID.ZINDEXPROPERTY:
                selected_elements.forEach(element => {
                    _zIndexProp(context, element, value);
                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _zIndexProp(context, _element, value);
                        })
                    }
                    // ----------------------                    
                });
                break;             
            case PROPERTIES_ID.TOPPROPERTY:
                if (!selected_elements[0]) return;
                selected_elements[0].dom.style.top = value;
                // ----------------------
                if (selected_elements[0].isRepeatable()) {
                    const chain = context.repeatables_manager.getChain(selected_elements[0].dom.id);                    
                    chain.forEach(element_id => {
                        if (element_id === selected_elements[0].dom.id) return false;
                        const _element = context.elements_manager.getElement(element_id);
                        _element.dom.style.top = value;
                        _element.props[PROPERTIES_ID.TOPPROPERTY] = value;
                    })
                }
                // ----------------------                 
                break;
            case PROPERTIES_ID.LEFTPROPERTY:
                if (!selected_elements[0]) return;
                selected_elements[0].dom.style.left = value;
                // ----------------------
                if (selected_elements[0].isRepeatable()) {
                    const chain = context.repeatables_manager.getChain(selected_elements[0].dom.id);                    
                    chain.forEach(element_id => {
                        if (element_id === selected_elements[0].dom.id) return false;
                        const _element = context.elements_manager.getElement(element_id);
                        _element.dom.style.left = value;
                        _element.props[PROPERTIES_ID.LEFTPROPERTY] = value;
                    })
                }
                // ----------------------                  
                break;
            case PROPERTIES_ID.WIDTHPROPERTY:
                _widthProp(context, selected_elements[0], value);

                // ----------------------
                if (selected_elements[0].isRepeatable()) {
                    const chain = context.repeatables_manager.getChain(selected_elements[0].dom.id);                    
                    chain.forEach(element_id => {
                        if (element_id === selected_elements[0].dom.id) return false;
                        const _element = context.elements_manager.getElement(element_id);
                        _widthProp(context, _element, value);
                        _element.props[PROPERTIES_ID.WIDTHPROPERTY] = value;
                    })
                }
                // ----------------------

                break;
            case PROPERTIES_ID.HEIGHTPROPERTY:
                _heightProp(context, selected_elements[0], value);

                // ----------------------
                if (selected_elements[0].isRepeatable()) {
                    const chain = context.repeatables_manager.getChain(selected_elements[0].dom.id);                    
                    chain.forEach(element_id => {
                        if (element_id === selected_elements[0].dom.id) return false;
                        const _element = context.elements_manager.getElement(element_id);
                        _heightProp(context, _element, value);
                        _element.props[PROPERTIES_ID.HEIGHTPROPERTY] = value;
                    })
                }
                // ----------------------  

                break;
            case PROPERTIES_ID.FONTPROPERTY:
                selected_elements.forEach(element => {
                    _fontFamilyProp(context, element, value);

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _fontFamilyProp(context, _element, value);
                        })
                    }
                    // ----------------------                      
                });
                break;                
            case PROPERTIES_ID.FONTSIZEPROPERTY:
                selected_elements.forEach(element => {
                    _fontSizeProp(context, element, value);

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _fontSizeProp(context, _element, value);
                        })
                    }
                    // ----------------------
                });
                break;            
            case PROPERTIES_ID.FONTSTYLEPROPERTY:
                selected_elements.forEach(element => {
                    _fontStyleProp(context, element, value);

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _fontStyleProp(context, _element, value);
                        })
                    }
                    // ----------------------   

                });
                break;
            case PROPERTIES_ID.FONTDECORATIONPROPERTY:
                selected_elements.forEach(element => {
                    _fontDecorationProp(context, element, value);

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _fontDecorationProp(context, _element, value);
                        })
                    }
                    // ---------------------- 
                });               
                break;                
            case PROPERTIES_ID.FONTWEIGHTPROPERTY:
                selected_elements.forEach(element => {
                    _fontWeightProp(context, element, value);

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _fontWeightProp(context, _element, value);
                        })
                    }
                    // ----------------------                     
                });
                break;
            case PROPERTIES_ID.HORIZONTALALIGNMENTPROPERTY:
                selected_elements.forEach(element => {
                    _horizontalAlignmentProp(context, element, value);

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _horizontalAlignmentProp(context, _element, value);
                        })
                    }
                    // ----------------------                      
                });                
                break;    
            case PROPERTIES_ID.COLORPROPERTY:
                selected_elements.forEach(element => {
                    element.dom.style.color = value;

                    element.props[PROPERTIES_ID.COLORPROPERTY] = value;

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _element.dom.style.color = value;
                            _element.props[PROPERTIES_ID.COLORPROPERTY] = value;
                        })
                    }
                    // ---------------------- 

                });
                break;
            case PROPERTIES_ID.BACKCOLORPROPERTY:
                selected_elements.forEach(element => {

                    const alpha = getColors(element.getBgColor())[3];
                    element.dom.style.backgroundColor = HEXtoRGBA(value, alpha);
                    element.setBgColor(HEXtoRGBA(value, alpha));

                    element.props[PROPERTIES_ID.BACKCOLORPROPERTY] = value;

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _element.dom.style.backgroundColor = HEXtoRGBA(value, alpha);
                            _element.setBgColor(HEXtoRGBA(value, alpha));
                            _element.props[PROPERTIES_ID.BACKCOLORPROPERTY] = value;
                        })
                    }
                    // ----------------------  
                });
                break;
            case PROPERTIES_ID.BACKALPHAPROPERTY:
                selected_elements.forEach(element => {

                    const color_real = HEXtoRGBA(RGBAtoHEX(element.getBgColor()), value);
                    const color_selected = HEXtoRGBA(RGBAtoHEX(element.dom.style.backgroundColor), value);
                    element.dom.style.backgroundColor = color_selected
                    element.setBgColor(color_real);

                    element.props[PROPERTIES_ID.BACKALPHAPROPERTY] = value;

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _element.dom.style.backgroundColor = color_selected
                            _element.setBgColor(color_real);
                            _element.props[PROPERTIES_ID.BACKALPHAPROPERTY] = value;
                        })
                    }
                    // ----------------------  

                });

                break;
            case PROPERTIES_ID.BORDERBORDERSPROPERTY:

                selected_elements.forEach(element => {

                    const border = element.props[PROPERTIES_ID.BORDERPROPERTY];
                    //const border = $('#'+PROPERTIES_ID.BORDERPROPERTY).val();
                    switch (value) {
                        case 'top': element.dom.style.borderStyle = 'none'; element.dom.style.borderTop = border; break;
                        case 'bottom': element.dom.style.borderStyle = 'none'; element.dom.style.borderBottom = border; break;
                        case 'left': element.dom.style.borderStyle = 'none'; element.dom.style.borderLeft = border; break;
                        case 'right': element.dom.style.borderStyle = 'none'; element.dom.style.borderRight = border; break;
                        default:
                            element.dom.style.borderStyle = border;
                    }
                    element.dom.style.borderWidth = element.props[PROPERTIES_ID.BORDERWIDTHPROPERTY];

                    element.props[PROPERTIES_ID.BORDERBORDERSPROPERTY] = value;

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            switch (value) {
                                case 'top': _element.dom.style.borderStyle = 'none'; _element.dom.style.borderTop = value; break;
                                case 'bottom': _element.dom.style.borderStyle = 'none'; _element.dom.style.borderBottom = value; break;
                                case 'left': _element.dom.style.borderStyle = 'none'; _element.dom.style.borderLeft = value; break;
                                case 'right': _element.dom.style.borderStyle = 'none'; _element.dom.style.borderRight = value; break;
                                default:
                                    _element.dom.style.borderStyle = border;
                            }
                            _element.dom.style.borderWidth = selected_elements[0].props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
                            _element.props[PROPERTIES_ID.BORDERBORDERSPROPERTY] = value;
                        })
                    }
                    // ----------------------  
                });

                break;                
            case PROPERTIES_ID.BORDERPROPERTY:
                selected_elements.forEach(element => {

                    switch (element.props[PROPERTIES_ID.BORDERBORDERSPROPERTY]) {
                        case 'top': element.dom.style.borderStyle = 'none'; element.dom.style.borderTop = value; break;
                        case 'bottom': element.dom.style.borderStyle = 'none'; element.dom.style.borderBottom = value; break;
                        case 'left': element.dom.style.borderStyle = 'none'; element.dom.style.borderLeft = value; break;
                        case 'right': element.dom.style.borderStyle = 'none'; element.dom.style.borderRight = value; break;
                        default:
                            element.dom.style.borderStyle = value;
                    }
                    element.dom.style.borderWidth = element.props[PROPERTIES_ID.BORDERWIDTHPROPERTY];

                    element.props[PROPERTIES_ID.BORDERPROPERTY] = value;

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            switch (element.props[PROPERTIES_ID.BORDERBORDERSPROPERTY]) {
                                case 'top': _element.dom.style.borderStyle = 'none'; _element.dom.style.borderTop = value; break;
                                case 'bottom': _element.dom.style.borderStyle = 'none'; _element.dom.style.borderBottom = value; break;
                                case 'left': _element.dom.style.borderStyle = 'none'; _element.dom.style.borderLeft = value; break;
                                case 'right': _element.dom.style.borderStyle = 'none'; _element.dom.style.borderRight = value; break;
                                default:
                                    _element.dom.style.borderStyle = value;
                            }                        
                            _element.dom.style.borderWidth = element.props[PROPERTIES_ID.BORDERWIDTHPROPERTY];
                            _element.props[PROPERTIES_ID.BORDERPROPERTY] = value;
                        })
                    }
                    // ----------------------  

                });

                break;
            case PROPERTIES_ID.BORDERWIDTHPROPERTY:

                selected_elements.forEach(element => {

                    element.dom.style.borderWidth = value;

                    element.props[PROPERTIES_ID.BORDERWIDTHPROPERTY] = value;

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _element.dom.style.borderWidth = value;
                            _element.props[PROPERTIES_ID.BORDERWIDTHPROPERTY] = value;
                        })
                    }
                    // ----------------------      
                });

                break;
            case PROPERTIES_ID.BORDERRADIUSPROPERTY:
                const border_value = value + 'px';

                selected_elements.forEach(element => {

                    element.dom.style.borderRadius = border_value; // standard
                    element.dom.style.MozBorderRadius = border_value; // Mozilla
                    element.dom.style.WebkitBorderRadius = border_value; // WebKit

                    element.props[PROPERTIES_ID.BORDERRADIUSPROPERTY] = value;

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _element.dom.style.borderRadius = border_value; // standard
                            _element.dom.style.MozBorderRadius = border_value; // Mozilla
                            _element.dom.style.WebkitBorderRadius = border_value; // WebKit
                            _element.props[PROPERTIES_ID.BORDERRADIUSPROPERTY] = value;
                        })
                    }
                    // ---------------------- 
                });
                
                break;
            case PROPERTIES_ID.ROTATIONPROPERTY:
                selected_elements.forEach(element => {

                    element.dom.style.transform = 'rotate(' + value + 'deg)';
                    element.dom.style.msTransform = 'rotate(' + value + 'deg)';

                    element.props[PROPERTIES_ID.ROTATIONPROPERTY] = value;

                    // ----------------------
                    if (element.isRepeatable()) {
                        const chain = context.repeatables_manager.getChain(element.dom.id);                    
                        chain.forEach(element_id => {
                            if (element_id === element.dom.id) return false;
                            const _element = context.elements_manager.getElement(element_id);
                            _element.dom.style.transform = 'rotate(' + value + 'deg)';
                            _element.dom.style.msTransform = 'rotate(' + value + 'deg)';
                            _element.props[PROPERTIES_ID.ROTATIONPROPERTY] = value;
                        })
                    }
                    // ----------------------

                });

                break;
            default:
                console.warn("[main->onPropertyChange] No case with id [" + id + "]");
        }

}

//  ------------------------
//  HELPER FUNCTIONS (DRY)
//  ------------------------

/**
 * 
 * @param {*} context 
 * @param {*} element 
 * @param {*} value 
 */
function _nameProp(context, element, value) {
    let _value = value;

    if (value === '' && ![
            ELEMENTS_TYPE.CHECKBOX.name, 
            ELEMENTS_TYPE.RADIO.name, 
            ELEMENTS_TYPE.PHOTO.name, 
            ELEMENTS_TYPE.GPS_MAP.name, 
            ELEMENTS_TYPE.SIGNATURE.name, 
            ELEMENTS_TYPE.DRAWING.name, 
            ELEMENTS_TYPE.USERIMAGE.name, 
            ELEMENTS_TYPE.IMAGE.name, 
            ELEMENTS_TYPE.BARCODE_IMAGE.name, 
            ELEMENTS_TYPE.VERTICALLINE.name, 
            ELEMENTS_TYPE.HORIZONTALLINE.name, 
            ELEMENTS_TYPE.BOX.name, 
            ELEMENTS_TYPE.CIRCLE.name, 
            ELEMENTS_TYPE.STATICTABLE.name, 
            ELEMENTS_TYPE.TABLE.name
        ].includes(element.type.name)) {
        _value = element.props[PROPERTIES_ID.IDPROPERTY];
        element.setText(_value);
    }
    else if (element.type !== ELEMENTS_TYPE.CHECKBOX &&
        element.type !== ELEMENTS_TYPE.RADIO &&
        element.type !== ELEMENTS_TYPE.TEXTLABEL &&  
        //element.type !== ELEMENTS_TYPE.TABLE &&
        value !== '') {
            element.setText(value); 
    } else {
        element.setText(value);
    }
    
    context.signals.onElementRenamed.dispatch(element, _value);
}

function _labelProp(context, element, value) {
    if (element.type.name == ELEMENTS_TYPE.TEXTLABEL.name) {
        if (value === '') {
            element.setText(element.props[PROPERTIES_ID.IDPROPERTY]);
        } else {
            element.setText(value);
        }
    }
    if ($('#'+PROPERTIES_ID.SHOWLABELPROPERTY).val() === 'yes' && element.type.availability.groups) {
        element.setLabel(value);
    }
    if (value === '') {
        if (element.type.availability.groups) {
            element.setLabel(element.dom.id);
        }
    }
    context.signals.onElementLabelChanged.dispatch(element,value);
}

function _visibleProp(context, element, value) {
    element.props[PROPERTIES_ID.VISIBLEPROPERTY] = value;
}

function _zIndexProp(context, element, value) {
    element.dom.style.zIndex = value;
    element.props[PROPERTIES_ID.ZINDEXPROPERTY] = value;
}

function _widthProp(context, element, value) {
    element.dom.style.width = value;
    // update label x position
    if (element.type.availability.groups) {
        element.getLabel().dom.style.left = (parseInt(element.dom.style.width) + 4) + 'px';
    }
}

function _heightProp(context, element, value) {
    element.dom.style.height = value;
    // update label y position
    if (element.type.availability.groups) {
        let font_size = parseInt(element.dom.style.fontSize);
        if (font_size !== font_size)    // check if nan
            font_size = DEFAULT_FONT_SIZE;
            element.getLabel().dom.style.top = (parseInt(element.dom.style.height) / 2 - font_size) + 'px';
    }
}

function _fontFamilyProp(context, element, value) {
    element.dom.style.fontFamily = value;
    element.props[PROPERTIES_ID.FONTPROPERTY] = value;
}


function _fontSizeProp(context, element, value) {
    element.dom.style.fontSize = value + 'px'; 

    // update label y position for checkboxes and radios
    if (element.type.availability.groups) {
        let font_size = parseInt(element.dom.style.fontSize);
        if (font_size !== font_size) {   // check if nan
            font_size = DEFAULT_FONT_SIZE;
        }
        element.getLabel().dom.style.top = (parseInt(element.dom.style.height) / 2 - font_size) + 'px';
    }
    element.props[PROPERTIES_ID.FONTSIZEPROPERTY] = value;
}

function _fontStyleProp(context, element, value) {
    element.dom.style.fontStyle = value;
    element.props[PROPERTIES_ID.FONTSTYLEPROPERTY] = value;
}

function _fontDecorationProp(context, element, value) {
    if (element.type.availability.groups) {
        element.getLabel().dom.style.textDecoration = value;
    } else {
        element.dom.style.textDecoration = value;
    }
    element.props[PROPERTIES_ID.FONTDECORATIONPROPERTY] = value;
}

function _fontWeightProp(context, element, value) {
    element.dom.style.fontWeight = value;
    element.props[PROPERTIES_ID.FONTWEIGHTPROPERTY] = value;
}

function _horizontalAlignmentProp(context, element, value) {
    element.dom.style.textAlign = value;
    element.props[PROPERTIES_ID.HORIZONTALALIGNMENTPROPERTY] = value;
}