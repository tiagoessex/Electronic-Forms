import { Div, ButtonAndAwesomeIcon, Text } from '/static/js/ui/BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Collapsible Card - 2 buttons: close and collapse/show.
 * It's required since, this app, doesn't use the adminlte template.
 */
export class CollapsibleCard extends Div { 

    /**
     * Constructor.
     * @param {string} id ID
     * @param {string} cardclass Some class.
     */
    constructor(id, cardclass) {
        super({classes:['card','shadow','m-2','bg-white','rounded',cardclass]});
        this.id = id;
        const BODY_COLLAPSE_ID = "CollapsibleCard-" + id;

        this.setId(id)

        this.header = new Div({classes:['card-header','font-weight-bold','bg-warning']}).attachTo(this);
        this.title = new Text(Translator.translate('No title defined')).attachTo(this.header);

        this.close_btn = new ButtonAndAwesomeIcon('','fa fa-times',{classes:['float-right','btn','btn-danger']}).attachTo(this.header);

        this.collapse_btn = new ButtonAndAwesomeIcon('','fa fa-chevron-down', {classes:['float-right','btn','btn-primary','mr-1']}).attachTo(this.header);
        this.collapse_btn.setAttribute('type','button');
        this.collapse_btn.setAttribute('data-toggle','collapse');
        this.collapse_btn.setAttribute('data-target','#' + BODY_COLLAPSE_ID);
        this.collapse_btn.setAttribute('aria-expanded','true');
        this.collapse_btn.setAttribute('aria-controls', BODY_COLLAPSE_ID);


        this.body_collapse = new Div({classes:['collapse','show']}).attachTo(this);
        this.body_collapse.setAttribute('aria-labelledby', BODY_COLLAPSE_ID);
        this.body_collapse.setId(BODY_COLLAPSE_ID)

        this.body = new Div().attachTo(this.body_collapse);
        this.body.addClass('card-body');
    }

    /**
     * Sets the card title.
     * @param {string} title Card title.
     */
    setTitle(title) {
        this.title.setTextContent(title);
    }

    /**
     * Expands the card.
     */
    expand() {
        $(this.body_collapse.dom).collapse('show');
    }
    
    /**
     * Collapses the card.
     */    
    collapse() {
        $(this.body_collapse.dom).collapse('hide');
    }  
}