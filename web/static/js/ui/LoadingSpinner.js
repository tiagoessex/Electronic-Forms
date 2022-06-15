
import { Div, AwesomeIcon } from './BuildingBlocks.js';

/**
 * Adminlte based loading spinner.
 * Adminlte overlay and spinners are only for some elements, like cards this is for any
 * 
 * Style: css/spinners.css 
 * 
 * 			<div id="some-id" class="risk-spinner-overlay">
 *             	<i class="fa fa-sync-alt fa-spin" aria-hidden="true"></i>
 *          </div>
 */
export class LoadingSpinner extends Div {

    /**
     * Constructor.
     * @param {string} id Spinner id.
     */
    constructor(id = null) {
        super();

        this.id = id;
        if (!id) {
            this.id = uuidv4();
        }

        this.setId(this.id);
        this.addClass('risk-spinner-overlay');

        const icon = new AwesomeIcon('fa fa-sync-alt fa-spin').attachTo(this);
        icon.setAttribute('aria-hidden','true');
    }

    /**
     * Get the ID.
     * @returns Spinner ID.
     */
    getID() {
        return this.id;
    }

    /**
     * Show spinner.
     */
    show() {
        $(this.dom).show();
    }

    /**
     * Hide spinner.
     */
    hide() {
        $(this.dom).hide();
    }    
}
