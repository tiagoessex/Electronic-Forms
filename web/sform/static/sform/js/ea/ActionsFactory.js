import { AppendAction } from './actions/AppendAction.js';
import { FormatAction } from './actions/FormatAction.js';
import { DBQueryAction } from './actions/DBQueryAction.js';
import { TableQueryAction } from './actions/TableQueryAction.js';
import { TemporalAction } from './actions/TemporalAction.js';
import { SelectionAction } from './actions/SelectionAction.js';
import { VisibilityAction } from './actions/VisibilityAction.js';
import { StatusAction } from './actions/StatusAction.js';
import { RequiredAction } from './actions/RequiredAction.js';
import { EA_TYPE } from '/static/designer/js/ea/constants.js';

/**
 * Action Factory Class.
 * Technically it should be an EA factory, but since ultimately actions are the ones that 
 * determines the EA type ...
 */
export function ActionsFactory(context, ea_type, ea_id, actions_data) {
    let action = null;
    switch (ea_type) {
        case EA_TYPE.APPEND.name:
            action = new AppendAction(context, ea_id, actions_data)
            break;
        case EA_TYPE.SELECTION.name:
            action = new SelectionAction(context, ea_id, actions_data)
            break;
        case EA_TYPE.VISIBILITY.name:
            action = new VisibilityAction(context, ea_id, actions_data)
            break;
        case EA_TYPE.STATUS.name:
            action = new StatusAction(context, ea_id, actions_data)
            break;
        case EA_TYPE.FORMAT.name:
            action = new FormatAction(context, ea_id, actions_data)
            break;  
        case EA_TYPE.DBQUERY.name:
            action = new DBQueryAction(context, ea_id, actions_data)
            break;
        case EA_TYPE.TABLEQUERY.name:
            action = new TableQueryAction(context, ea_id, actions_data)
            break;
        case EA_TYPE.TEMPORAL.name:
            action = new TemporalAction(context, ea_id, actions_data)
            break;
        case EA_TYPE.REQUIRED.name:
            action = new RequiredAction(context, ea_id, actions_data)
            break;             
        default:
            console.error("[EASystem::process] - No action [" + ea_type + "]!");
    }
    return action;
}