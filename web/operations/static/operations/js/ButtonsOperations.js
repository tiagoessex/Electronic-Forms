import { Div, AwesomeIconAndButton, Link } from '/static/js/ui/BuildingBlocks.js';
import { STATUS } from '/static/js/status.js';
import { Translator } from '/static/js/Translator.js';

const OPERATION_OPEN_CLASS = 'operations-operation-row-open';
const OPERATION_CLOSE_CLASS = 'operations-operation-row-close';
const OPERATION_TRANSFER_CLASS = 'operations-operation-row-transfer';
const OPERATION_COMPLETE_CLASS = 'operations-operation-row-complete';
const OPERATION_VALIDATE_CLASS = 'operations-operation-validate';
const OPERATION_DELETE_CLASS = 'operations-operation-delete';
const OPERATION_EDIT_CLASS = 'operations-operation-edit';
const OPERATION_ANNEX_CLASS = 'operations-operation-annex';

/**
 * Create the buttons operations.
 */
 export class ButtonsOperations extends Div {

    /**
     * Contructor
     * @param {object} context Context.
     * @param {string} status Form status: TEMPORARY | DISABLED | ... . Check global status.js and Status table.
     * @param {number} id Form id.
     */
    constructor(context, status, id) {
      super();
      this.addClass("btn-group");
      const self = this;  

      this.close_btn = _button('fas fa-lock', [OPERATION_CLOSE_CLASS], 'outline-primary', Translator.translate('Close Operation')).attachTo(this);
      this.open_btn = _button('fas fa-lock-open', [OPERATION_OPEN_CLASS], 'outline-success', Translator.translate('Open Operation')).attachTo(this);
      const annex_btn = _button('fas fa-paperclip', [OPERATION_ANNEX_CLASS], 'outline-secondary', Translator.translate('Manage Annexes')).attachTo(this);

      const transfer_group = new Div().attachTo(this);
      transfer_group.addClass('btn-group');  
      const transfer_btn = _button('fa fa-exchange-alt', ['dropdown-toggle',OPERATION_TRANSFER_CLASS], 'outline-info', Translator.translate('Transfer operations')).attachTo(transfer_group);
      transfer_btn.setAttribute('data-toggle','dropdown');
      transfer_btn.setAttribute('aria-haspopup','true');
      transfer_btn.setAttribute('aria-expanded','false');
      const transfer_div = new Div().attachTo(transfer_btn);
      transfer_div.addClass('dropdown-menu');  
      const database_btn = new Link().attachTo(transfer_div);
      database_btn.addClass('dropdown-item edit-form');
      database_btn.setAttribute('href','javascript:void(0)');
      database_btn.setTextContent(Translator.translate('Send data to Database'));
      database_btn.setStyle('text-decoration','line-through');
      database_btn.setAttribute('data-toggle','tooltip');
      database_btn.setAttribute('title',Translator.translate('Send data to Database'));
      const json_btn = new Link().attachTo(transfer_div);
      json_btn.addClass('dropdown-item edit-form');
      json_btn.setAttribute('href','javascript:void(0)');
      json_btn.setTextContent(Translator.translate('Json/Text File'));
      json_btn.setAttribute('data-toggle','tooltip');
      json_btn.setAttribute('title',Translator.translate('Json/Text File'));
      const zip_file_btn = new Link().attachTo(transfer_div);
      zip_file_btn.addClass('dropdown-item edit-form');
      zip_file_btn.setAttribute('href','javascript:void(0)');
      zip_file_btn.setTextContent(Translator.translate('Zip File'));
      zip_file_btn.setAttribute('data-toggle','tooltip');
      zip_file_btn.setAttribute('title',Translator.translate('Zip File'));

      const validate_btn = _button('fas fa-check', [OPERATION_VALIDATE_CLASS], 'info', Translator.translate('Validate Operation')).attachTo(this);
      const edit_btn = _button('fas fa-edit', [OPERATION_EDIT_CLASS], 'light', Translator.translate('View and Edit the Operation')).attachTo(this);
      this.completed_btn = _button('fas fa-window-close', [OPERATION_COMPLETE_CLASS], 'dark', Translator.translate('Complete Operation')).attachTo(this);
      this.remove_btn = _button('fa fa-trash', [OPERATION_DELETE_CLASS], 'danger', Translator.translate('Delete operation')).attachTo(this);


      $(this.close_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onClose.dispatch([id], self);
      });
      $(this.open_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onOpen.dispatch([id], self);
      });
      $(annex_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onAnnexModal.dispatch(id, self);
      });        
      $(database_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onDatabase.dispatch([id], self);
      });
      $(json_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onJson.dispatch([id], self);
      });      
      $(zip_file_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onZip.dispatch([id], self);
      });
      $(edit_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onEdit.dispatch(id, self);
      });      
      $(validate_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onValidate.dispatch(id, self);
      });
      $(this.completed_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onAYS.dispatch(
          Translator.translate('Once set as COMPLETED, there is no going back. Continue?'), 
          () => {
            $(self.remove_btn.dom).css('visibility', 'hidden');
            $(self.completed_btn.dom).css('visibility', 'hidden');
            $(self.open_btn.dom).css('visibility', 'hidden');
            $(self.close_btn.dom).css('visibility', 'hidden');
            context.signals.onCompleted.dispatch([id], self);
          }
        );
      });
      $(this.remove_btn.dom).on('click', function(e) {
        e.stopPropagation();
        context.signals.onAYS.dispatch(Translator.translate('Delete operation?'), () => {
          context.signals.onRemove.dispatch([id], self);
        });
      });

      this.setButtonStatus(status);
    
  }

  /**
   * Enables/disables buttons according to the current state.
   * @param {STATUS} status STATUS.
   */
  setButtonStatus(status) {
    if (status === STATUS.COMPLETED) {
      $(this.remove_btn.dom).css('visibility', 'hidden');
      $(this.open_btn.dom).css('visibility', 'hidden');
      $(this.close_btn.dom).css('visibility', 'hidden');
      $(this.completed_btn.dom).css('visibility', 'hidden');
    }
  }

}

  
function _button(icon, classes, color='primary', tooltip='') {
    const btn = new AwesomeIconAndButton('',icon);
    btn.addClass('btn-actions');
    btn.addClass('btn');
    btn.addClass('btn-' + color);
    btn.addClass('btn-sm');
    btn.addClass('mr-1');
    btn.setStyle('width','36px');
    classes.forEach(_class => {btn.addClass(_class)});
    btn.setAttribute('data-toggle','tooltip');
    btn.setAttribute('title',tooltip);
    return btn;
}
  