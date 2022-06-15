import { Modal } from '/static/js/modals/Modal.js';
import { Badge } from '/static/js/ui/Badge.js';
import { RadioCheckInput } from '/static/js/ui/RadioCheckInput.js';
import { Hx, Br } from '/static/js/ui/BuildingBlocks.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Select Pattern Modal
 */
export class PatternsModal extends Modal { 

  /**
   * Constructor.
   * @param {string} title Title of the modal.
   * @param {string} help_text Helper text.
   * @param {function} updatevalue Callback to update the value in the properties.
   * @param {Context} context Context.
  */
  constructor(title, help_text='', updatevalue=null, context=null) {
        super(title, help_text, null); 

        if (!updatevalue || updatevalue === undefined) {
          console.error('[PatternsModal->PatternsModal::ctor] - Missing updatevalue callback function!');
          throw Error('Missing updatevalue callback function!');
        } 
        if (!context || context === undefined) {
          console.error('[PatternsModal->PatternsModal::ctor] - Missing the context!');
          throw Error('Missing the context!');
        }     

        const self = this;
        this.updatevalue = updatevalue;

        const phone = new Hx(2);
        phone.attachTo(this.modal_body);
        const badge_phone = new Badge('secondary', Translator.translate('Phone'));
        badge_phone.attachTo(phone);

        new RadioCheckInput('radio', null, 'XXXXXXXXX', '\d{9}', 'prop-pattern').attachTo(this.modal_body);
        new RadioCheckInput('radio', null, 'XXX XXX XXX', '\d{3} \d{3} \d{3}', 'prop-pattern').attachTo(this.modal_body);
        new RadioCheckInput('radio', null, 'XXX-XXX-XXX', '\d{3}-\d{3}-\d{3}', 'prop-pattern').attachTo(this.modal_body);
        new RadioCheckInput('radio', null, '+XXX XXX XXX XXX', '\+(\d{1,3}) \d{3} \d{3} \d{3}', 'prop-pattern').attachTo(this.modal_body);
        new RadioCheckInput('radio', null, '+(XXX) XXX-XXX-XXX', '\+\((\d{1,3}\)) \d{3} \d{3} \d{3}', 'prop-pattern').attachTo(this.modal_body);

        new Br(1).attachTo(this.modal_body);

        const website = new Hx(2).attachTo(this.modal_body);
        new Badge('secondary', Translator.translate('Website')).attachTo(website);

        new RadioCheckInput('radio', null, 'http[s]://xxx.xxx', '"https?://.+\..+', 'prop-pattern').attachTo(this.modal_body);
        new RadioCheckInput('radio', null, 'http[s]://xxx', 'https?://.+', 'prop-pattern').attachTo(this.modal_body);
        new RadioCheckInput('radio', null, 'xxx.xxx', '.+\..+', 'prop-pattern').attachTo(this.modal_body);

        new Br(1).attachTo(this.modal_body);

        const email = new Hx(2).attachTo(this.modal_body);
        new Badge('secondary', Translator.translate('Email')).attachTo(email);

        new RadioCheckInput('radio', null, 'xxx@xxx.xxx', '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$', 'prop-pattern').attachTo(this.modal_body);

        new Br(1).attachTo(this.modal_body);

        const country_code = new Hx(2).attachTo(this.modal_body);
        new Badge('secondary', Translator.translate('Country Code')).attachTo(country_code);

        new RadioCheckInput('radio', null, 'xxx', '\w{2,}', 'prop-pattern').attachTo(this.modal_body);

        new Br(1).attachTo(this.modal_body);

        const general = new Hx(2).attachTo(this.modal_body);
        new Badge('secondary', Translator.translate('General')).attachTo(general);

        new RadioCheckInput('radio', null, 'Only letters', '[a-zA-Z\\s]*', 'prop-pattern').attachTo(this.modal_body);
        new RadioCheckInput('radio', null, 'Only numbers', '[0-9\\s]*', 'prop-pattern').attachTo(this.modal_body);
        new RadioCheckInput('radio', null, 'Default', '', 'prop-pattern', true).attachTo(this.modal_body);       

        $(this.ok_btn.dom).on('click', function(e) {
          context.signals.onChange.dispatch();
          var selectedOption = $("input:radio[name=prop-pattern]:checked").val()        
          self.updatevalue(selectedOption);
        } );   

    }

}
