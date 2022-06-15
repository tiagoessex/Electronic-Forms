
import { Div, Label, Input, TextArea } from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { URL_CHANGE, URL_CHECKNAME } from '/static/js/urls.js';
import { Alert } from '/static/js/ui/Alert.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Modal for changing name/description.
 */
export class ChangeModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {object} context Context object.
     */
    constructor(title, help_text='', context=null) {
        super(title, help_text, MODAL_SIZE.LG); 

        this.original_name = '';
        this.original_desc = '';
        this.context = context;
        this.onChanged = null;

        const self = this;  
        
        const gp_1 = new Div({classes:['form-group']}).attachTo(this.modal_body);
        new Label('Name:').attachTo(gp_1);
        this.name_input = new Input({classes:['form-control']}).attachTo(gp_1);
        this.name_input.setAttribute('maxlength','50');

        this.alert = new Alert('danger', Translator.translate("There's a form with that name! Input a different one!"), true, false, '1.5em').attachTo(gp_1);
        $(this.alert.dom).hide();

        const gp_2 = new Div({classes:['form-group']}).attachTo(this.modal_body);
        new Label('Description:').attachTo(gp_2);
        this.desc_input = new TextArea(null, null, {classes:['form-control']}).attachTo(gp_2);
        this.desc_input.setAttribute('maxlength','250');


        // on every change, check if name already exists
        $(this.name_input.dom).on('keyup paste', function() {
          self.checkName();
        })

        // if some property was changed, then try to save the changes
        $(this.ok_btn.dom).on('click', function() {
          if (self.original_name !== self.name_input.getValue() || 
          self.original_desc !== self.desc_input.getValue()) {
            self.saveNameDesc();            
          }           
        });
          

    }

    /**
     * Shows modal.
     * @param {number} id Form's number.
     * @param {string} name Form's name.
     * @param {string} description Form's description.
     * @param {function} onChanged Called when sucessefully changed in the db.
     */
    show(id, name, description, onChanged=null) {
      super.show();
      this.id = id;
      this.original_name = name;
      this.original_desc = description;
      this.name_input.setValue(name);
      this.desc_input.setValue(description);
      this.onChanged = onChanged;
    }

    /**
     * Checks if name exists,
     * if so, then disable button and show alert message
     */
    checkName() {
      fetchPOST(
        URL_CHECKNAME, 
        {
          id: this.id,
          name: this.name_input.getValue(),
        },
        result => {
          if (result.result === 'OK') {
            $(this.alert.dom).hide();
            this.ok_btn.removeAttribute('disabled');
          } else {
              $(this.alert.dom).show();  
              this.ok_btn.setAttribute('disabled','true');
          }
        },
        error => this.context.signals.onError.dispatch(error,"[ChangeModal::checkName]")
      )
    }

    /**
     * Saves the name and description.
     * If the form was still a temporary one, then turn it into permanent.
     */
    saveNameDesc() { 
      $('#manager-spinner').show();
      fetchPOST(
        URL_CHANGE, 
        {
          id: this.id,
          name: this.name_input.getValue(),
          description: this.desc_input.getValue(),
        },
        result => {
          if (this.onChanged) this.onChanged(this.name_input.getValue(), this.desc_input.getValue())
          $('#manager-spinner').hide();
        },
        error => this.context.signals.onError.dispatch(error,"[ChangeModal::saveNameDesc]")
      )       
    }
}
