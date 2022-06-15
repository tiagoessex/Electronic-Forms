

import { Badge } from '/static/js/ui/Badge.js';
import { STATUS } from '/static/js/status.js';


/**
 * Creates the respective badge according to form status.
 * @param {string} status Form status: TEMPORARY | DISABLED | ... . Check global status.js and Status table.
 * @returns Badge object.
 */
 export const StatusBadge = (status) => {
    if (status === STATUS.TEMPORARY) return new Badge('danger',STATUS.TEMPORARY,'p-2');
    if (status === STATUS.DISABLED) return new Badge('dark',STATUS.DISABLED,'p-2');
    if (status === STATUS.IN_USE) return new Badge('success',STATUS.IN_USE,'p-2');
    if (status === STATUS.EDITABLE) return new Badge('primary',STATUS.EDITABLE,'p-2');
    return new Badge('danger',STATUS.ERROR,'p-2');
  }
  