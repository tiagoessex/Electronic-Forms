import { Link, Span, Div } from '/static/js/ui/BuildingBlocks.js'


/**
  * Class representing a single dropdown form fields menu 
 */
 export class UIDropMenu extends Div {
    /**
     * Constructor.
     * @param {string} title Title/text of the dropdown.
     * @param {string} id ID.
     * @param {node | ?} container Parent node.
     * @param {string} icon Font awesome icon.
     * @param {boolean} darkTheme True for dark, false for light.
     * @param {boolean} open If true => menu expanded, else collapsed.
     */
	constructor(title, id, container, icon, darkTheme=true, open=false) {
		super(); 

		this.addClass('UIDropMenu');
        this.setId(id);
        this.attachTo(container);        
        this.addClass('unselectable');
        
        this.link = new Link().attachTo(this.dom);
        this.link.setAttribute("href",'#' + id + "_items");
        this.link.setAttribute("data-toggle","collapse");        
        this.link.setAttribute("aria-expanded",open?"true":"false");       

        if (darkTheme) {
            this.link.addClass("bg-dark text-white");
        } else {
            this.link.addClass("bg-light text-black");
        }
        this.link.addClass("list-group-item list-group-item-action flex-column align-items-start");
        
        const div = new Div().attachTo(this.link);
        div.addClass("d-flex w-100 justify-content-start align-items-center");
           
        const span_symbol = new Span().attachTo(div);
        const classes = icon.split(' ');
		for (let i=0; i<classes.length; i++)
            span_symbol.addClass(classes[i]);
        span_symbol.addClass("fa-fw mr-3");

        const span_arrow = new Span().attachTo(div);
        //span_arrow.addClass("submenu-icon");
        span_arrow.addClass("fas");
        span_arrow.addClass(open?"fa-chevron-up":"fa-chevron-down");
        span_arrow.addClass("ml-auto");

        var textnode = document.createTextNode(title);
        span_symbol.dom.parentNode.insertBefore(textnode, span_arrow.dom);

        // submenu / items' container
        this.items = new Div().attachTo(this.dom);
        this.items.setId(id + "_items");
        this.items.addClass("collapse");

        $(this.link.dom).click(function(e) {
			e.preventDefault();
            $(span_arrow.dom).toggleClass("fa-chevron-down fa-chevron-up")
        });
	}

    /**
     * Adds a UIFormElementsItem | UIPropertiesItem.
     * @param {UIDropMenuProperties} field UIFormElementsItem | UIPropertiesItem to add to the dropdown menu.
     */
    add(field) {
        field.attachTo(this.items);
    }

}
