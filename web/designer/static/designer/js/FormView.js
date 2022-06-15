
import { UIPropertiesMenu } from './ui/UIPropertiesMenu.js';
import { PagesManager } from './pages/PagesManager.js';
import { PagesManagerModal } from './modals/PagesManagerModal.js';
import { RasterModal } from './modals/RasterModal.js';
import { 
    PROPERTIES_ID, 
    VIEWS_TAB_ID
} from './constants/constants.js';
import { ELEMENTS_TYPE, ELEMENT } from './elements/constants.js';
import { GROUP_TYPE, DEFAULT_GROUP_ID } from './groups/constants.js';
import { ElementsManager } from './elements/ElementsManager.js';
import { PatternsModal } from './modals/PatternsModal.js';
import { ItemsModal } from './modals/ItemsModal.js';
import { DropBoxElementsManager } from './elements/DropBoxElementsManager.js';
import { ImageModal } from './modals/ImageModal.js';
import { TextModal } from './modals/TextModal.js';
import { subStr } from '/static/js/jsutils.js';
import { SelectionMarquee } from './selection/SelectionMarquee.js';
import { MultiSelection } from './selection/MultiSelection.js';
import { PagesCounterDisplay } from './pages/PagesCounterDisplay.js';
import { PagesScroller } from './pages/PagesScroller.js';
import { Grid } from './grid/Grid.js';
import { Lock } from './elements/Lock.js';
import { PropertyTabActions } from './PropertyTabActions.js';
import { RepeatablesElementsManager } from './elements/RepeatablesElementsManager.js';
import { Zoom } from './pages/Zoom.js';
import { DELTA_C_R_X, DELTA_C_R_Y, MAX_Y_C_R } from './constants/limits.js';
import { Translator } from '/static/js/Translator.js';
import { MULTISELECTION_CLASS } from './selection/constants.js';
import { toggleClass } from '/static/js/jshtml.js';
import { Brush } from './Brush.js';
import { TableElementMenu } from './ui/TableElementMenu.js';


const ADD_PAGE_BTN = document.getElementById('btn-add-page');    
const REMOVE_PAGE_BTN = document.getElementById('btn-remove-page');
const REMOVE_ALL_PAGES_BTN = document.getElementById('btn-remove-all-pages');
const PREVIOUS_PAGE_BTN = document.getElementById('btn-previous-page');
const NEXT_PAGE_BTN = document.getElementById('btn-next-page');
const ADD_RASTER_IMAGE_BTN = document.getElementById('btn-add-raster-image');
const REMOVE_RASTER_IMAGE_BTN = document.getElementById('btn-remove-raster-image');
const DELETE_SELECTED_ELEMENT_BTN = document.getElementById('btn-delete-element');
const CLONE_SELECTED_ELEMENT_BTN = document.getElementById('btn-clone-element');
const PAGES_MANAGER_BTN = document.getElementById('btn-pages-manager');
const MODALS_CONTAINER = document.getElementById('modals-container');
const FORM_VIEW_BUTTONS = document.querySelector('.form-view-ui');
const ZOOM_IN_BTN = document.getElementById('btn-zoom-in');
const ZOOM_OUT_BTN = document.getElementById('btn-zoom-out');  
 
const TOGGLE_FORM_IN_MENU_BTN = document.getElementById('btn-form-in-menu');    
const FORM_IN_MENU = document.getElementById('form-in-menu');

const LOCK_ELEMENTS_BTN = document.getElementById('btn-lock-elements');
const LOCK_ALL_PAGE_ELEMENTS_BTN = document.getElementById('btn-lock-all-page-elements');
const LOCK_ALL_ELEMENTS_BTN = document.getElementById('btn-lock-all-elements');
const UNLOCK_ELEMENTS_BTN = document.getElementById('btn-unlock-elements');
const UNLOCK_ALL_PAGE_ELEMENTS_BTN = document.getElementById('btn-unlock-all-page-elements');
const UNLOCK_ALL_ELEMENTS_BTN = document.getElementById('btn-unlock-all-elements');

const CREATE_CHAIN_BTN = document.getElementById('btn-create-chain');
const BREAK_CHAIN_BTN = document.getElementById('btn-break-chain');

const CLONE_ELEMENTS_NEXT_BTN = document.getElementById('btn-clone-elements-next-page');
const CLONE_ELEMENTS_PREVIOUS_BTN = document.getElementById('btn-clone-elements-previous-page');
const MOVE_ELEMENTS_NEXT_BTN = document.getElementById('btn-move-elements-next-page');
const MOVE_ELEMENTS_PREVIOUS_BTN = document.getElementById('btn-move-elements-previous-page');

const BRUSH_BTN = document.getElementById('btn-brush');

const DELTA_CLONE = 20;    // delta +x and +y from original to cloned element


const CHANGES = Object.freeze({
    PAGES: 0,
    SELECTION: 1,
    ELEMENTS: 2,
});

/**
 * Forms tab view.
 * @param {Context} context Context
 */
export function FormView(context) {
    // ------------
    // --- INIT ---
    // ------------ 
    this.context = context;
    this.selected_elements = [];            // currently selected elements
    // required because onPropertyChanged can be called after unselectelement => incorrect behaviour
    // example of when this can happen: change the name of an element and instead of enter just clicking
    // in the page. Without this hack, the props. will be save with the correct change, but without a visual change
    // by keeping the last selected elements we can garantee that onPropertyChanged will be applied
    // even after deselection
    this.last_selected_elements = [];       // previously selected elements
    const self = this;
    this.isBrushActive = false;                    // currently copy/paste the format?

    // nothing selected => no properties showing
    UIPropertiesMenu.setPropertiesVisibility(ELEMENTS_TYPE.NONE);

    context.signals.onProgress.dispatch("Setting up the FormView tab ...");


    // -------------------
    // --- PAGES STUFF ---
    // -------------------    
    // pages manager
    this.pages_manager = new PagesManager(context);
    this.pages_manager.init();
    context.pages_manager = this.pages_manager;
    this.zoom = new Zoom(context);


    // if browser zoom => same as scrolling => determine the current page
    window.onresize = function onresize() {
        context.signals.onPagesScrolled.dispatch(true);
    }

    // ------------------------------------
    // --- FORMVIEW SPECIFIC BUTTONS ------
    // ------------------------------------
    ADD_PAGE_BTN.addEventListener("click",() => {
        self.unselectElement();
        self.pages_manager.addPage(false);
    });
    REMOVE_PAGE_BTN.addEventListener("click",() => {self.pages_manager.removeCurrentPage();});
    REMOVE_ALL_PAGES_BTN.addEventListener("click",() => {
        self.context.signals.onAYS.dispatch(Translator.translate("Delete all pages?"), () => {self.pages_manager.removeAllPages()});
    });    
    PREVIOUS_PAGE_BTN.addEventListener("click",() => {self.pages_manager.gotoPreviousPage();});
    NEXT_PAGE_BTN.addEventListener("click",() => {self.pages_manager.gotoNextPage();});
    PAGES_MANAGER_BTN.addEventListener("click",() => {
        // unselect otherwise the page properties of the selected elements will
        // preserve their numbers after any swap
        self.unselectElement();
        self.pages_modal.show();
    });
    ADD_RASTER_IMAGE_BTN.addEventListener("click",() => {self.raster_modal.show();});
    REMOVE_RASTER_IMAGE_BTN.addEventListener("click",() => {
        const current_page = self.pages_manager.getCurrentPageNumber();
        self.pages_manager.setRasterImage('',current_page-1);
    });
    ZOOM_IN_BTN.addEventListener("click", ()=> {
        self.zoom.zoomOut();       
    });
    ZOOM_OUT_BTN.addEventListener("click", ()=> {
        self.zoom.zoomIn();
    });
    
    /**
     * DELETE ALL SELECTED ELEMENTS
     */
    DELETE_SELECTED_ELEMENT_BTN.addEventListener("click",() => {
        self.removeSelected();
    });
    
    document.addEventListener('keyup', function(event) {
        if (event.code == 'Delete') {
            // necessary otherwise, when del while in properties tab => also delete the element
            if (!document.activeElement.classList.contains(ELEMENT) && 
                !document.activeElement.classList.contains(MULTISELECTION_CLASS)) return;
                
            self.removeSelected();
        }
    });    


    /**
     * CLONE SELECTED ELEMENT
     * TODO - clone all selected elements
     */
     CLONE_SELECTED_ELEMENT_BTN.addEventListener("click",() => {      
        if (this.selected_elements.length == 1) {
            self.cloneSelectedElement();
        } else if (this.selected_elements.length > 1) {
            self.cloneAllSelectedElement();
        }
    });

    /**
     * TOGGLE GRID MENU VISIBILITY
     */
    TOGGLE_FORM_IN_MENU_BTN.addEventListener("click",() => {
        if (FORM_IN_MENU.classList.contains('show'))
            FORM_IN_MENU.classList.remove('show');
        else
            FORM_IN_MENU.classList.add('show');
    });


    /**
     * LOCK ALL SELECTED ELEMENTS
     */
    LOCK_ELEMENTS_BTN.addEventListener("click",() => {
        const elements = self.selected_elements;
        this.unselectElement();
        self.lock.lock(elements);
        UIPropertiesMenu.setPropertiesVisibility(ELEMENTS_TYPE.NONE);
    });

    /**
     * LOCK ALL ELEMENTS IN PAGE
     */
    LOCK_ALL_PAGE_ELEMENTS_BTN.addEventListener("click",() => {
        //self.lock.lockPage(self.pages_manager.getCurrentPageID());
        self.lock.lockPage(self.pages_manager.getCurrentPageNumber());
        UIPropertiesMenu.setPropertiesVisibility(ELEMENTS_TYPE.NONE);
    });

    /**
     * LOCK ALL ELEMENTS
     */
     LOCK_ALL_ELEMENTS_BTN.addEventListener("click",() => {
        self.lock.lockAll();
        UIPropertiesMenu.setPropertiesVisibility(ELEMENTS_TYPE.NONE);
    });
    

    /**
     * UNLOCK ALL SELECTED ELEMENTS
     */
    UNLOCK_ELEMENTS_BTN.addEventListener("click",() => {
        self.lock.unlock(self.selected_elements);
        if (self.selected_elements.length == 0)
            UIPropertiesMenu.setPropertiesVisibility(self.selected_elements[0].type);
        else
            self.setMultiple();
    });

    /**
     * UNLOCK ALL ELEMENTS IN PAGE
     */
    UNLOCK_ALL_PAGE_ELEMENTS_BTN.addEventListener("click",() => {
        //self.lock.unlockPage(self.pages_manager.getCurrentPageID());
        self.lock.unlockPage(self.pages_manager.getCurrentPageNumber());
    });

    /**
     * UNLOCK ALL ELEMENTS
     */
    UNLOCK_ALL_ELEMENTS_BTN.addEventListener("click",() => {
        self.lock.unlockAll();
    });


    /**
     * SET ALL SELECTED ELEMENTS (THOSE ALLOWED) AND CREATE NEW CHAINS OF REPEATABLE ELEMENTS.
     * THEN "REPEAT" THEM THROUGHOUT ALL EXISTING PAGES.
     * 
     * Only dispatch a signal after all elements are set to repeatable.
     */
    CREATE_CHAIN_BTN.addEventListener("click",() => { 
        if (self.selected_elements.length == 0) return;
        let dispatch = false;
        const element_2_clone = [...self.selected_elements];
        self.unselectElement();
        let current_page = null;
        element_2_clone.forEach(element => {
            if (!element.type.availability.repeatable) return false;
            if (!element.isRepeatable() && !element.isLocked()) {
                element.setRepeatable(true);
                const chain = self.repeated_elements_manager.createChain(element.dom.id);
                
                // clone element and repeat it throughout all existing pages
                const pages = self.pages_manager.getPages();
                current_page = element.getParent();
                for (let i=0; i<pages.length; i++) {
                    if (current_page.id === pages[i].id) continue;
                    const cloned_element = this.clone(element, pages[i], false);
                    cloned_element.setRepeatable(true);
                    this.repeated_elements_manager.addElement(cloned_element.dom.id, chain)
                }
                dispatch = true;
            }
        });
        
        if (element_2_clone.length > 1) {
            self.multi_selection.select(element_2_clone, current_page?current_page:element_2_clone[0].getParent());        
            self.setMultiple();
        } else {
            self.elementSelected(element_2_clone[0])
        }        

        if (dispatch) context.signals.onRepeatableCreated.dispatch();
    });


    /**
     * IF ANY SELECTED ELEMENTS IS REPEATABLE, THEN MAKE IT REPEATBLE NO MORE.
     * NOTE: ALL ELEMENTS IN THE CHAIN STILL REMAIN REPEATABLE.
     */
    BREAK_CHAIN_BTN.addEventListener("click",() => {
        self.selected_elements.forEach(element => {
            if (element.isRepeatable()) {
                element.setRepeatable(false);
                self.repeated_elements_manager.removeElement(element.dom.id);
            }
        })        
    });

    /**
     * CLONE ALL SELECTED ELEMENTS AND PUT THEM IN THE NEXT PAGE.
     */
    CLONE_ELEMENTS_NEXT_BTN.addEventListener("click",() => {
        if (self.selected_elements.length == 0) return;
        const page_id = self.selected_elements[0].getParent().id;
        const current_page_number = self.pages_manager.getPageNumberFromID(page_id);
        const next_page = self.pages_manager.getPage(current_page_number + 1);
        if (!next_page) return;        
        if (self.selected_elements.length == 1) {
            self.cloneSelectedElement(next_page, false);
        } else if (self.selected_elements.length > 1) {
            self.cloneAllSelectedElement(next_page, false);            
        }
        this.pages_counter.update();
    });

    /**
     * CLONE ALL SELECTED ELEMENTS AND PUT THEM IN THE PREVIOUS PAGE.
     */
    CLONE_ELEMENTS_PREVIOUS_BTN.addEventListener("click",() => {
        if (self.selected_elements.length == 0) return;
        const page_id = self.selected_elements[0].getParent().id;
        const current_page_number = self.pages_manager.getPageNumberFromID(page_id);
        const previous_page = self.pages_manager.getPage(current_page_number - 1);
        if (!previous_page) return;        
        if (self.selected_elements.length == 1) {
            self.cloneSelectedElement(previous_page, false);
        } else if (self.selected_elements.length > 1) {
            self.cloneAllSelectedElement(previous_page, false);            
        }
        this.pages_counter.update();
    });

    /**
     * MOVE ALL SELECTED ELEMENTS TO THE NEXT PAGE.
     */
    MOVE_ELEMENTS_NEXT_BTN.addEventListener("click",() => {
        const element_2_move = [...self.selected_elements];
        self.unselectElement();  
        const target = self.moveElements2RelativePage(element_2_move, 1); 
        if (target) {
            if (element_2_move.length > 1) {
                self.multi_selection.select(element_2_move, target?target:self.pages_manager.getCurrentPage());
                self.selected_elements = element_2_move;            
                self.setMultiple();         
            } else {
                self.elementSelected(element_2_move[0])
            }
        }
        this.pages_counter.update();
    });

    /**
     * MOVE ALL SELECTED ELEMENTS TO THE PREVIOUS PAGE.
     */
    MOVE_ELEMENTS_PREVIOUS_BTN.addEventListener("click",() => {
        const element_2_move = [...self.selected_elements];
        self.unselectElement();        
        const target = self.moveElements2RelativePage(element_2_move, -1);      
        if (target) {
            if (element_2_move.length > 1) {
                self.multi_selection.select(element_2_move, target?target:self.pages_manager.getCurrentPage());
                self.selected_elements = element_2_move;            
                self.setMultiple();         
            } else {
                self.elementSelected(element_2_move[0])
            }
        }
        this.pages_counter.update();
    });

    /**
     * COPY/PASTE FORMATING
     */
    BRUSH_BTN.addEventListener("click",() => {
        if (self.isBrushActive) {
            self.isBrushActive = false;
            $("body").css("cursor","auto");
            toggleClass(BRUSH_BTN, 'btn-danger','btn-primary');
            BRUSH_BTN.classList.remove('pulsate-opacity');
            // now that brush is not active and no elements are selected, disable button
            if (self.selected_elements.length == 0) {
                BRUSH_BTN.setAttribute('disabled','true');
            }
        } else {
            self.isBrushActive = true;
            $("body").css("cursor","pointer");
            toggleClass(BRUSH_BTN, 'btn-primary','btn-danger');
            BRUSH_BTN.classList.add('pulsate-opacity');
            // if more than one element is selected
            // then only copy the format of the first selected element
            if (self.selected_elements.length > 0) {
                self.brush.copy(self.selected_elements[0]);
            }             
        }        
     });



    // ----------------
    // --- ELEMENTS ---
    // ----------------

    // the master elements manager
    this.elements_manager = new ElementsManager(this.context);

    // a manager only for dropdown elements
    // this manager manages the items/options and which one is selected by default
    this.dopbox_elements_manager = new DropBoxElementsManager(this.context);    

    // manager for all repeated elements
    this.repeated_elements_manager = new RepeatablesElementsManager(this.context);

    // manages the lock/unlock of elements
    this.lock = new Lock(this.context);

    // brush to copy/paste the format values from one element to others
    this.brush = new Brush();

    // table elements menu
    this.table_element_menu = new TableElementMenu(this.context);

    // -----------------
    // --- SELECTION ---
    // -----------------

    this.shift = false;
    document.addEventListener('keydown', function (e) {
        if (e.shiftKey) {
           self.shift = true;
        }
    });
    document.addEventListener('keyup', function (e) {
        self.shift = false;
    });


    // selection marquee
    this.multi_selection = new MultiSelection(this.context);
    new SelectionMarquee(this.context,  
        () => {
            if (!self.shift) {
                this.unselectElement();
                this.onSomethingChanged(CHANGES.SELECTION);
            }
        }, 
        (elements, page) => {
            if (self.shift) {
                if (elements.length > 0) {
                    this.shiftSelectElements(elements);
                }
                return;
            }
            if (elements.length > 1) {
                // paste format?
                if (this.isBrushActive) {
                    this.brush.paste(this.context, elements);
                }
                this.unselectElement();
                this.setMultiple();
                this.selected_elements = elements;
                this.multi_selection.select(elements, page);
            } else if (elements.length == 1) {
                this.elementSelected(elements[0]);
            }
            this.onSomethingChanged(CHANGES.SELECTION);
        }
    );



    // --------------------------------
    // --- ELEMENTS - DRAG AND DROP ---
    // --------------------------------
    // dragged from FIELDS to PAGE.
    // when dropped inside a page => create the respective element
    // it requires to determine the drop position relative to the the page
    $(document).on('drop','.page',function(event, ui) {
        self.unselectElement();
        $(".page").css("cursor","progress");
        const page_id = $(event.target).attr('id');
        const page_number = self.pages_manager.getPageNumberFromID(page_id);
        const page = self.pages_manager.getPage(page_number);
        const type = ELEMENTS_TYPE[$(ui.draggable).data('type')];
        const data = $(ui.draggable).data('data');
        const rect = page.getBoundingClientRect();

        // snap to grid
        const grid_s = context.grid * self.context.zoom;
        const _top_drop = Math.round((ui.position.top - rect.top) / grid_s) * grid_s;
        const _top_left = Math.round((ui.position.left - rect.left) / grid_s) * grid_s;
        const top = Math.round(_top_drop/ self.context.zoom);
        const left = Math.round(_top_left / self.context.zoom); 

        // create the element
        // because it was dropped, the element has no properties yet        
        const new_element = self.elements_manager.createElement(type, null, left, top, page, data);

        // has data => DB Field
        // if dropdown, and has data, update the data
        if (data && data.hasOwnProperty('values')) {
            if (type === ELEMENTS_TYPE.DROPDOWN) {
                const [database, table, column] = data['db'].split(':');
                self.dopbox_elements_manager.updateElement(new_element.dom.id, 'database', null, null, table, column, database, data['unique']);
            } else if (type === ELEMENTS_TYPE.RADIO || type === ELEMENTS_TYPE.CHECKBOX) {
                const r_c = [];
                let y = 0;
                let x = 0;
                const group = self.context.groups_manager.createGroup();
                group.setDatabaseField(data['db']);
                // creating many => performance issues caused by the cloning and updating
                // of all the elements selection lists in both the groups and ea
                // so, lock the list and after all done, unlocked and create list
                // performace gain example: 
                //  no lock:
                //      total lists to update: 20
                //      total elements to add: 5
                //      total EA recreations: 20x5x2 = 200
                //      total EA clonings: 20x5 = 100
                //      total groups recreations: 20x5 = 100
                //  with lock:
                //      total lists to update: 20
                //      total elements to add: 5
                //      total EA recreations: 1         => 200x
                //      total EA clonings: 20           => 5x
                //      total groups recreations: 1     => 100x
                self.context.signals.onLockEAList.dispatch();
                self.context.signals.onLockGroupsList.dispatch();
                let n_y = 0;
                data['values'].forEach(value => {
                    const cloned = self.clone(new_element, null, true, x, y);
                    group.addElement(cloned.dom.id, value, type.name);
                    r_c.push(cloned);
                    y += DELTA_C_R_Y;
                    n_y++;
                    if (n_y >= MAX_Y_C_R) {
                        n_y = 0;
                        x += DELTA_C_R_X;
                        y = 0;
                    }
                    cloned.props[PROPERTIES_ID.LABELPROPERTY] = value;
                    cloned.props[PROPERTIES_ID.NAMEPROPERTY] = value;
                    cloned.setLabel(value);
                    self.context.signals.onElementRenamed.dispatch(cloned, value);
                    self.context.signals.onElementLabelChanged.dispatch(cloned, value);
                });
                self.context.signals.onUnlockEAList.dispatch();
                self.context.signals.onUnlockGroupsList.dispatch();

                self.elements_manager.removeElement(new_element);
                // required to send this signal, otherwise it messes with the CRSelector
                self.context.signals.onCheckRadioChanged.dispatch();

                self.setMultiple();
                self.multi_selection.select(r_c, page); 
                self.selected_elements = r_c;
                $(".page").css("cursor","auto");
                return;
            }
        }
        // and select the dropped element
        self.elementSelected(new_element);
        $(".page").css("cursor","auto");
    } ); 




    // ----------------
    // --- DIVERSOS ---
    // ----------------
 

    this.pages_counter = new PagesCounterDisplay(context, this.pages_manager.findCurrentPage, this.pages_manager.getTotalPages);
    new PagesScroller(context);
    new Grid(context);


    // --------------
    // --- MODALS ---
    // --------------
    context.signals.onProgress.dispatch("Preparing FormView tab modals");

    // --- PAGE MANAGEMENT MODAL ---

    this.pages_modal = new PagesManagerModal(
        Translator.translate('Pages Manager'), 
        Translator.translate("Select, drag to sort") + ", ...",
        this.pages_manager.getPages(),
        this.pages_manager.addPage,
        this.pages_manager.removePage, 
        this.pages_manager.swapPages,
        this.pages_manager.setRasterImage,
        context).attachTo(MODALS_CONTAINER);
    this.pages_modal.init();

    
    // --- RASTER IMAGE MODAL ---

    this.raster_modal = new RasterModal(
        Translator.translate('Background Image'), 
        Translator.translate('Select or drop an image.'),
        this.pages_manager.setRasterImage,
        context
    ).attachTo(MODALS_CONTAINER);
        
        //this.raster_modal.init();


    // --- PATTERN MODAL ---

    this.patterns_modal = new PatternsModal(
        Translator.translate('Available Patterns'), 
        Translator.translate("Select the desired pattern!"),
        (pattern) =>{
            document.getElementById(PROPERTIES_ID.PATTERNPROPERTY).value = pattern;
        },
        context        
    ).attachTo(MODALS_CONTAINER);

    // --- IMAGE MODAL ---

    this.image_modal = new ImageModal(
        Translator.translate('Select an image'), 
        '',
        (url, filename) => { 
            //this.selected_elements[0].dom.style.src = 'url(' + url + ')';
            this.selected_elements[0].setImage(url);
            document.getElementById(PROPERTIES_ID.IMAGEURLPROPERTY).value = filename;
            // save the props to make sure the next time it modal is show the 
            // current filename (if any) is the current one.
            //this.saveProps();

            if (this.selected_elements[0].isRepeatable()) {
                const chain = this.context.repeatables_manager.getChain(this.selected_elements[0].dom.id);                    
                chain.forEach(element_id => {
                    if (element_id === this.selected_elements[0].dom.id) return false;
                    const _element = this.context.elements_manager.getElement(element_id);
                    _element.props[PROPERTIES_ID.IMAGEURLPROPERTY] = filename;
                    _element.setImage(url);
                })
            }


        },
        context
    ).attachTo(MODALS_CONTAINER);
    

    // --- DROPDOWN ITEMS MODAL ---

	this.dropbox_items_property_modal = new ItemsModal(
		Translator.translate('Items'),
		Translator.translate('Add/Remove items and click OK!'),
        this.dopbox_elements_manager,
        context
	).attachTo(MODALS_CONTAINER);

    // --- LABEL/TEXT MODAL ---

	this.text_modal = new TextModal(
		Translator.translate('Text/Label'),
		Translator.translate('Input the text and click OK!'),
        (new_value) => {
            document.getElementById(PROPERTIES_ID.LABELPROPERTY).value = new_value;            
            context.signals.onPropertyChanged.dispatch(PROPERTIES_ID.LABELPROPERTY, new_value);
        },
        context
	).attachTo(MODALS_CONTAINER);
    //this.text_modal.show();
    
    
    // ---------------
    // --- SIGNALS ---
    // ---------------

    context.signals.onPageAdded.add((page_number, page) => {      
        // unselect, otherwise, the page number from this page on will be incorrect
       // this.unselectElement();

        this.onSomethingChanged(CHANGES.PAGES);

        // clone each repeatable element in the newly created page
        const chains = this.repeated_elements_manager.getChains();
        let dispatch = false;
        chains.forEach(chain => {
            // just in case
            if (chain.length == 0) return false;
            // since all elements in the chain should be the same, just clone the first one
            const element_id = chain[0];
            const element = this.elements_manager.getElement(element_id);
            const cloned_element = this.clone(element, page.dom, false);
            cloned_element.setRepeatable(true);
            this.repeated_elements_manager.addElement(cloned_element.dom.id, chain)
            dispatch = true;
        })
        if (dispatch) context.signals.onRepeatableCreated.dispatch();
    });

    context.signals.onPageRemoved.add(() => {
        this.unselectElement(false);
        this.onSomethingChanged(CHANGES.PAGES)
    });

    context.signals.onElementMoved.add((element) => {
        if (this.selected_elements[0] !== element) {
            this.elementSelected(element);
            //console.error("XXXX", this.selected_elements[0], element);
        }
        $('#'+PROPERTIES_ID.TOPPROPERTY).val(parseInt(element.dom.style.top));
        $('#'+PROPERTIES_ID.LEFTPROPERTY).val(parseInt(element.dom.style.left));
    });
    
    // single move
    context.signals.onElementMoveStoped.add((element) => {
        $('#'+PROPERTIES_ID.TOPPROPERTY).val(parseInt(element.dom.style.top));
        $('#'+PROPERTIES_ID.LEFTPROPERTY).val(parseInt(element.dom.style.left));
        
        // if repeatable => apply new position to all elements in the chain
        if (!element.isRepeatable()) return;
        const chain = this.repeated_elements_manager.getChain(element.dom.id);
        if (!chain) return;
        const top = parseInt(element.dom.style.top);
        const left = parseInt(element.dom.style.left);
        chain.forEach(element_id => {
            if (element_id === element.dom.id) return false;
            const _element = this.elements_manager.getElement(element_id);
            _element.props[PROPERTIES_ID.TOPPROPERTY] = top;
            _element.props[PROPERTIES_ID.LEFTPROPERTY] = left;
            _element.dom.style.top = top;
            _element.dom.style.left = left;
        })
    });

    // only affects repeatable elements - multiple elements move
    context.signals.onMultiMoveStoped.add((parent_top, parent_left) => {
        this.selected_elements.forEach((element) => {
            if (!element.isRepeatable()) return false;
            const chain = this.repeated_elements_manager.getChain(element.dom.id);
            if (!chain) return;
            const top = parseInt(element.dom.style.top) + parent_top;
            const left = parseInt(element.dom.style.left) + parent_left;
            chain.forEach(element_id => {
                if (element_id === element.dom.id) return false;
                const _element = this.elements_manager.getElement(element_id);
                _element.props[PROPERTIES_ID.TOPPROPERTY] = top;
                _element.props[PROPERTIES_ID.LEFTPROPERTY] = left;
                _element.dom.style.top = top;
                _element.dom.style.left = left;
            })
        })
    });    


    context.signals.onElementResized.add((element, width, height) => {
        if (this.selected_elements[0] !== element) {
            this.elementSelected(element);
        }        
        // update the properties sidebar
        $('#'+PROPERTIES_ID.WIDTHPROPERTY).val(parseInt(width));
        $('#'+PROPERTIES_ID.HEIGHTPROPERTY).val(parseInt(height));
        // required, when resizing to the left or up
        /*        
        $('#'+PROPERTIES_ID.LEFTPROPERTY).val(parseInt(element.dom.style.left));
        $('#'+PROPERTIES_ID.TOPPROPERTY).val(parseInt(element.dom.style.top));   
        */
    });

    // only affects repeatable elements
    context.signals.onElementResizeStoped.add((element) => {
        if (!element.isRepeatable()) return;
        const chain = this.repeated_elements_manager.getChain(element.dom.id);
        if (!chain) return;
        const top = parseInt(element.dom.style.top);
        const left = parseInt(element.dom.style.left);
        const width = parseInt(element.dom.style.width);
        const height = parseInt(element.dom.style.height);
        chain.forEach(element_id => {
            if (element_id === element.dom.id) return false;
            const _element = this.elements_manager.getElement(element_id);
            _element.props[PROPERTIES_ID.HEIGHTPROPERTY] = height;
            _element.props[PROPERTIES_ID.WIDTHPROPERTY] = width;
            _element.props[PROPERTIES_ID.TOPPROPERTY] = top;
            _element.props[PROPERTIES_ID.LEFTPROPERTY] = left;
            _element.dom.style.top = top;
            _element.dom.style.left = left;
            _element.dom.style.width = width;
            _element.dom.style.height = height;
        })
    });    

    context.signals.onElementRemoved.add((element_id, type) => {
        this.unselectElement();
        this.onSomethingChanged(CHANGES.ELEMENTS);
    });

    context.signals.onElementCreated.add((element, page) => {
        // +1 because getPageNumberFromID counts zero as the first page
        element['props'][PROPERTIES_ID.PAGENUMBERPROPERTY] = this.pages_manager.getPageNumberFromID(page) + 1;
        this.onSomethingChanged(CHANGES.ELEMENTS);
    });

    context.signals.onPropertyChanged.add((id, value) => {
        // ensure that any property changed followed by either enter or clicked outside are applied
        // otherwise, if prop. changed and clicked outside => not applied and props changed => incorrect behaviour
        const elements = this.selected_elements.length==0?this.last_selected_elements:this.selected_elements;

        if (elements.length == 1) {
            elements[0].props = UIPropertiesMenu.getProperties();
        } 
             
        PropertyTabActions(context, id, value, elements);
        // save only if 1 element selected
        // if more than 1 element selected, all changes are done directly in PropertyTabActions 
        if (elements.length == 1) {
            elements[0].props = UIPropertiesMenu.getProperties();
        }
    });    

    context.signals.onSectionCreated.add((id, name) => {
        // add a new option in the sections dropdown property.
        const select = document.getElementById(PROPERTIES_ID.SECTIONPROPERTY);
        if (select) {
            const new_option = document.createElement('option');
            new_option.value = id;
			new_option.innerHTML = subStr(name, 8, 12);
			select.appendChild(new_option);
        }        
    });

    context.signals.onSectionNameChanged.add((section_id, new_name) => {
        // change its name in the sections dropdown property.
        // based on https://thisinterestsme.com/change-select-option-javascript/
        const selectElement = document.getElementById(PROPERTIES_ID.SECTIONPROPERTY);
        const selectOptions = selectElement.options;
        for (var opt, j = 0; opt = selectOptions[j]; j++) {
            if (opt.value == section_id) {
                selectOptions[j].innerHTML =  subStr(new_name, 8, 12);
                break;
            }
        }
    });

    context.signals.onSectionRemoved.add((section_id) => {
        // remove the section from the sections dropdown property.
        var selectElement = document.getElementById(PROPERTIES_ID.SECTIONPROPERTY);
        var selectOptions = selectElement.options;
        for (var opt, j = 0; opt = selectOptions[j]; j++) {
            if (opt.value == section_id) {
                selectOptions[j].parentNode.removeChild(selectOptions[j]);
                break;
            }
        }        
    });
    
    context.signals.onGroupCreated.add((id, name) => {
        // add a new option in the groups dropdown property.
        const select = document.getElementById(PROPERTIES_ID.GROUPPROPERTY);
        if (select) {
            const new_option = document.createElement('option');            
            new_option.value = id;
			new_option.innerHTML = subStr(name, 8, 12);
			select.appendChild(new_option);
        }
    });

    context.signals.onGroupRemoved.add((group_id) => {
        // remove group from properties sections list
        const selectElement = document.getElementById(PROPERTIES_ID.GROUPPROPERTY);
        const selectOptions = selectElement.options;
        for (var opt, j = 0; opt = selectOptions[j]; j++) {
            if (opt.value == group_id) {
                selectOptions[j].parentNode.removeChild(selectOptions[j]);
                break;
            }
        }
    });

    context.signals.onGroupRenamed.add((group_id, new_name) => {
        const selectElement = document.getElementById(PROPERTIES_ID.GROUPPROPERTY);
        const selectOptions = selectElement.options;
        for (var opt, j = 0; opt = selectOptions[j]; j++) {
            if (opt.value == group_id) {
                selectOptions[j].innerHTML =  subStr(new_name, 8, 12);
                break;
            }
        }
    });

    context.signals.onGroupTypeChanged.add((group_id, group_type) => {
        const selectElement = document.getElementById(PROPERTIES_ID.GROUPPROPERTY);
        const selectOptions = selectElement.options;
        for (var opt, j = 0; opt = selectOptions[j]; j++) {
            if (opt.value == group_id) {
                selectOptions[j].setAttribute('data-grouptype',group_type);
                break;
            }
        }
        if (this.selected_elements[0]) this.updateGroupList();
    });
    

    context.signals.onPropertyBtnClicked.add(this.propertyButton,this);
    //context.signals.onElementSelected.add(this.elementSelected,this);
    context.signals.onElementSelected.add((element, scroll) => this.elementSelected(element, scroll));
    context.signals.onMainTabChanged.add(this.tabChanged,this);

    // without this, the initial disabled buttons would continue disabled after loading.
    context.signals.onLoadEnded.add(() => {
        this.onSomethingChanged(CHANGES.SELECTION);
        this.onSomethingChanged(CHANGES.ELEMENTS);
        this.onSomethingChanged(CHANGES.PAGES);
        this.pages_counter.update();
    });
    
    // shift selected an element
    context.signals.onElementShiftSelected.add((element) => {
        if (element.isSelected)
            return;
        this.shiftSelectElements([element]);
    })

    // shift unselected an element
    context.signals.onElementShiftUnSelected.add((element) => {
        const element_2_select = [...this.selected_elements];
        element_2_select.splice(element_2_select.indexOf(element), 1);
        this.unselectElement();
        this.selected_elements = element_2_select;
        if (element_2_select.length > 1) {
            this.setMultiple();            
            this.multi_selection.select(element_2_select, element_2_select[0].getParent());
        } else {
            // only 1 is selected
            if (element_2_select.length == 1) {
                // no scroll and don't save the properties before deselection
                // otherwise if would save all the undefined fields that were set
                // by multiple state
                this.elementSelected(element_2_select[0], false, false);
            }
        }
        this.onSomethingChanged(CHANGES.SELECTION);
    })


    context.signals.onStuffDone.dispatch('FormView ready!');
    context.signals.onProgress.dispatch("FormView tab ready!");

}

FormView.prototype = {

    /**
     * Selects elements based on their current status.
     * @param {array of Elements} elements Elements to select.
     */
     shiftSelectElements : function(elements) {
        const element_2_select = [...this.selected_elements];
        //const element_2_unselect = [];
        elements.forEach(element => {
            if (element.isSelected) {
                //element_2_unselect.push(element);                
            } else {
                element_2_select.push(element);
            }
        })

        // select elements
        if (element_2_select.length > 0) {
            if (element_2_select.length > 1) {
                const parent = elements[0].getParent();
                // only add if selected element on the same page
                if (this.multi_selection.page && parent.id !== this.multi_selection.page.id) return;
                // TODO: DRY
                this.unselectElement();
                this.setMultiple();
                this.selected_elements = element_2_select;
                this.multi_selection.select(element_2_select, parent);
            } else if (element_2_select.length == 1) {
                this.elementSelected(elements[0]);
            }

        }
        this.onSomethingChanged(CHANGES.SELECTION);
    },

    /**
     * Moves an array of elements to another page.
     * ATTENTION: ALL ELEMENTS MUST BELONG TO THE SAME PAGE.
     * @param {number} n Relative page. +1 => next page, -1 => previous page
     * @returns The target page, or null if no move.
     */
    moveElements2RelativePage: function(elements, n) {
        if (elements.length == 0) return null;
        const page = elements[0].getParent();
        //console.log("origin page > ", page);
        const current_page_number = this.pages_manager.getPageNumberFromID(page.id);
        const target_page = this.pages_manager.getPage(current_page_number + n);
        if (!target_page) return null;        
        elements.forEach(element => {
            element.props[PROPERTIES_ID.PAGENUMBERPROPERTY] = current_page_number + n + 1;
            element.setParent(target_page);
            // element has a new parent
            // required to set this way, because pages' id is not page-number
            element.parent_id = target_page.id;
        })
        this.context.signals.onChange.dispatch();
        return target_page;
    },

    /**
     * Sets and prepare the properties panel for multiple selected elements.
     * Numerical => default values | List => no value.
     */
    setMultiple: function() {
        UIPropertiesMenu.setPropertiesVisibility(ELEMENTS_TYPE.MULTIPLE);
        $('#'+PROPERTIES_ID.PAGENUMBERPROPERTY).val(this.pages_manager.getCurrentPageNumber());
        $('#'+PROPERTIES_ID.SECTIONPROPERTY).val('');
        $('#'+PROPERTIES_ID.LISTHEADERPROPERTY).val('');
        $('#'+PROPERTIES_ID.ENABLEDPROPERTY).val('');
        $('#'+PROPERTIES_ID.CROSSEDPROPERTY).val('');
        $('#'+PROPERTIES_ID.GROUPPROPERTY).val('');
        $('#'+PROPERTIES_ID.VISIBLEPROPERTY).val('');
        $('#'+PROPERTIES_ID.COLORPROPERTY).val('');//#000');
        $('#'+PROPERTIES_ID.FONTPROPERTY).val('');
        $('#'+PROPERTIES_ID.FONTSIZEPROPERTY).val('');//DEFAULT_FONT_SIZE);
        $('#'+PROPERTIES_ID.FONTSTYLEPROPERTY).val('');
        $('#'+PROPERTIES_ID.FONTDECORATIONPROPERTY).val('');
        $('#'+PROPERTIES_ID.FONTWEIGHTPROPERTY).val('');
        $('#'+PROPERTIES_ID.HORIZONTALALIGNMENTPROPERTY).val('');
        $('#'+PROPERTIES_ID.ZINDEXPROPERTY).val('');
        $('#'+PROPERTIES_ID.COLORPROPERTY).val('');
        $('#'+PROPERTIES_ID.BACKCOLORPROPERTY).val('');
        $('#'+PROPERTIES_ID.BACKALPHAPROPERTY).val('');
        $('#'+PROPERTIES_ID.BORDERBORDERSPROPERTY).val('');
        $('#'+PROPERTIES_ID.BORDERPROPERTY).val('');
        $('#'+PROPERTIES_ID.BORDERWIDTHPROPERTY).val('');
        $('#'+PROPERTIES_ID.BORDERRADIUSPROPERTY).val('');
        $('#'+PROPERTIES_ID.ROTATIONPROPERTY).val('');
    },

    /**
     * Enables/Disables buttons depending on the current state (number of elements, pages, ...).
     * @param {CHANGES} what What changed.
     */
    onSomethingChanged: function(what) {
        switch (what) {
            case CHANGES.SELECTION:        
                if (this.selected_elements.length == 0) {
                    DELETE_SELECTED_ELEMENT_BTN.setAttribute('disabled','true');
                    CLONE_SELECTED_ELEMENT_BTN.setAttribute('disabled','true');
                    LOCK_ELEMENTS_BTN.setAttribute('disabled','true');
                    UNLOCK_ELEMENTS_BTN.setAttribute('disabled','true');
                    CREATE_CHAIN_BTN.setAttribute('disabled','true');
                    BREAK_CHAIN_BTN.setAttribute('disabled','true');
                    CLONE_ELEMENTS_NEXT_BTN.setAttribute('disabled','true');
                    CLONE_ELEMENTS_PREVIOUS_BTN.setAttribute('disabled','true');
                    MOVE_ELEMENTS_NEXT_BTN.setAttribute('disabled','true');
                    MOVE_ELEMENTS_PREVIOUS_BTN.setAttribute('disabled','true');
                    // button remains active until brush is deactivated
                    if (!this.isBrushActive) {
                        BRUSH_BTN.setAttribute('disabled','true');
                    }
                } else {
                    DELETE_SELECTED_ELEMENT_BTN.removeAttribute('disabled');
                    CLONE_SELECTED_ELEMENT_BTN.removeAttribute('disabled');    
                    LOCK_ELEMENTS_BTN.removeAttribute('disabled');
                    UNLOCK_ELEMENTS_BTN.removeAttribute('disabled');
                    CREATE_CHAIN_BTN.removeAttribute('disabled');
                    BREAK_CHAIN_BTN.removeAttribute('disabled');
                    CLONE_ELEMENTS_NEXT_BTN.removeAttribute('disabled');
                    CLONE_ELEMENTS_PREVIOUS_BTN.removeAttribute('disabled');
                    MOVE_ELEMENTS_NEXT_BTN.removeAttribute('disabled');
                    MOVE_ELEMENTS_PREVIOUS_BTN.removeAttribute('disabled');
                    BRUSH_BTN.removeAttribute('disabled');
                }
                break;
            case CHANGES.PAGES:
                if (this.pages_manager.getTotalPages() == 0) {
                    REMOVE_PAGE_BTN.setAttribute('disabled','true');
                    REMOVE_ALL_PAGES_BTN.setAttribute('disabled','true');
                    ADD_RASTER_IMAGE_BTN.setAttribute('disabled','true');
                    REMOVE_RASTER_IMAGE_BTN.setAttribute('disabled','true');
                } else {
                    REMOVE_PAGE_BTN.removeAttribute('disabled');
                    REMOVE_ALL_PAGES_BTN.removeAttribute('disabled');
                    ADD_RASTER_IMAGE_BTN.removeAttribute('disabled');
                    REMOVE_RASTER_IMAGE_BTN.removeAttribute('disabled');
                }
                break;
            case CHANGES.ELEMENTS:       
                if (this.elements_manager.getSize() == 0) {
                    LOCK_ALL_PAGE_ELEMENTS_BTN.setAttribute('disabled','true');
                    LOCK_ALL_ELEMENTS_BTN.setAttribute('disabled','true');        
                    UNLOCK_ALL_PAGE_ELEMENTS_BTN.setAttribute('disabled','true');
                    UNLOCK_ALL_ELEMENTS_BTN.setAttribute('disabled','true');
                } else {
                    LOCK_ALL_PAGE_ELEMENTS_BTN.removeAttribute('disabled');
                    LOCK_ALL_ELEMENTS_BTN.removeAttribute('disabled');  
                    UNLOCK_ALL_PAGE_ELEMENTS_BTN.removeAttribute('disabled');
                    UNLOCK_ALL_ELEMENTS_BTN.removeAttribute('disabled');                 
                }
            }
    },

    /**
     * Clones an Element.
     * @param {Element} element Clone an Element.
     * @param {node} parent Where to attach the element. If not specified, then will use the original's element parent.
     * @param {boolean} hasDelta If true, the cloned element will have a displacement given by DELTA_CLONE.
     * @returns The cloned Element.
     */
    clone: function(element = null, parent = null, hasDelta = true, delta_x=DELTA_CLONE, delta_y=DELTA_CLONE) {
        if (!element) return null;
        const top = parseInt(element.dom.style.top) + (hasDelta?delta_y:0);
        const left = parseInt(element.dom.style.left) + (hasDelta?delta_x:0);
        // clone the props
        const props = JSON.parse(JSON.stringify(element.props));
        // create it using the props
        props[PROPERTIES_ID.IDPROPERTY] = '';
        props[PROPERTIES_ID.TOPPROPERTY] = top;
        props[PROPERTIES_ID.LEFTPROPERTY] = left;
        const _parent = parent?parent:element.dom.parentNode;
        //if (element.type === ELEMENTS_TYPE.TABLE) console.log(element.getData());
        const new_element = this.elements_manager.createElement(element.type, props, left, top, _parent, null, (element.type === ELEMENTS_TYPE.TABLE || element.type === ELEMENTS_TYPE.STATICTABLE)?element.getTableConfig():null);
        // if dropdown, clone items
        if (new_element.type === ELEMENTS_TYPE.DROPDOWN) {
            const new_element_id = new_element.props[PROPERTIES_ID.IDPROPERTY];
            const element_2_clone_id = element.props[PROPERTIES_ID.IDPROPERTY];
            this.dopbox_elements_manager.cloneData(new_element_id, element_2_clone_id);
        }
        // if check/radio, put cloned element in the same group
        else if (new_element.type.availability.groups) {
            const group = new_element.props[PROPERTIES_ID.GROUPPROPERTY];
            if (group !== DEFAULT_GROUP_ID) {
                this.context.signals.onElementGroupChanged.dispatch(new_element,group);
            }
        }
        return new_element;
    },

    /**
     * Clones the selected element.
     * @returns New Element.
     */
    cloneSelectedElement(parent = null, hasDelta = true) {
        // save props
        this.selected_elements[0].props = UIPropertiesMenu.getProperties();
        const new_element = this.clone(this.selected_elements[0], parent, hasDelta);
        // and select the newly created element
        this.elementSelected(new_element);
        return new_element;
    },

    /**
     * Clones all selected Elements.
     */
    cloneAllSelectedElement(parent = null, hasDelta = true) {
        /**
         * process:
         *  1 - make a copy of all selected elements
         *  2 - unselect, so the real coordinates can be cloned
         *  3 - clone and select each element
         *  4 - select all cloned objects
         */
        if (this.selected_elements.length == 0) return;
        const element_2_clone = [...this.selected_elements];
        const new_selection = [];
        this.unselectElement();
        element_2_clone.forEach(element => {
            const new_element = this.clone(element, parent, hasDelta);
            new_selection.push(new_element);
        })
        this.multi_selection.select(new_selection, parent?parent:new_selection[0].getParent());
        this.selected_elements = new_selection;            
        this.setMultiple();
        this.onSomethingChanged(CHANGES.SELECTION);
    },

    /**
     * Clears everything.
     */
    reset: function() {
        this.unselectElement();
        this.pages_manager.removeAllPages();
        this.onSomethingChanged(CHANGES.PAGES);
    },


    /**
     * Removes/deletes all selected elements.
     */
    removeSelected: function() {
        this.multi_selection.deselect();
        this.selected_elements.forEach(element => {
            if (element.isRepeatable()) {
                this.removeRepeatable(element);
            } else {
                //this.context.signals.removeThisElement.dispatch(element);
                this.elements_manager.removeElement(element);
            }
        });
        this.selected_elements = [];
        this.onSomethingChanged(CHANGES.SELECTION);
    },

    removeRepeatable: function(element) {
        const chain = this.repeated_elements_manager.getChain(element.dom.id);
        if (!chain) return;
        [...chain].forEach(element_id => {
            const _element = this.elements_manager.getElement(element_id);
            this.elements_manager.removeElement(_element);
        })
    },

    /**
     * == Listener ==
     * Selects a given element.
     * The properties panel will be populated with the elements' properties,
     * and only those defined by the visibility flags (defined in constants.js) will be showed.
     * The selected element will be highlighted with a specific color defined in colors.js.
     * If an element is already selected, save its current properties, before its deselection.
     * 
     * ATT: it will deselect any selected element.
     * 
     * @param {Element} element Element to set as selected.
     * @param {Element} scroll Scroll to element when focus?
     * @param {boolean} save Save properties of the current selected element?
     * @returns Returns the current selected element.
     */
    elementSelected : function (element, scroll = true, save = true) {

        // paste format?
        if (this.isBrushActive && !element.isLocked()) {
            this.brush.paste(this.context, [element]);
        }
        this.unselectElement(save);            
        // restore the properties of the newly selected element
        UIPropertiesMenu.restoreProperties(element.props);
        // if locked => empty properties panel
        if (element.isLocked()) {
            UIPropertiesMenu.setPropertiesVisibility(ELEMENTS_TYPE.NONE);
        } else {
            // show only the pertinent properties
            UIPropertiesMenu.setPropertiesVisibility(element.type);
        }
        // now this one is the current element
        this.selected_elements.push(element);
        element.select(false, scroll);
        //console.log("2 > ", element.props[PROPERTIES_ID.LEFTPROPERTY],element.props[PROPERTIES_ID.TOPPROPERTY] );
        this.updateGroupList();
        this.onSomethingChanged(CHANGES.SELECTION);

        if (element.type == ELEMENTS_TYPE.TABLE || element.type == ELEMENTS_TYPE.STATICTABLE) {
            this.table_element_menu.show(element);
        }

        return this.selected_elements[0];
    }, 
    
    /**
     * Unselects any currently selected element.
     * No properties will be visible and the element will return to its
     * normal state (no highlight).
     * Before its deselection its current properties are saved.
     */
    unselectElement : function (save=true) {
        this.table_element_menu.hide();
       // this.selected_elements = [];
       this.last_selected_elements = [...this.selected_elements];
        if (this.selected_elements.length == 1) {
            this.selected_elements[0].unselect();
            // before deselection, save current properties
            if (save) this.selected_elements[0].props = UIPropertiesMenu.getProperties();
        } else if (this.multi_selection.hasElements()) {
            // the way multi-select works, after deselection, dom and props mismatch => 
            // their position in the props must be updated.
            this.multi_selection.deselect((elements => {
                elements.forEach(element => {
                    element.props[PROPERTIES_ID.LEFTPROPERTY] = parseInt(element.dom.style.left);
                    element.props[PROPERTIES_ID.TOPPROPERTY] = parseInt(element.dom.style.top);

                    if (!element.isRepeatable()) return false;
                    const chain = this.repeated_elements_manager.getChain(element.dom.id);
                    if (!chain) return;
                    const top = parseInt(element.dom.style.top);
                    const left = parseInt(element.dom.style.left);
                    chain.forEach(element_id => {
                        if (element_id === element.dom.id) return false;
                        const _element = this.elements_manager.getElement(element_id);
                        _element.props[PROPERTIES_ID.TOPPROPERTY] = top;
                        _element.props[PROPERTIES_ID.LEFTPROPERTY] = left;
                        _element.dom.style.top = top;
                        _element.dom.style.left = left;
                    })

                });                
            }));
        }
        UIPropertiesMenu.setPropertiesVisibility(ELEMENTS_TYPE.NONE);
        this.selected_elements = [];
        this.onSomethingChanged(CHANGES.SELECTION);
    },




    
  
    // --------------------------
    // --- PROPERTIES BUTTONS ---
    // --------------------------
    /**
     * == Listener ==
     * A property button was clicked:
     *      - show the respective modal.
     * @param {string} id Id of the property.
     * @param {any} value [Ignore]
     */
    propertyButton : function(id, value) {
        switch (id) {
            case PROPERTIES_ID.LABELPROPERTY:
                this.text_modal.show(document.getElementById(PROPERTIES_ID.LABELPROPERTY).value);
                break;            
            case PROPERTIES_ID.PATTERNPROPERTY:
                this.patterns_modal.show();
                break;
            case PROPERTIES_ID.DATABASEPROPERTY:
                this.context.signals.onRequireDBFieldSelection.dispatch((field) => {document.getElementById(PROPERTIES_ID.DATABASEPROPERTY).value = field});
                break;
            case PROPERTIES_ID.ITEMSPROPERTY:
                if (this.selected_elements[0].type === ELEMENTS_TYPE.DROPDOWN) {
                    this.dropbox_items_property_modal.show(this.selected_elements[0]);
                } else {
                    console.warn("[main->propertyButton] Selected element [" + id + "] is not a DropDown");
                }
                break;
            case PROPERTIES_ID.IMAGEURLPROPERTY:
                this.image_modal.show(this.selected_elements[0].props[PROPERTIES_ID.IMAGEURLPROPERTY]);                
                break;
            default:
                console.warn("[main->propertyButton] No case with id [" + id + "]");
        }
    },



    // ------------------------
    // --- GROUPS RELATED ---
    // ------------------------
  
    /**
     * Filters the group according to the selected element.
     * It does not deal with multi-select. For that setMultiple() is used to set to nothing.
     * @returns 
     */
    updateGroupList() {
        if (!this.selected_elements[0]) return;
        if (!this.selected_elements[0].type.availability.groups) return;

        const selectElement = document.getElementById(PROPERTIES_ID.GROUPPROPERTY);
        const selectOptions = selectElement.options;
        for (var opt, j = 0; opt = selectOptions[j]; j++) {
            const opt_type = selectOptions[j].getAttribute('data-grouptype');
            
            if (opt_type === this.selected_elements[0].type.name || opt_type === GROUP_TYPE.NONE || !opt_type)
                selectOptions[j].style.display = 'block';
            else
                selectOptions[j].style.display = 'none';
                
        }
    },

    // ------------------------
    // --- GLOBAL ---
    // ------------------------
    /**
     * == Listener ==
     * Main tab changed:
     *      - show/hide the respective UI.
     * @param {string} new_section Tab ID.
     */
    tabChanged: function(new_section) {
        this.unselectElement();
        if (new_section === VIEWS_TAB_ID.FORM) {
            $(FORM_VIEW_BUTTONS).show();
        } else {
            $(FORM_VIEW_BUTTONS).hide();
        }
    },

}