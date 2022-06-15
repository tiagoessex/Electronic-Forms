/**
 *      MAIN SCRIPT
 * 
 *      - IT GLUES ALL VIEWS TOGUETHER
 *      - MAIN AND GLOBAL CONTROLS:
 *              - all header menu ops
 *              - new/load/save/import/export
 *              - preview
 *      - COMMON SIGNALS LISTENERS:
 *              - error
 *              - to save
 *
 * 
 */

// ---------------
// --- STARTUP ---
// ---------------
 const PROGRESS_MODAL = document.getElementById('progress-modal');
//$(PROGRESS_MODAL).modal('show');


// --------
// ---  ---
// --------
import { UIFormElementsMenu } from './ui/UIFormElementsMenu.js';
import { UIPropertiesMenu } from './ui/UIPropertiesMenu.js';
import { Context } from './Context.js';
import { ListView } from './ListView.js';
import { FormView } from './FormView.js';
import { GroupsView } from './GroupsView.js';
import { EAView } from './EAView.js';
import { Form2Json } from './lsp/Form2Json.js';
import { Json2Form } from './lsp/Json2Form.js';
import { DBFields2UIModal } from './modals/DBFields2UIModal.js';
import { PropertiesModal } from './modals/PropertiesModal.js';
import { 
    URL_NEW_FORM, 
    URL_SAVE_FORM, 
    URL_DESIGNER, 
    URL_PREVIEW, 
    URL_GET_EDITABLE_FORM, 
    URL_REMOVE_TEMP } from '/static/js/urls.js';
import { fetchGET, fetchPOST } from '/static/js/Fetch.js';
import { OpenFormModal } from './modals/OpenFormModal.js';
import { ErrorModal } from '/static/js/modals/ErrorModal.js';
import { FieldSelectionModal } from './modals/FieldSelectionModal.js';
import { subStr, getAllNumbers } from '/static/js/jsutils.js';
import { AreYouSureModal } from '/static/js/modals/AreYouSureModal.js';
import { TablesManagerModal } from './modals/TablesManagerModal.js';
import { TimeLoop } from './TimeLoop.js';
import { AutoSaveModal } from './modals/AutoSaveModal.js';
import { Translator } from '/static/js/Translator.js';





// -----------------
// --- CONSTANTS ---
// -----------------

const MODALS_CONTAINER = document.getElementById('modals-container');
const FORM_NAME = document.getElementById('form-name');
const FORM_DATE = document.getElementById('form-creation-date');
const FORM_QUICK_SAVE = document.getElementById('form-quick-save');
const PREVIEW_BTN = document.getElementById('btn-preview');


// ---------------
// --- CONTEXT ---
// ---------------
let context = new Context();
Translator.setLanguage($('#selected-lang-form').val());
/*
document.addEventListener("mousemove", (e) => {
   context.currentMousePos.x = e.clientX;
   context.currentMousePos.y =  e.clientY ;
  });
*/
// -------------------
// --- GLOBAL VARS ---
// -------------------

let isLoading = true;

// -------------
// --- AUTOS ---
// -------------

// auto save - default: 5 minutes
const timer = new TimeLoop(5000 * 60, save);


// ---------------
// --- SIGNALS ---
// ---------------



// listeners
context.signals.onError.add((msg, origin=null) => {
    error_modal.show(msg);
    console.error((origin?origin:'') + msg);
});  
context.signals.onRequireDBFieldSelection.add((callback) => db_property_modal.show(callback));
context.signals.onAYS.add((text, ok_callback, cancel_callback) => ays_modal.show(text, ok_callback, cancel_callback));
context.signals.onProgress.add(msg => {
    $('#progress-text').append(msg + '<br />');
    $('#progress-text').scrollTop(1000);
})

// something changed => show quick save button and status=not saved
// instead of spreading a onChange dispatcher around several files, 
// just use the already existing dispatchers and set a new listener
context.signals.onChange.add(() => {showQuickSaveBtn(true);});
context.signals.onDBFieldSelected.add(() => {showQuickSaveBtn(true);});
context.signals.onPageAdded.add(() => {showQuickSaveBtn(true);});
context.signals.onPageRemoved.add(() => {showQuickSaveBtn(true);});
context.signals.onPagesChanged.add(() => {showQuickSaveBtn(true);}); 
context.signals.onElementMoved.add(() => {showQuickSaveBtn(true);}); 
context.signals.onElementResized.add(() => {showQuickSaveBtn(true);}); 
context.signals.onElementRemoved.add(() => {showQuickSaveBtn(true);}); 
context.signals.onElementCreated.add(() => {showQuickSaveBtn(true);}); 
context.signals.onPropertyChanged.add(() => {showQuickSaveBtn(true);}); 
context.signals.onElementRenamed.add(() => {showQuickSaveBtn(true);});
context.signals.onElementSectionChanged.add(() => {showQuickSaveBtn(true);}); 
//context.signals.onElementGroupChanged.add(() => {showQuickSaveBtn(true);}); 
context.signals.onElementLabelChanged.add(() => {showQuickSaveBtn(true);});
context.signals.onSectionCreated.add(() => {showQuickSaveBtn(true);}); 
context.signals.onSectionNameChanged.add(() => {showQuickSaveBtn(true);});
context.signals.onSectionRemoved.add(() => {showQuickSaveBtn(true);}); 
context.signals.onSectionItemMoved.add(() => {showQuickSaveBtn(true);}); 
context.signals.onGroupCreated.add(() => {showQuickSaveBtn(true);}); 
context.signals.onGroupRemoved.add(() => {showQuickSaveBtn(true);}); 
context.signals.onElementAdded2Group.add(() => {showQuickSaveBtn(true);}); 
context.signals.onElementRemovedFromGroup.add(() => {showQuickSaveBtn(true);});
context.signals.onGroupRenamed.add(() => {showQuickSaveBtn(true);});
context.signals.onTableRemoved.add(() => {showQuickSaveBtn(true);});
context.signals.onTableAdded.add(() => {showQuickSaveBtn(true);});
context.signals.onEACreated.add(() => {showQuickSaveBtn(true);});
context.signals.onEARemoved.add(() => {showQuickSaveBtn(true);});
context.signals.onMultiMoveStoped.add(() => {showQuickSaveBtn(true);});
context.signals.onEAStatusChanged.add(() => {showQuickSaveBtn(true);});



// ---------------------------------------------------------------
// ------------------------------- UI ----------------------------
// ---------------------------------------------------------------

// ----------------
// --- SIDEBARS ---
// ----------------
context.signals.onProgress.dispatch("Preparing the sidebars ...");
const forms_elements_menu = new UIFormElementsMenu(context);
const properties_menu = new UIPropertiesMenu(context);

// -------------
// --- VIEWS ---
// -------------
context.signals.onProgress.dispatch("Preparing the Form View Tab ...");
const form_view = new FormView(context);
context.signals.onProgress.dispatch("Preparing the List View Tab ...");
const list_view = new ListView(context);
context.signals.onProgress.dispatch("Preparing the Groups Tab ...");
const groups_view = new GroupsView(context);
context.signals.onProgress.dispatch("Preparing the E/A Tab ...");
const ea_view = new EAView(context);


// ------------------------------
// --- MAIN AND GLOBAL MODALS ---
// ------------------------------
context.signals.onProgress.dispatch("Preparing global modals ...");

// Global modals => called using signals from anyplace in the program

/**
 * Modal to add database/table fields to forms_elements_menu
 */
const db_add_fields_modal = new DBFields2UIModal(
    Translator.translate('Adding Elements') + ' ...',
    Translator.translate('Select the appropriate database/table field and click Add!'),
    forms_elements_menu.addDBField,
    context
).attachTo(MODALS_CONTAINER);

/**
 * Modal presenting the form's props and change name/desc
 */
const properties_modal = new PropertiesModal(
    Translator.translate("Properties"),
    Translator.translate("Visualize the properties and change both the name and the description!"),
    context,
    (name) => {
        FORM_NAME.innerHTML = subStr(name, 8, 16);
        save();
        showQuickSaveBtn(false);
    },
    save
).attachTo(MODALS_CONTAINER);

/**
 * Modal to chose and open an editable form
 */
const open_form_modal = new OpenFormModal(
    Translator.translate('Open and Edit a Form'),
    Translator.translate('Select a form with the cursor! Attention: only editable forms are visible!'),
    (id) => {
        window.location.href = URL_DESIGNER + id;
    }
).attachTo(MODALS_CONTAINER);

/**
 * Global Modal to get database/table fields path
 */
const db_property_modal = new FieldSelectionModal(
    Translator.translate('Database Field Connection'),
    Translator.translate('Select the appropriate database field!'),
    () => {},
    context
).attachTo(MODALS_CONTAINER);

/**
* Error modal.
* Triggered by onError signal.
*/
const error_modal = new ErrorModal().attachTo(MODALS_CONTAINER);

/**
 * Are you sure modal.
 * Triggered by onAYS signal.
 */
const ays_modal = new AreYouSureModal().attachTo(MODALS_CONTAINER);

/**
 * Tables manager.
 */
const tables_manager_modal = new TablesManagerModal(
    Translator.translate('Tables Manager'),
    '',
    context,
).attachTo(MODALS_CONTAINER);

/**
 * Auto save modal
 */
 const auto_save_modal = new AutoSaveModal(
    Translator.translate('Auto Save'),
    Translator.translate('Configure and press OK'),
    (time) => {
        if (timer) {
            timer.setDelta(time);
            timer.start();
        }
    },
    () => {
        if (timer) timer.stop();
    }
).attachTo(MODALS_CONTAINER);
 

// ---------------
// --- PREVIEW ---
// ---------------


PREVIEW_BTN.addEventListener('click', function() {
    save(() => {
        window.open(URL_PREVIEW + context.properties.id, "_blank");
        }
    );        
})


// -----------------
// --- VIEWS TAB ---
// -----------------

/**
 * ON CHANGING TABS: 
 *      - UNSELECT ANY SELECTED ELEMENT
 *      - SHOW/HIDE RESPECTIVE VIEW'S STUFF
 *      - ...
 */ 

const tab = $("a[data-toggle='tab'].active");
var old_selected_tab = tab[0].id;    
$("#main-tab li").click(function(e){
    e.preventDefault();
    const new_selected_tab = $(e.target).closest( "a" ).attr('id');
    if (old_selected_tab != new_selected_tab) {
        context.signals.onMainTabChanged.dispatch(new_selected_tab);
        old_selected_tab = new_selected_tab;
    }
});



// ----------------
// --- TOP MENU ---
// ----------------


/**
 * NEW FORM:
 *      - UNSELECT ANY SELECTED ELEMENT
 *      - DELETE ALL PAGES AND ELEMENTS
 *      - ADD NEW PAGE
 */
document.getElementById('menu-new').addEventListener('click', function() {
    if (context.isEmpty() || context.isSaved) {
        window.location.href = URL_DESIGNER;
    } else {
        context.signals.onAYS.dispatch(Translator.translate("Discard changes?"), () => {
            window.location.href = URL_DESIGNER;
        });        
    }
    
});

document.getElementById('menu-open').addEventListener('click', function() {
    if (context.isEmpty() || context.isSaved) {
        open_form_modal.show();
    } else {
        context.signals.onAYS.dispatch(Translator.translate("Discard changes?"), () => {
            open_form_modal.show();
        });        
    }
});

// to lazy to do the loop in pure js
$('.menu-save').on('click', function() {
    save();        
});


$('.properties').on('click', function() {
    properties_modal.show(Translator.translate("Press Ok to apply any change in the name and/or the description!"));
}) 

document.getElementById('menu-tables').addEventListener('click', function() {
    tables_manager_modal.show();
});

document.getElementById('menu-add-fields').addEventListener('click', function() {
    db_add_fields_modal.show();
});

document.getElementById('menu-auto-save').addEventListener('click', function() {
    auto_save_modal.show();
});

document.getElementById('form-reload').addEventListener('click', function() {
    save(() => {
            window.location.href = '/designer/' + context.properties.id;
        }
    );       
});



// -------------------------
// --- QUICK SAVE BUTTON ---
// -------------------------

function showQuickSaveBtn(show=true) {  
    if (isLoading) return;
    if (show && $(FORM_QUICK_SAVE).is(':hidden')) {        
        $(FORM_QUICK_SAVE).show();
    } else if (!show) {
        $(FORM_QUICK_SAVE).hide();
    }
    context.isSaved = !show;
}



// --------------------------
// --- LANGUAGE SELECTION ---
// --------------------------

function setFlag(language_code=null) {
    if (!language_code) language_code = $('#selected-lang-form').val();
    //$('#selected-language').removeClass();
    $('#selected-language').addClass('flag-icon');
    $('#selected-language').addClass('flag-icon-' + language_code);
}

$('.language-select').click(function(e) {
    const sprache = $(this).attr('data-lang');
    if (sprache === $('#selected-lang-form').val()) return false;
    context.signals.onAYS.dispatch(Translator.translate("Selecting a new language will cause the editor to reload. Continue?"), () => {        
        setFlag(sprache);
        $('#selected-lang-form').val(sprache);
        $('#lang-select-form').submit();
    });    
});



// ---------------------------------------------------------------
// ------------------------- OPERATIONS --------------------------
// ---------------------------------------------------------------

// -------------------------
// --- NEW / LOAD / SAVE ---
// -------------------------



/**
 * If the hidden field has an id, then open the form that has that id
 * else, just default (new).
 */

if ($('#form-id-hidden').val() !== '') {
    const form_id = $('#form-id-hidden').val();
    context.properties.is_temp = false;
    isLoading = true;
    openForm(form_id);
} else {
    context.properties.is_temp = true;
    isLoading = false;
    newForm();
}


/**
 * Displays the title and creation date in the info panel.
 */
function setInfo() {
    FORM_DATE.innerHTML = context.properties.date_created.split('T')[0];
    FORM_NAME.innerHTML = subStr(context.properties.name, 8, 16);
}

/**
 * New form:
 *      1 - create a random name
 *      2 - create a new form, as temporary
 */
function newForm() {
	$("body").css("cursor","progress");
    context.signals.onProgress.dispatch("Preparing a <b>new form</b> ...");
    const temp_name = uuidv4();
    context.properties.name = temp_name;

    fetchPOST(URL_NEW_FORM,
        {
            name: temp_name,  // --- TODO --- remove this and create a set properties func
            //is_temp: (context.properties.is_temp)?'T':'F',
        },
        (result) => {
            //const data = JSON.parse(result.data)[0];
            context.properties.created_by = result.author_name;
            context.properties.updated_by = result.updated_by_name;
            context.properties.date_created = result.date_created.split('T')[0];
            context.properties.id = result.id;
            showQuickSaveBtn(true);
            
            //if (!context.properties.is_temp) { // not temporary
            //    properties_modal.show("Input a name for the form (required) and a description!");
            //    context.properties.is_temp = false;
           // }
            form_view.pages_manager.addPage();
            setInfo(); 
            closeProgress();
            $("body").css("cursor","auto");
        },
        (error) => {
			$("body").css("cursor","auto");
            $(PROGRESS_MODAL).modal('hide');
            context.signals.onError.dispatch(error,"[main::newForm]");
        }
    );
}

/**
 * Opens a form with pk=id.
 * @param {number} id Form id.
 */
function openForm(id) {
	$("body").css("cursor","progress");
    context.signals.onProgress.dispatch("<b>Loading form</b> ...");
    context.signals.onLoadStarted.dispatch();
    context.isLoading = true;
    const url = URL_GET_EDITABLE_FORM + id + '/';
    fetchGET(url, 
        (result) => {
            context.properties.id = result.id;
            context.properties.name = result.name;
            context.properties.description = result.description;
            context.properties.created_by = result.author_name;
            context.properties.updated_by = result.updated_by_name;
            context.properties.date_updated = result.date_updated;
            context.properties.date_created = result.date_created;
            new Json2Form(context, result.form, form_view, list_view, groups_view, ea_view, context.properties);
            // invalid form => no pages => add a page
            if (form_view.pages_manager.getTotalPages() == 0) {
                form_view.pages_manager.addPage();
            }
            setInfo();
            context.signals.onLoadEnded.dispatch();
            context.isLoading = false;
            isLoading = false;
            //showQuickSaveBtn(false);
            closeProgress();
            form_view.pages_manager.gotoPage(0);
            showQuickSaveBtn(false);
            $("body").css("cursor","auto");
        },
        (error) => {
            //console.log(error);
            $("body").css("cursor","auto");
            $(PROGRESS_MODAL).modal('hide');
            if (error.hasOwnProperty('message')) {
                if (getAllNumbers(error.message.toString())[0] == 404) {
                    context.signals.onError.dispatch(Translator.translate("Unable to open the form. Does it exist and is it EDITABLE/TEMPORARY? Contact an administrator!"),"[main::openForm]");
                } else {
                    context.signals.onError.dispatch(error.message + ". Contact an administrator!","[main::openForm]");
                }
            } else {
                context.signals.onError.dispatch(Translator.translate("Critical Error! Possible Errors: the form is not editable, it does not exists, it has an invalid format or some unknown error! Contact an administrator!"),"[main::openForm]");
            }            
            context.signals.onLoadEnded.dispatch();
        })

}


/**
 * Saves the current form. 
 * If temporary, then it becomes permanent.
 * @param {function} callback_on_success Callback function to be called when finished.
 */
function save(callback_on_success=()=>{}) {	
    form_view.unselectElement();
    //form_view.saveProps();
    const json = new Form2Json(form_view, list_view, groups_view, ea_view, context.properties);
    let data = null;
    try {
        data = json.getJson();
    } catch (error) {
        context.signals.onError.dispatch(error,"[main::save]");
        return;
    }
    context.properties.is_temp = false;
    $("body").css("cursor","progress");

        fetchPOST(URL_SAVE_FORM,
            {
                id: context.properties.id,
                name: context.properties.name,
                description: context.properties.description,
                form: data,
            },
            (result) => {
                context.properties.isSaved = true;
                showQuickSaveBtn(false);
                context.properties.updated_by = result.updated_by;
                context.properties.date_updated = result.date_updated;
                callback_on_success();
                $("body").css("cursor","auto");
                context.signals.onSaved.dispatch();
            },
            (error) => {
				$("body").css("cursor","auto");
                if (getAllNumbers(error.toString())[0] == 403)
                    context.signals.onError.dispatch(Translator.translate('Form is locked. You cannot edit it anymore!'),"[main::save]");
                else
                    context.signals.onError.dispatch(error,"[main::save]");
            }
        );
}


// ------------------------
// --- CLOSING DESIGNER ---
// ------------------------

// DELETE IF STILL TEMPORARY  
const deleteIfTemp = () => {
    fetchPOST(URL_REMOVE_TEMP,
        {
            id: context.properties.id
        },
        ()=> {},
        (error) => {
            //console.warn("[main::deleteIfTemp] ", error);
        },
    );
}

// for Chrome
$(window).on('beforeunload', function (e) {
    e.preventDefault;
    if (!(typeof timer === 'undefined' || timer === null)) timer.stop();
    if (context.properties.is_temp)
        deleteIfTemp();
});
// for the others (opera?)
$(window).on("unload", function (e) {
    e.preventDefault;
    if (!(typeof timer === 'undefined' || timer === null)) timer.stop();
    if (context.properties.is_temp)
        deleteIfTemp();
});



// -------------------------
// --- ALL SET AND READY ---
// -------------------------
/*
$(function() {
    // hide spinner
    $('#designer-main-spinner').hide();
});
*/

function closeProgress() {
    context.signals.onProgress.dispatch('<br/><span class="text-center"><h3>READY!</h3></span>');
    setTimeout(function() {$(PROGRESS_MODAL).modal('hide');}, 1000);
}
