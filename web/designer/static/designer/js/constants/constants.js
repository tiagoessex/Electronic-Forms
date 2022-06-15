
export const PAGES_AREA_ID = 'form-pages';
export const TAB_AREA_ID = 'form-tab';


// VIEWS TABS IDs
export const VIEWS_TAB_ID = {
    FORM: 'form-view',
    LIST: 'list-view',
    GROUPS: 'groups-view',
    EA: 'ea-view',
}



/**
 * PROPERTIES' IDs
 */
export const PROPERTIES_ID = {
    PAGENUMBERPROPERTY : 'properties-page-number',
    SECTIONPROPERTY : 'properties-section',
    LISTHEADERPROPERTY : 'properties-list-header',
    
    IDPROPERTY : 'properties-id',
    NAMEPROPERTY : 'properties-name',
    LABELPROPERTY : 'properties-label',
    SHOWLABELPROPERTY : 'properties-show-label',
    DEFAULTPROPERTY : 'properties-default',
    ENABLEDPROPERTY : 'properties-enabled',
    CROSSEDPROPERTY : 'properties-crossed',
    PLACEHODLERPROPERTY : 'properties-placeholder',
    MAXLENGTHPROPERTY : 'properties-max-length',
    MAXPROPERTY: 'properties-max',
    MINPROPERTY: 'properties-min',
    STEPPROPERTY: 'properties-step',
    UPPERCASEPROPERTY : 'properties-uppercase',
    REQUIREDPROPERTY : 'properties-required',
    CHECKEDPROPERTY : 'properties-checked',
    ITEMSPROPERTY : 'properties-items',
    DATABASEPROPERTY : 'properties-database',
    GROUPPROPERTY : 'properties-group',
    PATTERNPROPERTY : 'properties-pattern',
    IMAGEURLPROPERTY : 'properties-image-url',
    
    VISIBLEPROPERTY : 'properties-visible',
    ZINDEXPROPERTY: 'properties-zindex',
    TOPPROPERTY : 'properties-top',
    LEFTPROPERTY : 'properties-left',
    WIDTHPROPERTY : 'properties-width',
    HEIGHTPROPERTY : 'properties-height',
    FONTPROPERTY : 'properties-font',
    FONTSIZEPROPERTY : 'properties-font-size',
    FONTSTYLEPROPERTY : 'properties-font-style',
    FONTDECORATIONPROPERTY : 'properties-font-decoration',
    FONTWEIGHTPROPERTY : 'properties-font-weight',
    HORIZONTALALIGNMENTPROPERTY : 'properties-horizontal-alignment',
    COLORPROPERTY : 'properties-color',
    BACKCOLORPROPERTY : 'properties-back-color',
    BACKALPHAPROPERTY : 'properties-back-alpha',
    BORDERBORDERSPROPERTY : 'properties-border-borders',
    BORDERPROPERTY : 'properties-border',
    BORDERWIDTHPROPERTY : 'properties-border-width',
    BORDERRADIUSPROPERTY : 'properties-border-radius',
    ROTATIONPROPERTY : 'properties-rotation',
}


/**
 * Id's of all fields in the properties sidebar, divided by groups.
 * This is to be used for visibility proposes.
 * NOTES: -UIPropertiesItem added in UIPropertiesItem.js
 */
export const PROPERTIES_GROUPS = {
    groups: [
        'P-Location',
        'P-Field',
        'P-Display'
    ],
    location: [
        'properties-page-number-UIPropertiesItem',
        'properties-section-UIPropertiesItem',
        'properties-list-header-UIPropertiesItem',
    ],
    field: [
        'properties-id-UIPropertiesItem',
        'properties-name-UIPropertiesItem',
        'properties-label-UIPropertiesItem',
        'properties-show-label-UIPropertiesItem',
        'properties-default-UIPropertiesItem',
        'properties-enabled-UIPropertiesItem',
        'properties-crossed-UIPropertiesItem',
        'properties-placeholder-UIPropertiesItem',
        'properties-max-length-UIPropertiesItem',
        'properties-max-UIPropertiesItem',
        'properties-min-UIPropertiesItem',
        'properties-step-UIPropertiesItem',
        'properties-uppercase-UIPropertiesItem',
        'properties-required-UIPropertiesItem',
        'properties-checked-UIPropertiesItem',
        'properties-items-UIPropertiesItem',
        'properties-database-UIPropertiesItem',
        'properties-group-UIPropertiesItem',
        'properties-pattern-UIPropertiesItem',
        'properties-image-url-UIPropertiesItem',
    ],
    display: [
        'properties-visible-UIPropertiesItem',
        'properties-zindex-UIPropertiesItem',
        'properties-top-UIPropertiesItem',
        'properties-left-UIPropertiesItem',
        'properties-width-UIPropertiesItem',
        'properties-height-UIPropertiesItem',
        'properties-font-UIPropertiesItem',
        'properties-font-size-UIPropertiesItem',
        'properties-font-style-UIPropertiesItem',
        'properties-font-decoration-UIPropertiesItem',
        'properties-font-weight-UIPropertiesItem',
        //'properties-font-alignment-UIPropertiesItem',
        'properties-horizontal-alignment-UIPropertiesItem',
        'properties-color-UIPropertiesItem',
        'properties-back-color-UIPropertiesItem',
        'properties-back-alpha-UIPropertiesItem',
        'properties-border-borders-UIPropertiesItem',
        'properties-border-UIPropertiesItem',
        'properties-border-width-UIPropertiesItem',        
        'properties-border-radius-UIPropertiesItem',
        'properties-rotation-UIPropertiesItem',
    ]
}
