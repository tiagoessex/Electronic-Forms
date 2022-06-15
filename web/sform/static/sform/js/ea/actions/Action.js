
/**
 * Action base class.
 */
export class Action {
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Action ID.
     * @param {object} data Action object.
     */
    constructor(context, id) {
        //signals.onStuffDone.dispatch("new action [" + id + "] ready!");
    }

    execute() {
        //console.log("EXECUTE ACTION");
    }
}