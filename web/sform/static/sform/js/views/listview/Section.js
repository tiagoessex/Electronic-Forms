
import { Div, Span, AwesomeIcon } from '/static/js/ui/BuildingBlocks.js';

export class Section extends Div {
    constructor(context, id, name) {
        super();

        this.addClass('card');
        this.addClass('mb-1');
        this.setId("section-" + id);    // lv-section-
        this.setStyle('margin','0 0 0 0');

        const header = new Div().attachTo(this);
        header.addClass('card-header');
        header.addClass('collapsed');
        //header.setStyle('background-image','linear-gradient(#09C6F9, #045DE9)')
        header.setStyle('background-image','linear-gradient(147deg, #000000 0%, #04619f 74%')
        header.setStyle('background-color','#000000')
        
        header.setAttribute('data-toggle','collapse');
        header.setAttribute('href','#' + id);        
        header.setStyle('text-shadow','2px 2px 2px black');
        header.setStyle('font-size','1.2em');
        header.setStyle('font-weight','bold');        
        header.setStyle('color','white');
        header.setTextContent(name);

        const icons = new Span({classes:['float-right']}).attachTo(header);
        const icon = new AwesomeIcon('fas fa-chevron-left').attachTo(icons);

       // <span class="pull-right clickable"><i class="glyphicon glyphicon-chevron-down"></i></span>

        const by = new Div().attachTo(this);
        by.addClass('collapse');
        by.setId(id);
        by.setAttribute('data-parent','#list-view-accordion');

        this.body = new Div().attachTo(by);
        this.body.addClass('card-body');
        //this.body.addClass('bg-light');
        this.body.addClass('section-body-' + id);    // -> id: lv-section-body-        
        //this.body.setStyle('background-color','#fff')
        this.body.setStyle('background-image','linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%)')
        this.body.setStyle('background-color','#ffffff');
        
        $(header.dom).on('click', function(e){
            if (header.hasClass('collapsed')) {
                icon.removeClass('fa-chevron-left');
                icon.addClass('fa-chevron-down');
                context.signals.onSectionOpened.dispatch(id);   // required for refreshing maps
            } else {
                icon.removeClass('fa-chevron-down');
                icon.addClass('fa-chevron-left');
            }
        })

        context.signals.onHidden.add((_id) => {
            if (id === _id) {
                this.addClass('collapse');
            }
        })
        context.signals.onShowed.add((_id) => {
            if (id === _id) {
                this.removeClass('collapse');
            }
        })
        /*
        context.signals.onCrossed.add((_id) => {
            if (id === _id) {
                this.addClass('cross');
            }
        })
        context.signals.onUncrossed.add((_id) => {
            if (id === _id) {
                this.removeClass('cross');
            }
        })
        */  
    }

}
