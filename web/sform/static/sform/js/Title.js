
import { Div, Button, Text, Hx, AwesomeIcon, Link, AwesomeIconAndButton } from '/static/js/ui/BuildingBlocks.js';
import { TOP_TITLE } from './ids.js';
import { Translator } from '/static/js/Translator.js';


export class Title extends Div{
    /**
     * 
     * @param {string} title Title.
     * @param {function} onBack Function to be called when the back button is pressed.
     * @param {array} options Array of objects {name,callback}.
     */
    constructor(title = '', onBack = null, options = null, onExtra = null) {
        super();

        this.addClass('row text-center collapse');        
        this.attachTo($(TOP_TITLE)[0]);

        //const col = new Div({classes:['col-sm-8','offset-sm-2']}).attachTo(this);      
        const col = new Div({classes:['col-sm-12']}).attachTo(this);      

        this.title = new Text(Translator.translate(title)).attachTo(col);
        this.title.addClass('title');

        if (onBack) {
            const back_button = new Button('').attachTo(col);            
            back_button.addClass('btn btn-light float-left btn-back collapse');
            back_button.setStyle('height','100%');
            const h1 = new Hx(2).attachTo(back_button);
            h1.addClass('my-auto');
            const fa = new AwesomeIcon('fas fa-chevron-left').attachTo(h1);
            fa.setStyle('pointer-events','none');
            $(back_button.dom).on('click', function(e) {
                if (onBack) onBack();
            });         
        }

        if (options && options.length > 0) {
            const group = new Div().attachTo(col);
            group.addClass('btn-group float-right');
            //group.addClass('pull-left');
            const con_button = new Button('').attachTo(group);
            con_button.addClass('btn btn-light float-left btn-options');
            //con_button.addClass('dropdown-toggle');
            con_button.setStyle('height','100%');
            con_button.setAttribute('type','button');
            con_button.setAttribute('data-toggle','dropdown');
            const h1 = new Hx(2).attachTo(con_button);
            h1.addClass('my-auto');
            const fa = new AwesomeIcon('fas fa-plus-circle').attachTo(h1);
            fa.setStyle('pointer-events','none');

            const dropdown = new Div().attachTo(group);
            dropdown.setStyle('z-index','100001');
            dropdown.addClass('dropdown-menu dropdown-menu-right pull-left');
            options.forEach(option => {
                const item = new Link().attachTo(dropdown);
                item.addClass('dropdown-item');
                item.setAttribute('href','javascript:void(0)');
                item.dom.innerHTML = option.name;
                $(item.dom).on('click', function(e) {
                    if (option.callback) option.callback();
                }); 
            });            
        }
        
    }

    setTitle(title) {
        this.title.setTextContent(Translator.translate(title));
    }

    show() {
        $(this.dom).collapse('show');
    }

    hide() {
        $(this.dom).collapse('hide');
    }    

}






/*
<div id="top-title" class="row text-center collapse">
<div class="col-sm-8 offset-sm-2">
<!--
    <div class="card shadow mt-2 p-0 m-0 bg-white rounded">
          <div class="card-body">
-->
            <button class="  " style="height:100%;"><h1 class="my-auto"><i class="fas fa-chevron-left"></i></h1></button>
            
            <span id="top-title-text" class="title">Main</span>
<!--
        </div>
    </div>
-->
</div>
</div>

<br>
*/