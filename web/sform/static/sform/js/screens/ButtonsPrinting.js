import { AwesomeIconAndButton, Div } from '/static/js/ui/BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';


export class ButtonsPrinting extends Div {

    /**
     * Contructor
     * @param {object} context Context object.
     * @param {number} id Form id.
     * @param {string} name Form name.
     */
    constructor(context, id, name) {
      super();
      this.addClass("btn-group");
      
      const print_btn = _button('fa fa-print', ['btn-actions','clone-form','btn-sm'], 'outline-primary', Translator.translate('Print form')).attachTo(this);
      const pdf_btn = _button('far fa-file-pdf', ['btn-actions','view-form','btn-sm'], 'outline-primary', Translator.translate('Export form to PDF')).attachTo(this);

      $(print_btn.dom).on('click', function(event) {
          event.stopPropagation();
          context.signals.onPrint.dispatch(id, null, () => context.clearSignals(true, false), name);
      });
      $(pdf_btn.dom).on('click', function(event) {
          event.stopPropagation();
          context.signals.onPdf.dispatch(id, null, () => context.clearSignals(true, false), name);
      });      
    
    }   

}


function _button(icon, classes, color='primary', tooltip='') {
    const btn = new AwesomeIconAndButton('',icon);
    //btn.addClass('btn-actions');
    btn.addClass('btn');
    btn.addClass('btn-' + color);
    btn.addClass('mr-1');
    btn.setStyle('width','48px');
    classes.forEach(_class => {btn.addClass(_class)});
    btn.setAttribute('data-toggle','tooltip');
    btn.setAttribute('title',tooltip);
    return btn;
}
  