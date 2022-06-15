
import { Div, Hx, Button, AwesomeIcon } from './BuildingBlocks.js';

/**
 * Adminlte collapsible card.
 */
export class ALteCollapsibleCard extends Div {

    /**
     * 
     * @param {*} title 
     * @param {*} id 
     * @param {*} onClose 
     * @param {string} header_style Bootstrap 4 background style: bg-light | bg-dark | ...
     */
    constructor(title, id = null, onClose=null, header_style = null) {
        super();
        this.addClass('card');
        if (id) {
            this.setId(id);
        }

        const header = new Div().attachTo(this);
        header.addClass('card-header');
        if (header_style) header.addClass(header_style);

        this.h3 = new Hx(3).attachTo(header);
        this.h3.addClass('card-title');
        this.h3.setTextContent(title);

        const buttons = new Div().attachTo(header);
        buttons.addClass("card-tools");

        new ButtonI('collapse','fas fa-minus').attachTo(buttons);

        const close_btn = new ButtonI('remove','fas fa-times').attachTo(buttons);
        if (onClose) {
            close_btn.dom.addEventListener('click', function() {
                onClose();
            })
        }            

        this.body = new Div().attachTo(this);
        this.body.addClass('card-body');

    }

    setTitle(title) {
        this.h3.setTextContent(title);
    }

    getBody() {
        return this.body;
    }
}


class ButtonI extends Button {
	constructor(widget_type, icon, settings) {
		super('', settings);
        this.addClass('btn btn-tool');
        this.setAttribute('type','button');
        this.setAttribute('data-card-widget', widget_type);
        new AwesomeIcon(icon).attachTo(this);
	}
}
