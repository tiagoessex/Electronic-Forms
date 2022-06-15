
import { Input, Form, Div, Img, Hx } from '/static/js/ui/BuildingBlocks.js';
import { DRAG_AND_DROP } from '/static/js/urls.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Click and Drop file for Bootstrap 4.
 * 
 */
export class ClickOrDragFileInput extends Form {
    /**
     * 
     * @param {string} id ID.
     * @param {string} name Name.
     * @param {function} onSelect On file selected, call function.
     */
     constructor(id, name, onSelect = null, filter='image/*') {
        super();
        this.onSelect = onSelect;        
        const self = this;

        this.setAttribute('name', 'form');
        this.setAttribute('enctype', 'multipart/form-data');

        const wrap = new Div().attachTo(this);
        wrap.addClass("image-upload-wrap-idrisk");
        const input = new Input().attachTo(wrap);
        input.addClass("file-upload-input-idrisk");
        input.setAttribute('type','file');
        input.setAttribute('name', name);
        input.setAttribute('accept', filter);
        const image = new Img(DRAG_AND_DROP).attachTo(wrap);
        image.addClass("mx-auto d-block mt-2");
        image.setStyle('pointer-events','none');
        
        const h2 = new Hx(2).attachTo(wrap);
        h2.addClass('fuii-text');
        h2.setTextContent(Translator.translate("Drag'n drop or click to upload a file!"));
        
        /**
         * On select, return (filename, file, type)
         */
        input.dom.addEventListener('change', (ev) => {
            //console.log("change");
            if (ev.target.files && ev.target.files[0]) {
                const data = new FormData(self.dom);
                self.onSelect(ev.target.files[0], data, ev.target.files[0].type);
            }
        });

        // reset input's value and trigger the onchange event even if the same path is selected
        input.dom.addEventListener('click', (ev) => {
            input.dom.value = null;
        });

    }

}