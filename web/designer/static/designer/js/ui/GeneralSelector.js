import { Select } from '/static/js/ui/BuildingBlocks.js';

/**
 * General selector.
 */
export class GeneralSelector extends Select {


    /**
     * Construtor.
     * @param {Context} context Context.
     * @param {function} onSelect Called when new selection.
     * @param {array of objects} options [{value,text}, ...]
     * @param {any} selected Selected option.
     */
    constructor(context=null, onSelect=null, options=[], selected='') {
        super();

        options.forEach(option => {
            const op = document.createElement('option');        
            op.setAttribute('value', option.value);
            op.innerHTML = option.text;
            this.dom.appendChild(op);
        });
        options.value = selected;
       
        this.dom.addEventListener('change', function(e) {
            if (onSelect) onSelect(e.target.value);
            if (context) context.signals.onChange.dispatch();
        })        

    }  

}
