

import { subStr } from '/static/js/jsutils.js';
import { Div, Link, ButtonAndAwesomeIcon, Span, InputText } from '/static/js/ui/BuildingBlocks.js';
import { SectionItem } from './SectionItem.js';
import { 
    SECTION_ITEM_CLASS, 
    DEFAULT_SECTION_ID,
    DEFAULT_SECTION_NAME,
    PRE_TABS_ID, 
    PRE_CONTENT_ID, 
    SECTION_LINK_CLASS } from './constants.js';
import { Translator } from '/static/js/Translator.js';


const SECTIONS_TAB = document.getElementById('sections-tab');
const SECTIONS_CONTENT = document.getElementById('sections-tab-content');

/**
 * Section.
 */
export class Section {

    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Id of the Section.
     * @param {string} name Name of the Section.
     * @param {bool} disabled True if draggable.
     * @param {bool} active True if this Section tab is active.
     */
    constructor(context, id, name, disabled, active) {
        this.context = context;
        const self = this;
        this.id = id;
        this.name = name;
      
        this.nav_link = new Link();
        this.nav_link.addClass('nav-link')
        if (disabled || id === DEFAULT_SECTION_ID)
            this.nav_link.addClass('not-sortable')
        if (active) {
            this.nav_link.addClass('active')
        }
        this.nav_link.addClass(SECTION_LINK_CLASS)
        this.nav_link.addClass('btn btn-outline-primary m-1');
        this.nav_link.setId(PRE_TABS_ID + id);
        this.nav_link.setAttribute('data-id',id);
        this.nav_link.setAttribute('data-toggle','pill');
        this.nav_link.setAttribute('href','#' + PRE_CONTENT_ID + id);
        this.nav_link.setAttribute('role','tab');
        this.nav_link.setAttribute('aria-controls',PRE_CONTENT_ID + id);
        this.nav_link.setAttribute('aria-selected',active);
        this.nav_link.attachTo(SECTIONS_TAB);

        this.nav_link_text = new Span().attachTo(this.nav_link);
        this.nav_link_text.addClass('collapse show');

        const body = new Div().attachTo(SECTIONS_CONTENT);
        body.addClass('tab-pane fade');
        if (active) {
            body.addClass('show active');
        }
        body.setId(PRE_CONTENT_ID + id);
        body.setAttribute('role','tabpanel');
        body.setAttribute('aria-labelledby',PRE_TABS_ID + id );

        const card = new Div().attachTo(body);
        card.addClass('card');
        card.setStyle('width','24rem');

        this.header = new Div().attachTo(card);
        this.header.addClass('card-header font-weight-bold bg-warning text-dark');

        this.items_container = new Div().attachTo(card);
        this.items_container.addClass('list-group');
        this.items_container.setId(id);
        
        this.setName(this.name, false);
        
        // make the items draggable
        $("#" + id).sortable({
            stop: function( event, ui ) {self.context.signals.onChange.dispatch();}
        });
        $("#" + id).disableSelection();        

        // make the tabs droppable
        $('#' + PRE_TABS_ID + id).droppable({
            accept: "." + SECTION_ITEM_CLASS,
            drop: function(event, ui) {
                const parent = ui.draggable[0].parentNode;
                const target_id = event.target.dataset.id;        
                const originid = parent.id;
                const element_id = ui.draggable[0].dataset.id;
                // move element from section x to section y
                if (target_id != originid) {
                    const removed = parent.removeChild(ui.draggable[0]);
                    setTimeout(function() {
                        $('#' + target_id).append(removed);
                        self.context.signals.onSectionItemMoved.dispatch(element_id, target_id);
                    }, 5);
                }                
            }
        });

        // if not default section, then add a rename section name icon
        if (id !== DEFAULT_SECTION_ID) {
            const rename_btn = new ButtonAndAwesomeIcon('','fa fa-edit').attachTo(this.nav_link);
            rename_btn.addClass('btn btn-outline-link btn-sm collapse show');

            rename_btn.dom.addEventListener('click',function(e) {
                self.nav_link_text.removeClass('show');
                rename_btn.removeClass('show');
                const name_input = new RenameInput((new_name) => {
                    self.setName(new_name, true);
                    if (name_input.dom.parentNode) name_input.detach();
                    self.nav_link_text.addClass('show');
                    rename_btn.addClass('show');
                }).attachTo(self.nav_link);
                name_input.setValue(self.name);
                name_input.dom.focus();
            })
        }

        
        
    }

    /**
     * Get the ID of the section.
     * @returns The ID of the section.
     */
    getId() {
        return this.id;
    }

    /**
     * Adds an SectionItem to the section.
     * @param {string} element_id ID of the element.
     * @param {string} element_name Name of the element.
     * @returns Returns the Item.
     */
    addItem(element_id, element_name, is_group) {
        return new SectionItem(this.items_container, element_id, element_name, is_group);
    }

    /**
     * Removes an SectionItem from the section.
     * @param {string} id ID of the SectionItem.
     */
    removeItem(id) {
        const item = document.getElementById(SECTION_ITEM_CLASS + '-' + id);        
        if (item) {
            item.parentNode.removeChild(item);
        }
    }

    /**
     * Sets the name of the section.
     * @param {string} name New section name.
     * @param {boolean} rename If true then the call is for name change.
     */
    setName = (name, rename = false) => { 
         
        if (name.replaceAll(' ','') === '') {
            this.context.signals.onError.dispatch(Translator.translate("Invalid name! It must be something!"),"[Section::setName]");
            return;
        } else if (name === DEFAULT_SECTION_NAME && this.id !== DEFAULT_SECTION_ID) {
            this.context.signals.onError.dispatch(Translator.translate("Invalid name! Chose another name!"),"[Section::setName]");
            return;
        }
        if (rename) {
            if (name !== this.name) {
                this.context.signals.onSectionNameChanged.dispatch(this.id, name);
            } else {
                return;
            }
        }
        this.nav_link_text.setTextContent(subStr(name, 8, 16));
        this.header.setTextContent(subStr(name, 8, 16));
        this.name = name; 
    }
}

class RenameInput extends InputText {
    constructor(onReady=null) {
        super();

        this.dom.addEventListener('change',function(e) {
            onReady(e.target.value);
        });       
        
        this.dom.addEventListener('blur',function(e) {
            onReady(e.target.value);
        });
    }
}
