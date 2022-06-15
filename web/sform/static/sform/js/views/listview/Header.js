
import { Div, Img } from '/static/js/ui/BuildingBlocks.js';

export class Header extends Div {
    constructor() {
        super();

        this.addClass('card'); // 
        this.addClass('shadow');
        this.addClass('p-2');
        this.addClass('mb-2');
        this.addClass('bg-white');
        this.setStyle('rounded');
        //this.setStyle('width', '100vh');//'793px');
        /*
        this.body = new Div().attachTo(this);
        this.body.addClass('card-body');
        */
        this.image = new Img('').attachTo(this);
        this.image.addClass("img-fluid mx-auto d-block");
        this.image.addClass('p-0');
        this.image.addClass('m-0');
    }

    setImage(imageUrl, w, h, onReady) {
        var newImg = new Image;
        const self = this;
        newImg.onload = function() {
            self.image.setAttribute('width', w);
            self.image.setAttribute('height', h);
            self.image.setAttribute('src', newImg.src);
            onReady();
        }
        newImg.src = imageUrl;
    }

}
