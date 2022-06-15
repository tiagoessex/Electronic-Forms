import { VIEWS_TAB_ID } from './constants/constants.js';
import { GroupsManager } from './groups/GroupsManager.js';
import { Translator } from '/static/js/Translator.js';


const GROUPS_VIEW_BUTTONS = document.querySelector('.groups-view-ui');
const NEW_GROUP_BTN = document.getElementById('btn-new-group');
const REMOVE_ALL_GROUPS_BTN = document.getElementById('btn-remove-all-groups');
const EXPAND_ALL_GROUPS_BTN = document.getElementById('btn-expand-all-groups');
const COLLAPSE_ALL_GROUPS_BTN = document.getElementById('btn-collapse-all-groups');
const NO_GROUPS_MSG = document.getElementById('no-groups-msg');

/**
 * Groups tab view.
 * @param {Context} context Context.
 */
export function GroupsView(context) {
    this.context = context; 
    const self = this;

    context.signals.onProgress.dispatch("Setting up the Groups tab ...");

    // ----------------
    // --- MANAGERS ---
    // ----------------

    this.groups_manager = new GroupsManager(context);
    
    // ------------
    // --- INIT ---
    // ------------
    this.checkNumberGroups();
    
    // -------------------------
    // --- SET THE LISTENERS ---
    // -------------------------
    context.signals.onMainTabChanged.add(this.tabChanged, this);
    context.signals.onGroupCreated.add(this.checkNumberGroups, this);
    context.signals.onGroupRemoved.add(this.checkNumberGroups, this);
          
    
    // ------------------------------------
    // --- GROUPS VIEW SPECIFIC BUTTONS ------
    // ------------------------------------

	// ADD A NEW GROUP
	NEW_GROUP_BTN.addEventListener('click', function() {
		self.groups_manager.createGroup();
	});
    // REMOVE ALL GROUPS
    REMOVE_ALL_GROUPS_BTN.addEventListener('click', function() {
        self.context.signals.onAYS.dispatch(Translator.translate("Delete all groups?"), () => {self.groups_manager.removeAllGroups()});
	});
	// EXPAND ALL GROUPS
	EXPAND_ALL_GROUPS_BTN.addEventListener('click', function() {
		self.groups_manager.expand();
	});
    // COLLAPSE ALL GROUPS
    COLLAPSE_ALL_GROUPS_BTN.addEventListener('click', function() {
		self.groups_manager.collapse();
	});    


    // -----------------------
    // --- LIST VIEW READY ---
    // -----------------------
    context.signals.onStuffDone.dispatch('GroupsView ready!');
    context.signals.onProgress.dispatch("Groups tab ready!");
}

GroupsView.prototype = {
    /**
     * Clears everything.
     */
     reset: function() {
         // --- TODO --- MISSING REMOVALS
        this.groups_manager.clear();
    },

    /**
     * == Listener ==
     * The number of groups changed:
     *      - if none then show message of no group else hide it
     * @param {string} new_section Tab ID.
     */    
    checkNumberGroups: function () {
        if (Object.keys(this.groups_manager.groups).length > 0) {
            $(NO_GROUPS_MSG).hide();
            EXPAND_ALL_GROUPS_BTN.removeAttribute('disabled');
            COLLAPSE_ALL_GROUPS_BTN.removeAttribute('disabled');
            REMOVE_ALL_GROUPS_BTN.removeAttribute('disabled');            
        } else {
            $(NO_GROUPS_MSG).show();
            EXPAND_ALL_GROUPS_BTN.setAttribute('disabled', "true");
            COLLAPSE_ALL_GROUPS_BTN.setAttribute('disabled', "true");
            REMOVE_ALL_GROUPS_BTN.setAttribute('disabled', "true");
        }
    },

    /**
     * == Listener ==
     * Main tab changed:
     *      - show/hide the respective UI.
     * @param {string} new_section Tab ID.
     */
    tabChanged: function(new_section) {
        if (new_section === VIEWS_TAB_ID.GROUPS) {
            $(GROUPS_VIEW_BUTTONS).show();
        } else {
            $(GROUPS_VIEW_BUTTONS).hide();
        }    
    },   
    
}

