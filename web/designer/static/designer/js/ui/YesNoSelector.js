import { Select } from '/static/js/ui/BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Yes/No selector.
 */
export class YesNoSelector extends Select {

    /**
     * Construtor.
     * @param {Context} context Context.
     */
    constructor(context) {
        super({classes:['form-control']});

        this.context = context;
        
        const yes_option = document.createElement('option');        
        yes_option.setAttribute('value', 'yes');
        yes_option.innerHTML =Translator.translate('Yes');
        this.dom.appendChild(yes_option);
        const no_option = document.createElement('option');        
        no_option.setAttribute('value', 'no');
        no_option.setAttribute('selected', '');
        no_option.innerHTML = Translator.translate('No');
        this.dom.appendChild(no_option);
       
        this.dom.addEventListener('change', function(e) {
            context.signals.onChange.dispatch();
        })        

    }  

}
