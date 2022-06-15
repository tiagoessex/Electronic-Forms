import { Div, AwesomeIconAndButton, Link } from '/static/js/ui/BuildingBlocks.js';
import { STATUS } from '/static/js/status.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Creates the complete buttons operations, and shows/hides them according to the status.
 */
 export class ButtonsOperations extends Div {

    /**
     * Contructor
     * @param {object} context Context object.
     * @param {string} status Form status: TEMPORARY | DISABLED | ... . Check global status.js and Status table.
     * @param {number} id Form id.
     */
    constructor(context, status, id) {
      super();
      this.addClass("btn-group");      

      this.use_btn = _button('fa fa-check', ['btn-actions','use-form'], 'success', Translator.translate('Lock form and ready to use')).attachTo(this);
      this.disable_btn = _button('fa fa-times', ['btn-actions','disable-form'], 'dark', Translator.translate('Disable form')).attachTo(this);
      
      const edit_group = new Div().attachTo(this);
      edit_group.addClass('btn-group');  
      this.edit_btn = _button('fa fa-edit', ['btn-actions','dropdown-toggle'], 'primary', Translator.translate('Edit form')).attachTo(edit_group);
      this.edit_btn.setAttribute('data-toggle','dropdown');
      this.edit_btn.setAttribute('aria-haspopup','true');
      this.edit_btn.setAttribute('aria-expanded','false');
      const drop_edit = new Div().attachTo(this.edit_btn);
      drop_edit.addClass('dropdown-menu');
      const edit = new Link().attachTo(drop_edit);
      edit.addClass('dropdown-item edit-form');
      edit.setAttribute('href','javascript:void(0)');
      edit.setTextContent(Translator.translate('Edit Form'));
      const change = new Link().attachTo(drop_edit);
      change.addClass('dropdown-item nd-form');
      change.setAttribute('href','javascript:void(0)');
      change.setTextContent(Translator.translate('Change Name/Description')); 

      this.remove_btn = _button('fa fa-trash', ['btn-actions','delete-form'], 'danger', Translator.translate('Delete form')).attachTo(this);

      const clone_btn = _button('fa fa-clone', ['btn-actions','clone-form'], 'outline-secondary', Translator.translate('Clone form')).attachTo(this);
      const preview_btn = _button('fa fa-eye', ['btn-actions','view-form'], 'outline-info', Translator.translate('Preview form')).attachTo(this);
      const print_btn = _button('fas fa-print', ['btn-actions','delete-form'], 'outline-info', Translator.translate('Print form')).attachTo(this);
      const pdf_btn = _button('far fa-file-pdf', ['btn-actions','delete-form'], 'outline-info', Translator.translate('Export form to PDF')).attachTo(this);

      this.setButtonStatus(status);

      const self = this;  
      $(this.use_btn.dom).on('click', function() {
        context.signals.onUsed.dispatch(id, self);
      });
      $(change.dom).on('click', function() {
        context.signals.onChanged.dispatch(id, self);
      });      
      $(this.disable_btn.dom).on('click', function() {
        context.signals.onDisabled.dispatch(id, self);
      });
      $(this.remove_btn.dom).on('click', function() {
        context.signals.onRemoved.dispatch(id, self);
      });
      $(edit.dom).on('click', function() {
        context.signals.onEditForm.dispatch(id);
      });
      $(clone_btn.dom).on('click', function() {
        context.signals.onClone.dispatch(id);
      });
      $(preview_btn.dom).on('click', function() {
        context.signals.onPreview.dispatch(id);
      });
      $(print_btn.dom).on('click', function() {
        context.signals.onPrint.dispatch(id);
      });
      $(pdf_btn.dom).on('click', function() {
        context.signals.onPdf.dispatch(id);
      });            
    }

    setButtonStatus(status) {
      if (status === STATUS.DISABLED) {        
        this.use_btn.dom.style.visibility = 'hidden';
        this.edit_btn.dom.style.visibility = 'hidden';
        this.disable_btn.dom.style.visibility = 'hidden';
        this.remove_btn.dom.style.visibility = 'hidden';
      }
      else if (status === STATUS.IN_USE) {
        this.use_btn.dom.style.visibility = 'hidden';
        this.edit_btn.dom.style.visibility = 'hidden';
        this.remove_btn.dom.style.visibility = 'hidden';
      }      
    }

}

  
function _button(icon, classes, color='primary', tooltip='') {
    const btn = new AwesomeIconAndButton('',icon);
    //btn.addClass('btn-actions');
    btn.addClass('btn');
    btn.addClass('btn-' + color);
    btn.addClass('mr-1');
    btn.addClass('btn-sm');
    btn.setStyle('width','48px');    
    classes.forEach(_class => {btn.addClass(_class)});
    btn.setAttribute('data-toggle','tooltip');
    btn.setAttribute('title',tooltip);
    return btn;
}
  