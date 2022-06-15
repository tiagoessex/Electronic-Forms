import { SectionsManager } from './sections/SectionsManager.js';
import { VIEWS_TAB_ID } from './constants/constants.js';
import {
    DEFAULT_SECTION_ID,
    DEFAULT_SECTION_NAME
} from './sections/constants.js';
import { SectionNameModal } from './modals/SectionNameModal.js';
import { Translator } from '/static/js/Translator.js';


const LIST_AREA = document.getElementById('list-tab');
const SECTIONS_TAB = document.getElementById('sections-tab');

const LIST_VIEW_BUTTONS = document.querySelector('.list-view-ui');
const NEW_SECTION_BTN = document.getElementById('btn-new-section');
const REMOVE_SECTION_BTN = document.getElementById('btn-remove-section');
const REMOVE_ALL_SECTION_BTN = document.getElementById('btn-remove-all-sections');


/**
 * List tab view.
 * @param {Context} context Context
 */
export function ListView(context) {
    this.context = context; 
    const self = this;

    context.signals.onProgress.dispatch("Setting up the List View tab ...");

    // make sections tabs sortable
    $(SECTIONS_TAB).sortable({ items: "a:not(.not-sortable)"});
    $(SECTIONS_TAB).disableSelection();
 
    // ----------------
    // --- MANAGERS ---
    // ----------------

    this.sections_manager = new SectionsManager(context);//, SECTIONS_TAB, SECTIONS_CONTENT);
    
    // --------------
    // --- MODALS ---
    // --------------

    this.modal_new_section = new SectionNameModal(
        Translator.translate("New Section"),
        Translator.translate('Input a name for the new Section and press OK!'),
        this.sections_manager.addNewSection,
        this.context
    ).attachTo(LIST_AREA);
    
    // ------------------------------------
    // --- LISTVIEW SPECIFIC BUTTONS ------
    // ------------------------------------

	// ADD A NEW SECTION
	NEW_SECTION_BTN.addEventListener('click', function() {
		self.modal_new_section.show();
        //self.modal_new_section.input.dom.focus();
	});

    // REMOVE SELCTED SECTION
	REMOVE_SECTION_BTN.addEventListener('click', function() {
		const tab = $("a[data-toggle='pill'].active");
		if (tab) {
			const selected_section = tab[0].dataset.id;
            if (selected_section !== DEFAULT_SECTION_ID) {
                self.sections_manager.removeSection(selected_section);				
            } else {
				console.warn("[ListView->ListView::ctor] Forbidden!");
			}
		}
	});

	REMOVE_ALL_SECTION_BTN.addEventListener('click', function() {
        self.context.signals.onAYS.dispatch(Translator.translate("Delete all sections?"), () => {self.sections_manager.removeAllSections()});        
	});
    

    // ------------
    // --- INIT ---
    // ------------

    this.default_section = this.sections_manager.addNewSection(DEFAULT_SECTION_NAME, false, true);

    // -------------------------
    // --- SET THE LISTENERS ---
    // -------------------------
    context.signals.onMainTabChanged.add(this.tabChanged,this);

    context.signals.onSectionCreated.add(() => {
        if (Object.keys(this.sections_manager.sections).length > 1) {
            REMOVE_SECTION_BTN.removeAttribute('disabled');
            REMOVE_ALL_SECTION_BTN.removeAttribute('disabled');
        }
    });
    context.signals.onSectionRemoved.add(() => {
        if (Object.keys(this.sections_manager.sections).length <= 1) {
            REMOVE_SECTION_BTN.setAttribute('disabled','true');
            REMOVE_ALL_SECTION_BTN.setAttribute('disabled','true');
        }
    });


    // -----------------------
    // --- LIST VIEW READY ---
    // -----------------------
    context.signals.onStuffDone.dispatch('ListView ready!');
    context.signals.onProgress.dispatch("List View tab ready!");
}

ListView.prototype = {
    /**
     * Clears everything.
     */
    reset: function() {
        this.sections_manager.clear();   
    },


    /**
     * == Listener ==
     * Main tab changed:
     *      - show/hide the respective UI.
     * @param {string} new_section Tab ID.
     */
    tabChanged: function(new_section) {
        if (new_section === VIEWS_TAB_ID.LIST) {
            $(LIST_VIEW_BUTTONS).show();
        } else {
            $(LIST_VIEW_BUTTONS).hide();
        }
    },
    
}
