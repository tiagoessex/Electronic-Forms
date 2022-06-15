
import { Card } from '../../ui/Card.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Action Card E/A.
 */
export class ActionCard extends Card {    
    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id ActionCard ID
     */
    constructor(context, id) {
        super(id, Translator.translate('Action'), 'bg-light','text-dark');
    }  
}
