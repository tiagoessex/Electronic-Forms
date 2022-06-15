
import { Div, Label, Ul, Li, Link, Input, TextArea } from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { URL_CHANGE, URL_CHECKNAME } from '/static/js/urls.js';
import { Alert } from '/static/js/ui/Alert.js';
import { Translator } from '/static/js/Translator.js';


/**
 * Modal for checking forms properties and changing name and description.
 */
export class PropertiesModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {Context} context Context.
     * @param {function} setName Callback function to set the name.
     * @param {function} save Callback function to save the form.
     */
    constructor(title, help_text='', context=null, setName=null, save=null) {
        super(title, help_text, MODAL_SIZE.LG); 

        if (!setName || setName === undefined) {
          console.error('[PropertiesModal->PropertiesModal::ctor] - Missing setName callback function!');
          throw Error('Missing setName callback function!');
        } 
        if (!context || context === undefined) {
          console.error('[PropertiesModal->PropertiesModal::ctor] - Missing the context!');
          throw Error('Missing the context!');
        }              


        this.context = context;
        this.setName = setName;
        this.original_name = '';
        this.original_desc = '';
        this.save = save;

        const self = this;

        const ul = new Ul({classes:['nav','nav-tabs']}).attachTo(this.modal_body);
        
        this.tab_main = createLi(ul, 'prop-modal-main', 'Main', true);
        this.tab_info = createLi(ul, 'prop-modal-info', 'Info');
        this.tab_stats = createLi(ul, 'prop-modal-stats', 'Stats');

        const tab_content = new Div({classes:['tab-content']}).attachTo(this.modal_body);;
        
        this.main = createTab (tab_content, 'prop-modal-main', true);
        this.info = createTab (tab_content, 'prop-modal-info');
        this.stats = createTab (tab_content, 'prop-modal-stats');
        
        // MAIN

        const gp_1 = new Div({classes:['form-group']}).attachTo(this.main);
        new Label(Translator.translate('Name:')).attachTo(gp_1);
        this.name = new Input({classes:['form-control']}).attachTo(gp_1);
        this.name.setAttribute('maxlength','50');


        this.alert = new Alert('danger', Translator.translate('Name already in use! Chose another one!'), true, false, '1em').attachTo(gp_1);
        this.alert.addClass('mt-1');
        this.alert.setStyle('display','none');
        
        const gp_2 = new Div({classes:['form-group']}).attachTo(this.main);
        new Label(Translator.translate('Description:')).attachTo(gp_2);
        this.desc = new TextArea(null, null, {classes:['form-control']}).attachTo(gp_2);
        this.desc.setAttribute('maxlength','250');

        // INFO
        const info_row = new Div({classes:['row','mt-3']}).attachTo(this.info);

        this.form_id = createInfoRow (info_row.dom, Translator.translate('ID:'));
        this.author = createInfoRow (info_row.dom, Translator.translate('Author:'));
        this.date_created = createInfoRow (info_row.dom, Translator.translate('Created in:'));
        this.updated = createInfoRow (info_row.dom, Translator.translate('Updated by:'));
        this.date_updated = createInfoRow (info_row.dom, Translator.translate('Updated in:'));


        // STATS
        const stats_row = new Div({classes:['row','mt-3']}).attachTo(this.stats);

        //this.form_id = createInfoRow (stats_row.dom, 'ID:');
        this.n_pages = createInfoRow (stats_row.dom, Translator.translate('Number of Pages:'));
        this.n_sections = createInfoRow (stats_row.dom, Translator.translate('Number of Sections:'));
        this.n_groups = createInfoRow (stats_row.dom, Translator.translate('Number of Groups:'));
        this.n_eas = createInfoRow (stats_row.dom, Translator.translate('Number of E/A:'));
        this.n_elements = createInfoRow (stats_row.dom, Translator.translate('Number of Elements:'));


        // on every keyup, check if name exists
        $(this.name.dom).on("keyup paste change", function() {
          self.checkName();
          });

        // if some property was changed or is still temp, then  save 
        $(this.ok_btn.dom).on("click", function() {
          if (self.original_name !== self.name.getValue() || 
              self.original_desc !== self.desc.getValue() ||
              self.context.properties.is_temp) {
                self.saveNameDesc();            
          }            
        });          

    }

    /**
     * Checks if name exists,
     * if so, disable button and show error message
     */
    checkName() {
      fetchPOST(
        URL_CHECKNAME, 
        {
          id: this.context.properties.id,
          name: this.name.getValue()
        }, 
        result => {
          if (result.status == 200) {
            $(this.alert.dom).hide();
            this.ok_btn.removeAttribute('disabled');
          } else {
            $(this.alert.dom).show(); 
            this.ok_btn.setAttribute('disabled','true');
          }
        },
        (error) => {
          this.context.signals.onError.dispatch(error,"[PropertiesModal::checkName]"); 
        }
      )
    }

    /**
     * Saves the name and description.
     * If the form was still TEMPORARY, then change its status to EDITABLE.
     */
    saveNameDesc() {      
        this.context.properties.name = this.name.getValue();
        this.context.properties.description = this.desc.getValue();
        //if (this.properties.id === null) return;  // form doesn't exists yet
        this.save(() => {
          fetchPOST(URL_CHANGE,
            {
              id: this.context.properties.id,
              name: this.context.properties.name,
              description: this.context.properties.description,
            },
            (result) => {
              this.setName(this.context.properties.name);
              this.context.properties.updated_by = result.updated_by_name;
              this.context.properties.date_updated = result.date_updated_name;
              this.context.signals.onSaved.dispatch();
            },
            (error) => {
              this.context.signals.onError.dispatch(error,"[PropertiesModal::saveNameDesc]"); 
            }
          );
        })
    }

    /**
     * Updates the properties to show.
     * Also, check the current name, just in case.
     * @param {string} message Footer message.
     */
    show(message) {
        this.modal_helper.setTextContent(message);
        this.original_name = this.context.properties.name;
        this.original_desc = this.context.properties.description;

        super.show();

        // update the text
        this.author.textContent = this.context.properties.created_by;
        this.date_created.textContent = new Date(this.context.properties.date_created);//this.properties.date_created.split('T')[0];
        this.updated.textContent = this.context.properties.updated_by;
        this.date_updated.textContent = new Date(this.context.properties.date_updated);//.split('T')[0];

        this.form_id.textContent = this.context.properties.id;
        this.name.setValue(this.context.properties.name);
        this.desc.setValue(this.context.properties.description);
        this.n_pages.textContent = this.context.properties.n_pages;
        this.n_sections.textContent = this.context.properties.n_sections;
        this.n_groups.textContent = this.context.properties.n_groups;
        this.n_eas.textContent = this.context.properties.n_eas;
        this.n_elements.textContent = this.context.properties.n_elements;

        this.checkName();

    }

}

// -------------------
// HELPER CONSTRUTORS
// -------------------

const createLi = (parent, id, text, isActive=false) => {
    const li = new Li({classes:['nav-item']}).attachTo(parent);
    const link = new Link({classes:['nav-link']}).attachTo(li);
    if (isActive) link.addClass('active');
    link.setAttribute('data-toggle', 'tab');
    link.setAttribute('href','#' + id);
    link.setTextContent(text);
    return li;
}

const createTab = (parent, id, isActive=false) => {
    const container = new Div({classes:['tab-pane','container']}).attachTo(parent);
    if (isActive) container.addClass('active');
    container.setId(id);
    return container;
}

const createInfoRow = (parent, text) => {
    const info_label = document.createElement('dt');
    info_label.classList.add('col-sm-3');
    info_label.textContent = text;
    parent.appendChild(info_label);
    const info_data = document.createElement('dd');
    info_data.classList.add('col-sm-9');
    info_data.textContent = text + text + text;
    parent.appendChild(info_data);
    return info_data;
}


