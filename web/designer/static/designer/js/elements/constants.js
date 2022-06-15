// ELEMENT SELECTOR
export const ELEMENT = 'element';

// REPEATABLE ELEMENT
export const REPEATABLE_CLASS = 'element-repeatable';

// LOCKED ELEMENT (sync with styles.css)
export const LOCKED_CLASS = 'element-locked';

// DISABLED ELEMENT
export const DISABLED_CLASS = 'element-disabled'

// CROSSED ELEMENT
export const CROSSED_CLASS = 'element-crossed'

// TABLE ELEMENT
export const DEFAULT_TABLE_ELEMENT_ROW_HEIGHT = 20;
export const DEFAULT_TABLE_ELEMENT_WIDTH = 500;
export const DEFAULT_TABLE_ELEMENT_HEADER_HEIGHT = 24;
export const DEFAULT_TABLE_ELEMENT_N_COLS = 2;
export const DEFAULT_TABLE_ELEMENT_N_ROWS = 2;
export const DEFAULT_TABLE_ELEMENT_HEADER_ALIGNMENT = 'center';
export const DEFAULT_TABLE_ELEMENT_HEADER_FONT = 'Times';
export const DEFAULT_TABLE_ELEMENT_HEADER_FONT_SIZE = 16;
export const DEFAULT_TABLE_ELEMENT_HEADER_STYLE = 'normal';
export const DEFAULT_TABLE_ELEMENT_HEADER_WEIGHT = 'bold';
export const DEFAULT_TABLE_ELEMENT_HEADER_COLOR = "#000000";
export const DEFAULT_TABLE_ELEMENT_HEADER_BACK_COLOR = '#FFFFFF';
export const DEFAULT_TABLE_ELEMENT_COL_ALIGNMENT = 'center';
export const DEFAULT_TABLE_ELEMENT_COL_WIDTH = '50%';
export const DEFAULT_TABLE_ELEMENT_ROWS_FONT_SIZE = 16;

/**
 * ATT: KEY === NAME
 * dimensions => default size
 * visibility => visible properties
 * availability => identifies which managers/trackers tracks the element
 * transfer => transfer value to database/file/...
 * validations => [MAX-LENGTH, MAX, MIN, UPPERCASE, REQUIRED, PATTERN] -- check validations doc.
 */
 export const ELEMENTS_TYPE = {
    NONE : {
        name: "NONE",
        dimensions:{},
        visibility: {groups: 0xf, location: 0x0, field:0x0, display:0x0},
        availability: {form: false, list: false, groups: false, ea: false, transfer: false, repeatable: false, lv_header: false},
        validations: 0x0,
    },
    MULTIPLE : {
        name: "MULTIPLE",
        dimensions:{},
        //visibility: {groups: 0xf, location: 0xf, field:0x10020, display:0X01fc3},
        visibility: {groups: 0xf, location: 0xf, field:0x020060, display:0Xfffc3},
        availability: {form: false, list: false, groups: false, ea: false, transfer: false, repeatable: false, lv_header: false},
        validations: 0x0,
    },    
    ALL :  {
        name:"ALL",
        dimensions:{},
        visibility: {groups: 0xf, location: 0xf, field:0xfffff, display:0xfffff},
        availability: {form: false, list: false, groups: false, ea: false, transfer: false, repeatable: false, lv_header: false},
        validations: 0x0,
    },
    NOTIMPLEMENTED : {
        name: "NOTIMPLEMENTED",
        dimensions:{width: 256, height: 26},
        visibility: {groups: 0xf, location: 0x0, field:0x0, display:0x0},
        availability: {form: false, list: false, groups: false, ea: false, transfer: false, repeatable: false, lv_header: false},
        validations: 0x0,
    },
    SECTION : {
        name: "SECTION",
        dimensions:{width: 0, height: 0},
        visibility: {groups: 0x0, location: 0x0, field:0x0, display:0x0},
        availability: {form: false, list: false, groups: false, ea: true, transfer: false, repeatable: false, lv_header: false},
        validations: 0x0,
    },
    GROUP : {
        name: "GROUP",
        dimensions:{width: 0, height: 0},
        visibility: {groups: 0x0, location: 0x0, field:0x0, display:0x0},
        availability: {form: false, list: false, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x0,
    },  
    FORM : {
        name: "FORM",
        dimensions:{width: 0, height: 0},
        visibility: {groups: 0x0, location: 0x0, field:0x0, display:0x0},
        availability: {form: false, list: false, groups: false, ea: true, transfer: false, repeatable: false, lv_header: false},
        validations: 0x0,
    },          
    DBFIELD : {
        name:"DBFIELD",
        dimensions:{},
        visibility: {groups: 0xf, location: 0x3, field:0xfffff, display:0xfffff},
        availability: {form: false, list: false, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x0,
    },
    FOODEX : {
        name: "FOODEX",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x0531f7, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x27,
    },
    TEXT : {
        name: "TEXT",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x0531f7, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x27,
    },
    EMAIL : {
        name:"EMAIL",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x0531f7, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x27,
    },
    PHONE : {
        name:"PHONE",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x0531f7, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x27,
    },
    WEBSITE : {
        name:"WEBSITE",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x0531f7, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x27,
    },
    TEXTBOX : {
        name:"TEXTBOX",
        dimensions:{width: 150, height: 52},
        visibility: {groups: 0xf, location: 0x3, field:0x0131f7, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x26,
    },
    NUMBER : {
        name:"NUMBER",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x012ef7, display:0x7ffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x1B,
    },
    DROPDOWN : {
        name:"DROPDOWN",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x01a077, display:0xf77ff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },
    CHECKBOX : {
        name:"CHECKBOX",
        dimensions:{width: 26, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x02406f, display:0xf77ff},
        availability: {form: true, list: true, groups: true, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },
    RADIO : {
        name:"RADIO",
        dimensions:{width: 26, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x02406f, display:0xf77ff},
        availability: {form: true, list: true, groups: true, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },
    DATE : {
        name:"DATE",
        dimensions:{width: 128, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x012077, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x3,
    },
    TIME : {
        name:"TIME",
        dimensions:{width: 72, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x012077, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x3,
    },
    PHOTO : {
        name:"PHOTO",
        dimensions:{width: 150, height: 150},
        visibility:{groups: 0xf, location: 0x3, field:0x012077, display:0xf703f},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },
    BARCODE_TEXT : {
        name:"BARCODE_TEXT",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x0521f7, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x23,
    },
    BARCODE_IMAGE : {
        name:"BARCODE_IMAGE",
        dimensions:{width: 216, height: 150},
        visibility:{groups: 0xf, location: 0x3, field:0x012077, display:0xf703f},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },      
    GPS_TEXT : {
        name:"GPS_TEXT",
        dimensions:{width: 150, height: 26},
        visibility:{groups: 0xf, location: 0x3, field:0x0521f7, display:0xfffff},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x23,
    },
    GPS_MAP : {
        name:"GPS_MAP",
        dimensions:{width: 150, height: 150},
        visibility:{groups: 0xf, location: 0x3, field:0x012077, display:0xf703f},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },    
    SIGNATURE : {
        name:"SIGNATURE",
        dimensions:{width: 300, height: 88},
        visibility: {groups: 0xf, location: 0x3, field:0x012077, display:0xff03f},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },
    DRAWING : {
        name:"DRAWING",
        dimensions:{width: 150, height: 150},
        visibility: {groups: 0xf, location: 0x3, field:0x012077, display:0xf703f},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },
    USERIMAGE : {
        name:"USERIMAGE",
        dimensions:{width: 204, height: 150},
        visibility: {groups: 0xf, location: 0x3, field:0x012077, display:0xf703f},
        availability: {form: true, list: true, groups: false, ea: true, transfer: true, repeatable: false, lv_header: false},
        validations: 0x2,
    },
    TABLE : {
        name:"TABLE",
        dimensions:{
            width: DEFAULT_TABLE_ELEMENT_WIDTH, 
            height: DEFAULT_TABLE_ELEMENT_N_ROWS * DEFAULT_TABLE_ELEMENT_ROW_HEIGHT + DEFAULT_TABLE_ELEMENT_HEADER_HEIGHT
        },
        visibility: {groups: 0xf, location: 0x3, field:0x0067, display:0x00F},
        availability: {form: true, list: true, groups: false, ea: true, transfer: false, repeatable: false, lv_header: false},
        validations: 0x0,
    },  
    TEXTLABEL : {
        name:"TEXTLABEL",
        dimensions:{width: 85, height: 26},
        visibility: {groups: 0xf, location: 0xf, field:0x005, display:0xfffff},
        availability: {form: true, list: false, groups: false, ea: true, transfer: false, repeatable: true, lv_header: true},
        validations: 0x0,
    },
    IMAGE : {
        name:"IMAGE",
        dimensions:{width: 150, height: 150},
        visibility: {groups: 0xf, location: 0xf, field:0x080003, display:0xf703f},
        availability: {form: true, list: false, groups: false, ea: true, transfer: false, repeatable: true, lv_header: true},
        validations: 0x0,
    }, 
    BOX : {
        name:"BOX",
        dimensions:{width: 150, height: 150},
        visibility: {groups: 0xf, location: 0xf, field:0x000043, display:0xf703f},
        availability: {form: true, list: false, groups: false, ea: true, transfer: false, repeatable: true, lv_header: true},
        validations: 0x0,
    },
    CIRCLE : {
        name:"CIRCLE",
        dimensions:{width: 150, height: 150},
        visibility: {groups: 0xf, location: 0xf, field:0x000043, display:0xf703f},
        availability: {form: true, list: false, groups: false, ea: true, transfer: false, repeatable: true, lv_header: true},
        validations: 0x0,
    },
    HORIZONTALLINE : {
        name:"HORIZONTALLINE",
        dimensions:{width: 100, height: 16},
        visibility: {groups: 0xf, location: 0xf, field:0x000003, display:0x7101F},
        availability: {form: true, list: false, groups: false, ea: true, transfer: false, repeatable: true, lv_header: true},
        validations: 0x0,
    },
    VERTICALLINE : {
        name:"VERTICALLINE",
        dimensions:{width: 16, height: 100},
        visibility: {groups: 0xf, location: 0xf, field:0x000003, display:0x7102F},
        availability: {form: true, list: false, groups: false, ea: true, transfer: false, repeatable: true, lv_header: true},
        validations: 0x0,
    }, 
    STATICTABLE : {
        name:"STATICTABLE",
        dimensions:{
            width: DEFAULT_TABLE_ELEMENT_WIDTH, 
            height: DEFAULT_TABLE_ELEMENT_N_ROWS * DEFAULT_TABLE_ELEMENT_ROW_HEIGHT + DEFAULT_TABLE_ELEMENT_HEADER_HEIGHT
        },
        visibility: {groups: 0xf, location: 0xf, field:0x000003, display:0x00F},
        availability: {form: true, list: false, groups: false, ea: true, transfer: false, repeatable: true, lv_header: true},
        validations: 0x0,
    },            
    PAGENUMBER : {
        name:"PAGENUMBER",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x000003, display:0x7ffff},
        availability: {form: true, list: false, groups: false, ea: false, transfer: false, repeatable: true, lv_header: false},
        validations: 0x0,
    },
    NUMBEROFPAGES : {
        name:"NUMBEROFPAGES",
        dimensions:{width: 150, height: 26},
        visibility: {groups: 0xf, location: 0x3, field:0x000003, display:0x7ffff},
        availability: {form: true, list: false, groups: false, ea: false, transfer: false, repeatable: true, lv_header: false},
        validations: 0x0,
    },
}

