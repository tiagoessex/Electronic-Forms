// EA CONSTANTS
export const EA_CLASS = 'EAClass';
export const PRE_EA_ID='ea-';
export const PRE_DEFAULT_EA_NAME ='E/A ';
export const ROW_EVENT_CLASS = 'ea-row-event';
export const ROW_ACTION_CLASS = 'ea-row-action';

export const EA_SELECTION_CLASS = 'EASelectionClass';
export const EA_VISIBILITY_CLASS = 'EAVisibilityClass';
export const EA_STATUS_CLASS = 'EAStatusClass';
export const EA_TEMPORAL_CLASS = 'EATemporalClass';
export const EA_DB_QUERY_CLASS = 'EADBQueryClass';
export const EA_TABLE_QUERY_CLASS = 'EATableQueryClass';
export const EA_APPEND_CLASS = 'EAAppendClass';
export const EA_FORMAT_CLASS = 'EAFormatClass';
export const EA_REQUIRED_CLASS = 'EARequiredClass';

export const PRE_ACTION_CARD_ID = 'actions-';
export const PRE_EVENT_CARD_ID = 'events-';

export const EA_SELECTOR_X = 'ea-selector-x';   // all selectors to be validated must have this class
export const EA_INPUT_X = 'ea-input-x';         // all inputs to be validated must have this class

export const EVENTS = {
    onChanged: 'onChanged',
    onCleared: 'onCleared',
    onFilled:'onFilled',
    onFormOpened: 'onFormOpened',           
    onSelected: 'onSelected',
    onUnSelected: 'onUnSelected',
}

// const ALL_TYPES = ['SECTION','GROUP','FORM','DBFIELD','TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','NUMBER','DROPDOWN','CHECKBOX','RADIO','DATE','TIME','PHOTO','BARCODE_TEXT','BARCODE_IMAGE','GPS_TEXT','GPS_MAP','SIGNATURE','DRAWING','USERIMAGE','TEXTLABEL','IMAGE','BOX','CIRCLE','HORIZONTALLINE','VERTICALLINE','PAGENUMBER','NUMBEROFPAGES']

export const EVENTS_ELEMENTS_ALLOWED = ['FORM','DBFIELD','TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','NUMBER','DROPDOWN','CHECKBOX','RADIO','DATE','TIME','PHOTO','BARCODE_TEXT','BARCODE_IMAGE','GPS_TEXT','GPS_MAP','SIGNATURE','DRAWING','USERIMAGE','FOODEX'];

// TODO: type -> name
export const EA_TYPE = {  
    APPEND: {
        name: 'APPEND',
        actions: {
            append: 'append',
        },
        elements_allowed: {
        //    events: ['FORM','DBFIELD','TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','NUMBER','DROPDOWN','CHECKBOX','RADIO','DATE','TIME','PHOTO','BARCODE_TEXT','BARCODE_IMAGE','GPS_TEXT','GPS_MAP','SIGNATURE','DRAWING','USERIMAGE'],//['ALL'],
            actions: ['TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','NUMBER','DROPDOWN','DATE','TIME','FOODEX'],
        },        
    },    
    SELECTION: {
       name: 'SELECTION',
       actions: {
            select: 'select',
            unselect: 'unselect',
        },
        elements_allowed: {
        //    events: ['FORM','DBFIELD','TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','NUMBER','DROPDOWN','CHECKBOX','RADIO','DATE','TIME','PHOTO','BARCODE_TEXT','BARCODE_IMAGE','GPS_TEXT','GPS_MAP','SIGNATURE','DRAWING','USERIMAGE'],//['ALL'],
            actions: ['CHECKBOX','RADIO'],
        },       
    },
    STATUS: {
       name: 'STATUS',
       actions: {
            cross: 'cross',
            uncross: 'uncross',
            disable: 'disable',
            enable: 'enable',
        },
        elements_not_allowed: {
        //    events: ['TEXTLABEL','IMAGE','BOX','CIRCLE','HORIZONTALLINE','VERTICALLINE','PAGENUMBER','NUMBEROFPAGES'],
            actions: ['FORM'],
        },        
    },
    VISIBILITY: {
       name: 'VISIBILITY',
       actions: {
            hide: 'hide',
            show: 'show',
        },
        elements_not_allowed: {
        //    events: ['TEXTLABEL','IMAGE','BOX','CIRCLE','HORIZONTALLINE','VERTICALLINE','PAGENUMBER','NUMBEROFPAGES'],
            actions: ['FORM'],
        }, 
    },    
    DBQUERY: {
        name: 'DBQUERY',
        actions: {
            query_db: 'query_db',
        },
        elements_not_allowed: {
        //    events: ['TEXTLABEL','IMAGE','BOX','CIRCLE','HORIZONTALLINE','VERTICALLINE','PAGENUMBER','NUMBEROFPAGES'],
            actions: ['FORM','SECTION','GROUP','TEXTLABEL','IMAGE','BOX','CIRCLE','HORIZONTALLINE','VERTICALLINE','PAGENUMBER','NUMBEROFPAGES','CHECKBOX','RADIO','TABLE','STATICTABLE'],
        },         
    },
    FORMAT: {
        name: 'FORMAT',
        actions: {
            uppercase: 'uppercase',
            lowercase: 'lowercase',
            firstletter: 'firstletter',
        },
        elements_allowed: {
        //    events: ['FORM','DBFIELD','TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','NUMBER','DROPDOWN','CHECKBOX','RADIO','DATE','TIME','PHOTO','BARCODE_TEXT','BARCODE_IMAGE','GPS_TEXT','GPS_MAP','SIGNATURE','DRAWING','USERIMAGE'],//['ALL'],
            actions: ['TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','FOODEX'],
        },       
    },      
    TABLEQUERY: {
        name: 'TABLEQUERY',
        actions: {
            query_table: 'query_table',
        },
        elements_allowed: {
        //    events: ['FORM','DBFIELD','TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','NUMBER','DROPDOWN','CHECKBOX','RADIO','DATE','TIME','PHOTO','BARCODE_TEXT','BARCODE_IMAGE','GPS_TEXT','GPS_MAP','SIGNATURE','DRAWING','USERIMAGE'],//['ALL'],
            actions: ['TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','DATE','TIME',"DROPDOWN",'FOODEX'],
        },
    },
    TEMPORAL: {
        name: 'TEMPORAL',
        actions: {
            now: 'now',
        },
        elements_allowed: {
        //    events: ['FORM','DBFIELD','TEXT','EMAIL','PHONE','WEBSITE','TEXTBOX','NUMBER','DROPDOWN','CHECKBOX','RADIO','DATE','TIME','PHOTO','BARCODE_TEXT','BARCODE_IMAGE','GPS_TEXT','GPS_MAP','SIGNATURE','DRAWING','USERIMAGE'],//['ALL'],
            actions: ['DATE','TIME'],
        },        
    },
    REQUIRED: {
        name: 'REQUIRED',
        actions: {
            required: 'required',
            not_required: 'not required',
        },
        elements_not_allowed: {
            actions: ['FORM','SECTION'],
        },         
    },      
}


export const LOGICAL_OPERATORS = {
    'and': "AND",
    'or': "OR",
}

export const OPERATORS = {
    EQUAL: 'EQUAL',
    GREATER: 'GREATER',
    LESSER: 'LESSER',
    NOT: 'NOT',
}