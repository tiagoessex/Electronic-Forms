
// max values to list in a select
// used to set a maximum items to display table column values and database table column values
// it's not an hard limit, it's only used to trigger a warning message
export const MAX_SELECT_VALUES = 24;

// distances (px) and limits for check/radio from db
// grid formed by radios/checkboxes created from database fields
export const DELTA_C_R_X = 180; // distance between columns
export const DELTA_C_R_Y = 40;  // distance between rows
export const MAX_Y_C_R = 8;     // number of items per column