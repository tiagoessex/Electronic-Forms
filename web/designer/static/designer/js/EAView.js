
import { VIEWS_TAB_ID } from './constants/constants.js';
import { EA_TYPE } from './ea/constants.js';
import { EAManager } from './ea/EAManager.js';
import { Translator } from '/static/js/Translator.js';

const EA_VIEW_BUTTONS = document.querySelector('.ea-view-ui');

const NEW_EA_SELECTION = document.getElementById('ea-new-selection');
const NEW_EA_VISIBILITY = document.getElementById('ea-new-visibility');
const NEW_EA_STATUS = document.getElementById('ea-new-status');
const NEW_EA_TEMPORAL = document.getElementById('ea-new-temporal');
const NEW_EA_FORMAT = document.getElementById('ea-new-format');
const NEW_EA_DB_QUERY = document.getElementById('ea-new-db-query');
const NEW_EA_TABLE_QUERY = document.getElementById('ea-new-table-query');
const NEW_EA_APPEND = document.getElementById('ea-new-append');
const NEW_EA_REQUIRED = document.getElementById('ea-new-required');

const REMOVE_ALL_EAS_BTN = document.getElementById('btn-remove-all-eas');
const EXPAND_ALL_EAS_BTN = document.getElementById('btn-expand-all-eas');
const COLLAPSE_ALL_EAS_BTN = document.getElementById('btn-collapse-all-eas');
const NO_EAS_MSG = document.getElementById('no-eas-msg');

export function EAView(context) {
    this.context = context;
    const self = this;

    context.signals.onProgress.dispatch("Setting up the EA tab ...");

    // ----------------
    // --- MANAGERS ---
    // ----------------

    this.ea_manager = new EAManager(context);
 
    // ------------
    // --- INIT ---
    // ------------
    this.checkNumberEAs();

    // -------------------------
    // --- SET THE LISTENERS ---
    // -------------------------
    context.signals.onMainTabChanged.add(this.tabChanged,this);
    context.signals.onEACreated.add(this.checkNumberEAs, this);
    context.signals.onEARemoved.add(this.checkNumberEAs, this);

    // ------------------------------------
    // --- E/A VIEW SPECIFIC BUTTONS ------
    // ------------------------------------

	// ADD A NEW E/A
	NEW_EA_SELECTION.addEventListener('click', function() {
        self.ea_manager.createEA(EA_TYPE.SELECTION.name);
	});
	NEW_EA_VISIBILITY.addEventListener('click', function() {
        self.ea_manager.createEA(EA_TYPE.VISIBILITY.name);
	});
	NEW_EA_STATUS.addEventListener('click', function() {
        self.ea_manager.createEA(EA_TYPE.STATUS.name);
	});
    NEW_EA_TEMPORAL.addEventListener('click', function() {
		self.ea_manager.createEA(EA_TYPE.TEMPORAL.name);
	});
    NEW_EA_FORMAT.addEventListener('click', function() {
		self.ea_manager.createEA(EA_TYPE.FORMAT.name);
	});    
    NEW_EA_DB_QUERY.addEventListener('click', function() {
		self.ea_manager.createEA(EA_TYPE.DBQUERY.name);
	});
    NEW_EA_TABLE_QUERY.addEventListener('click', function() {
		self.ea_manager.createEA(EA_TYPE.TABLEQUERY.name);
	});
    NEW_EA_APPEND.addEventListener('click', function() {
		self.ea_manager.createEA(EA_TYPE.APPEND.name);
	});
    NEW_EA_REQUIRED.addEventListener('click', function() {
		self.ea_manager.createEA(EA_TYPE.REQUIRED.name);
	});
    
    // REMOVE ALL E/A
    REMOVE_ALL_EAS_BTN.addEventListener('click', function() {
        self.context.signals.onAYS.dispatch(Translator.translate("Delete all E/As?"), () => {self.ea_manager.removeAllEAs();});
	});
	// EXPAND ALL E/A
	EXPAND_ALL_EAS_BTN.addEventListener('click', function() {
		self.ea_manager.expand();
	});
    // COLLAPSE ALL E/A
    COLLAPSE_ALL_EAS_BTN.addEventListener('click', function() {
		self.ea_manager.collapse();
	});    

    // -----------------------
    // --- LIST VIEW READY ---
    // -----------------------
    context.signals.onStuffDone.dispatch('EAView ready!');
    context.signals.onProgress.dispatch("EA tab ready!");
}

EAView.prototype = {
    /**
     * Clears everything.
     */
     reset: function() {
    },

    /**
     * == Listener ==
     * The number of EAs changed:
     *      - if none then show message of no E/A else hide it
     * @param {string} new_section Tab ID.
     */    
     checkNumberEAs: function () {
        if (Object.keys(this.ea_manager.eas).length > 0) {
            $(NO_EAS_MSG).hide();
            REMOVE_ALL_EAS_BTN.removeAttribute('disabled');
            COLLAPSE_ALL_EAS_BTN.removeAttribute('disabled');
            EXPAND_ALL_EAS_BTN.removeAttribute('disabled');
        } else {
            $(NO_EAS_MSG).show();
            REMOVE_ALL_EAS_BTN.setAttribute('disabled', "true");
            COLLAPSE_ALL_EAS_BTN.setAttribute('disabled', "true");
            EXPAND_ALL_EAS_BTN.setAttribute('disabled', "true");            
        }
    },    
    

    /**
     * == Listener ==
     * Main tab changed:
     *      - show/hide the respective UI.
     * @param {string} new_section Tab ID.
     */
     tabChanged: function(new_section) {
        if (new_section === VIEWS_TAB_ID.EA) {
            $(EA_VIEW_BUTTONS).show();
        } else {
            $(EA_VIEW_BUTTONS).hide();
        }    
    },    
    
}

