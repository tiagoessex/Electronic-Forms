
import { Input, Form } from './BuildingBlocks.js';

/**
 * Simple file input, inside a form (for the FormData).
 */
export class FileInput extends Form {
    /**
     * 
     * @param {string} id ID.
     * @param {string} name Name.
     * @param {function} onSelect On file selected, call function.
     * @param {boolean} clear If true, after selection clear file name.
     */
    constructor(id, name, onSelect = null, clear = true) {
        super();
        this.onSelect = onSelect;        
        const self = this;

        this.setAttribute('name', 'form');
        this.setAttribute('enctype', 'multipart/form-data');
        
        this.input = new Input().attachTo(this);
        this.input.setAttribute('type','file');
        this.input.setAttribute('name', name);
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