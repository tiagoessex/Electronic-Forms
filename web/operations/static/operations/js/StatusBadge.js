

import { Badge } from '/static/js/ui/Badge.js';
import { STATUS } from '/static/js/status.js';


/**
 * Create the respective badge according to operation status.
 * @param {string} status Operation status: OPEN | CLOSED | ... . Check global status.js and Status table.
 * @returns Badge object.
 */
 export const StatusBadge = (status) => {
    if (status === STATUS.OPEN) return new Badge('primary',STATUS.OPEN,'p-2');
    if (status === STATUS.CLOSED) return new Badge('warning',STATUS.CLOSED,'p-2');
    if (status === STATUS.COMPLETED) return new Badge('dark',STATUS.COMPLETED,'p-2');
    return new Badge('danger',STATUS.ERROR,'p-2');
  }
  