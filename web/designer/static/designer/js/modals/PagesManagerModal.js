import { Div, Br, Hr, AwesomeIconAndButton, Img, Text } from '/static/js/ui/BuildingBlocks.js';
import { Modal, MODAL_SIZE } from '/static/js/modals/Modal.js';
import { PAGE_LIST_ICON } from '/static/js/urls.js';
import { ClickOrDragFileInput } from "/static/js/modals/ClickOrDragFileInput.js";
import { ASSETTYPE } from '/static/js/assettype.js';
import { APP } from '/static/js/constants.js';
import { UploadAsset } from '/static/js/UploadAsset.js';
import { Translator } from '/static/js/Translator.js';

/**
 * Modal for pages management
 * Operations:
 *  - sort
 *  - add
 *  - remove
 *  - remove
 *  - add/remove raster images
 * 
 * NOTES: call init() after creation.
 */
 export class PagesManagerModal extends Modal { 

    /**
     * Constructor.
     * @param {string} title Title of the modal.
     * @param {string} help_text Helper text.
     * @param {HTMLCollection} pages_collection Collection of pages (see PagesManager.js).
     * @param {function} addPage Callback to add a page (see PagesManager.js).
     * @param {function} removePage Callback to remove a page (see PagesManager.js).
     * @param {function} swapPages Callback to swap 2 pages (see PagesManager.js).
     * @param {function} setRasterImage Callback to set a background image (see PagesManager.js).
     * @param {Context} context Context.
     */
    constructor(title, help_text='', pages_collection=null, addPage=null, removePage=null, swapPages=null, setRasterImage=null, context=null) {
        super(title, help_text, MODAL_SIZE.XL); 

        if (!(addPage && removePage && swapPages && setRasterImage)) {
            console.error('[PagesManagerModal->PagesManagerModal::ctor] - Must pass 4 callback functions!');
            throw Error('Must pass 4 callback functions!');
        }      
        if (!pages_collection) {
            console.error('[PagesManagerModal->PagesManagerModal::ctor] - Pages Missing!');
            throw Error('Pages Missing!');
        }
        if (!context || context === undefined) {
            console.error('[PagesManagerModal->PagesManagerModal::ctor] - Missing the context!');
            throw Error('Missing the context!');
        }  

        this.pages = pages_collection;
        this.addPage = addPage;
        this.removePage = removePage;
        this.swapPages = swapPages;
        this.setRasterImage = setRasterImage;
        this.context = context;
        const self = this;

        const row = new Div().attachTo(this.modal_body);
        row.addClass('row');

        this.sortable = new Div().attachTo(row);
        this.sortable.setId("PMM-sortable");

        new Br().attachTo(this.modal_body)

        new Hr().attachTo(this.modal_body)

        const group = new Div().attachTo(this.modal_body);
        group.addClass('btn-group d-flex');
        group.setAttribute('role',"group");

        this.add_page_btn = new AwesomeIconAndButton(Translator.translate(" Add Page"),"fa fa-plus").attachTo(group)
        this.add_page_btn.setAttribute("type","button");
        this.add_page_btn.addClass('btn btn-success mr-1 w-100');
        this.add_page_btn.setId('PMM-add-page');

        this.remove_page_btn = new AwesomeIconAndButton(Translator.translate(" Remove Page"),"fa fa-trash").attachTo(group)
        this.remove_page_btn.setAttribute("type","button");
        this.remove_page_btn.addClass('btn btn-danger mr-1 w-100');
        this.remove_page_btn.setId('PMM-remove-page');
        this.remove_page_btn.setStyle("display","none");
        

        this.add_raster_btn = new AwesomeIconAndButton(Translator.translate(" Set Background Image"),"fa fa-image").attachTo(group)
        this.add_raster_btn.setAttribute("type","button");
        this.add_raster_btn.addClass('btn btn-success mr-1 w-100');
        this.add_raster_btn.setId('PMM-add-raster');
        this.add_raster_btn.setStyle("display","none");

        this.remove_raster_btn = new AwesomeIconAndButton(Translator.translate(" Remove Background Image"),"fa fa-times").attachTo(group)
        this.remove_raster_btn.setAttribute("type","button");
        this.remove_raster_btn.addClass('btn btn-warning mr-1 w-100');
        this.remove_raster_btn.setId('PMM-remove-raster'); 
        this.remove_raster_btn.setStyle("display","none");       

        new Hr().attachTo(this.modal_body)

        // raster image
        this.raster_dialog = new Div().attachTo(this.modal_body);
        this.raster_dialog.setId("PMM-raster-image-dialog");
        this.raster_dialog.setStyle("display","none");

        new ClickOrDragFileInput('PMM-raster-image-file', 'asset-file',  (file, data) => {
            context.signals.onChange.dispatch();
            UploadAsset(
                data, 
                context.properties.id,
                file.name, 
                ASSETTYPE.IMAGE, 
                APP.DESIGNER, 
                (result) => {
                    setRasterImage(result.asset, self.selected_page);
                }, 
                (error) => {
                    context.signals.onError.dispatch(error,"[PagesManagerModal::UploadAsset]"); 
                }
            );          
        }).attachTo(this.raster_dialog);



        this.self = this;
    }

    /**
     * Initiates the modal: set the events, ...
     */
    init() {
        const self = this;
        this.selected_page = -1;
        
        // make the pages list sortable
        $(this.sortable.dom).sortable({ 
            items: "div:not(.ui-state-disabled)",
            opacity: 0.5,
            tolerance: "pointer"		
        });
        $(this.sortable.dom).disableSelection();

        
		$(this.sortable.dom).on("sortupdate", function(event, ui) {
                let currentOrder = $(this).sortable('toArray',{attribute: "data-page"});
                let from = ui.item[0].dataset.page;
                let to = currentOrder.indexOf(from) - 1;
                // swap the real pages
                self.swapPages(parseInt(from), parseInt(to));
                // recreate the list
                self.createList();
		 });



		// click on page => select page and show all the vailable options 
		this.previous = null;
        $(this.sortable.dom).on('click','.PM-page', () => this.pageSelected(event))

        // bind buttons to ops
        $(this.remove_page_btn.dom).on("click", () => {
            // remove physical page and elements
            self.removePage(self.selected_page);
            // remove page from list
            const page_2_remove = document.getElementById('page-list-' + self.selected_page);
            self.sortable.dom.removeChild(page_2_remove);
            // recreate the list
            self.createList(); 
            // reset state
            self.selected_page = -1;
            $(this.add_raster_btn.dom).hide();
            $(this.remove_raster_btn.dom).hide();
            $(this.remove_page_btn.dom).hide();
            $(this.raster_dialog.dom).hide();
        });

        $(this.add_page_btn.dom).on("click", () => {
            // append one at the end of the list
            self.createOne();
            // create a real page at the end
            self.addPage();
            // recreate the list
            self.createList();
        });

        $(this.add_raster_btn.dom).on("click", () => {
            $(this.raster_dialog.dom).show();
        });

        $(this.remove_raster_btn.dom).on("click", () => {            
            self.setRasterImage('', self.selected_page);
            self.context.signals.onChange.dispatch();
        });
       
    }

    /**
     * A page was selected:
     *      - show all buttons.
     * @param {event} event Event.
     */
    pageSelected(event) {
        $(this.add_raster_btn.dom).show();
        $(this.remove_raster_btn.dom).show();
        $(this.remove_page_btn.dom).show();

		event.target.parentNode.classList.add("active");
		if (this.previous !=null) {
			this.previous.classList.remove("active");		
		}
		this.previous=event.target.parentNode;	
        this.selected_page = event.target.parentNode.dataset.page;
    }

    /**
     * Creates a Page icon.
     * @param {number} n Page number.
     */
    createOne(n = -1) {
        if (n < 0) {
            n = this.pages.length;
        }
        const page = new Div();
        page.attachTo(this.sortable);
        page.setAttribute('id','page-list-' + n);   // page number
        page.setAttribute('data-page',n);
        page.addClass('pm-item');
        const icon = new Img(PAGE_LIST_ICON, 80, 100);
        icon.attachTo(page);
        icon.setStyle('opacity','0.5');
        icon.addClass('PM-page');
        const newline = new Br();
        newline.attachTo(page);
        const text = new Text(Translator.translate('Page ') + (n+1));
        text.attachTo(page);
    }

    /**
     * Creates a list of Pages icons.
     */
    createList() {
         // clear previous list
         while (this.sortable.dom.firstChild) {
            this.sortable.dom.removeChild(this.sortable.dom.firstChild);
        }
        // create new list
        for (let i=0; i<this.pages.length; i++) {
            this.createOne(i);
        }
       $(this.add_raster_btn.dom).hide();
       $(this.remove_raster_btn.dom).hide();
       $(this.remove_page_btn.dom).hide();
       $(this.raster_dialog.dom).hide();
    }

    /**
     * Show the pages management modal.
     */
    show() {
        this.createList();
        $(this.add_raster_btn.dom).hide();
        $(this.remove_raster_btn.dom).hide();
        $(this.remove_page_btn.dom).hide();
        $(this.raster_dialog.dom).hide();
        super.show();
    }

}



