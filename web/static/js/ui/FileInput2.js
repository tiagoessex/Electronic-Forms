
import { Input, Form, Label } from './BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Bootstrap 4 custom file input.
 */
export class FileInput2 extends Form {
    /**
     * 
     * @param {string} id ID.
     * @param {string} name Name.
     * @param {function} onSelect On file selected, call function.
     * @param {boolean} clear If true, after selection clear file name.
     * @param {string} label Button text.
     * @param {string} color_scheme Botostrap 4 color scheme: primary | success | ...
     */
     constructor(id, name, onSelect = null, clear = true, button_label=Translator.translate('Select file ...'), color_scheme='primary', full=false) {
        super();
        this.onSelect = onSelect;        
        const self = this;

        this.setAttribute('name', 'form');
        this.setAttribute('enctype', 'multipart/form-data');

        const label = new Label(button_label).attachTo(this);
        label.setAttribute('for',id);
        label.addClass('btn btn-outline-' + color_scheme);
        if (full) {
            label.addClass('w-100 align-middle pt-3');
            label.setStyle('height','100%');
        }


        this.input = new Input().attachTo(this);
        this.input.setAttribute('type','file');
        this.input.setAttribute('name', name);
        this.input.setStyle('display','none');
        this.input.setId(id);
        
        this.input.dom.addEventListener('change', (ev) => {
            if (ev.target.files && ev.target.files[0]) {
                //const file = ev.target.files[0].name;
                const file = ev.target.files[0];
                const data = new FormData(self.dom);
                self.onSelect(file, data);
                if (clear) this.input.setValue('');
            }
        });
    }

    /**
     * Clear the file name.
     */
    clear() {
        this.input.dom.value='';
    }

    /**
     * Trigger the input programmatically.
     */
    click() {
        this.input.dom.click();
    }
}