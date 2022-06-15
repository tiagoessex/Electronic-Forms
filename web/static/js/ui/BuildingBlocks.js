/**
 * MODULE CONTAINING ALL BASE ELEMENTS NECESSARY TO BUILD HTML, I.E.,
 * IT REPLACES THE MAIN HTML COMPONENTS.
 * THIS APPROACH WAS USED FOR BETTER CONTROL, FINE-TUNNING AND IN
 * MANY INSTANCES TO SIMPLIFY.
 */

import {isElement} from '../jshtml.js'

/**
 * settings = {styles: {}, classes: [], attributes: {}}
 */
class BasicBlock {
	constructor(dom, settings = {}) {
		this.dom = dom;

		if (settings.hasOwnProperty('styles')) {
			for (var key in settings.styles) {
				this.setStyle(key, settings.styles[key]);
		   }
		}		
		if (settings.hasOwnProperty('classes')) {	   
		   	for (let i=0; i<settings.classes.length; i++) {
				this.addClass(settings.classes[i]);
		   	}
		}
		if (settings.hasOwnProperty('attributes')) {
			for (var key in settings.attributes) {
				this.setAttribute(key, settings.attributes[key]);
		   }				
		}
	}
	/*
	getHTMLElement() {
		return this.dom;
	}
	*/

	attachTo(parent) {
		if (isElement(parent))
			parent.appendChild(this.dom);
		else
			parent.dom.appendChild(this.dom);
		return this;
	}

	detach() {
		if (isElement(this))
			this.remove();
		else
			this.dom.remove();
	}
	/*
	detach() {
		if (isElement(this))
			return this.parentNode.removeChild(this);
		else
			return this.dom.parentNode.removeChild(this.dom);
	}
	*/

	detachAllChildren() {
		while (this.firstChild) {
			this.removeChild(this.firstChild);
		}
	}

	clear() {
		while (this.dom.children.length) {
			this.dom.removeChild(this.dom.lastChild);
		}
	}

	// no id specified, then create a random one
	setId(id) {
		if (id && id != null)
			this.dom.id = id;
		else 
			this.dom.id = uuidv4();
		return this;
	}

	// if id is not set, then generate a GUID and set it as the id from now on
	getId() {
		if (!this.dom.hasAttribute('id')) {
			this.dom.id = uuidv4();
		};
		return this.dom.id;	// <=> getHTMLElement().getAttribute('id')
	}

	setClass(name) {
		this.dom.className = name;
		return this;
	}

	/*
	addClass(name) {
		this.dom.classList.add(name);
		return this;
	}
	*/
	addClass(name) {
		const classes = name.replace(/\s+/g, ' ').trim().split(' ');
		classes.forEach(_class => {
			this.dom.classList.add(_class);
		});
	}

	removeClass(name) {
		this.dom.classList.remove(name);
		return this;
	}

	hasClass(name) {
		return this.dom.classList.contains(name);
	}

	setDisabled(value) {
		this.dom.disabled = value;
		return this;
	}

	setTextContent(value) {
		this.dom.textContent = value;
		return this;
	}

	setAttribute(key, value) {
		this.dom.setAttribute(key, value);
	}

	removeAttribute(key) {
		this.dom.removeAttribute(key);
	}

	hasAttribute(name) {
		return this.dom.hasAttribute(name);
	}

	setStyle( style, value ) {
		this.dom.style[style] = value;
	}	
	
}

class Span extends BasicBlock {
	constructor(settings) {
		super(document.createElement('span'), settings);
	}
}

class Div extends BasicBlock {
	constructor(settings) {
		super(document.createElement('div'), settings);
	}
}


class Link extends BasicBlock {
	constructor(settings) {
		super(document.createElement('a'), settings);
	}
}




class Text extends Span {
	constructor(text, settings) {
		super(settings);//{styles:{"cursor":"default", "display": "inline-block","vertical-align":"middle"}});
		this.addClass('Text');
		/*this.dom.style.cursor = 'default';
		this.dom.style.display = 'inline-block';
		this.dom.style.verticalAlign = 'middle';
		*/
		this.setValue( text );
	}

	getValue() {
		return this.dom.textContent;
	}

	setValue(value) {
		if ( value !== undefined ) {
			this.dom.textContent = value;
		}
		return this;
	}
}




/**
 * example:     
 * const i = new Select();
 * i.setOptions({"key1":"value 1","key2":"value 2"});
 * i.setValue("key2")
 */
class Select extends BasicBlock {
	constructor(settings) {
		super(document.createElement('select'), settings);
		this.addClass('Select');
		if (settings && settings.hasOwnProperty('options')) {
			if (Object.keys(settings.options).length > 0) {
				this.setOptions(settings.options);
			}
		}
		if (settings && settings.hasOwnProperty('attributes')) {
			if (settings.attributes.hasOwnProperty('value'))
				this.dom.value = settings.attributes.value;
		}
	}

	setOptions(options) {		
		const selected = this.dom.value;		
		// remove the old ones
		while (this.dom.children.length > 0) {
			this.dom.removeChild(this.dom.firstChild);
		}
		// set the new ones
		for (const key in options) {
			const option = document.createElement('option');
			option.value = key;
			option.innerHTML = options[key];
			this.dom.appendChild(option);
		}
		// if nothing selected yet, then set the first as the selected
		if (selected != "")
			this.dom.value = selected;
		else
			this.dom.value = Object.keys(options)[0];
		return this;
	}

	getValue() {
		return this.dom.value;
	}

	setValue(value) {
		value = String( value );
		if (this.dom.value !== value) {
			this.dom.value = value;
		}
		return this;
	}

	setMultiple(boolean) {
		this.dom.multiple = boolean;
		return this;
	}

	length() {
		return this.dom.options.length;
	}

	/**
     * Check is there something selected.
     * If not, then indicate status with white text/red background.
	 * ATT: REQUIRES BOOTSTRAP 4 OR EQUIVALENT CLASSES
     * @returns True if nothing is selected, False otherwise. ??reverse??
     */
	checkStatus() {
		if (this.getValue() === '' || !this.getValue()) {
			this.addClass('bg-danger');
			this.addClass('text-white');
			return true
		} 
		this.removeClass('bg-danger');
		this.removeClass('text-white');
		return false
	}

}


class Button extends BasicBlock {
	constructor(value, settings) {
		super(document.createElement('button'), settings);
		this.addClass('Button');
		this.dom.textContent = value;
	}
}

/**
* settings = {"value":X, "isPlaceholder": Y}
 */
class Input extends BasicBlock {
	constructor(settings) {
		super( document.createElement('input'), settings);
		this.addClass('Input');
	}

	getValue() {
		return this.dom.value;
	}

	setValue(value) {
		this.dom.value = value;
		return this;
	}

	/**
     * Check is there something selected.
     * If not, then indicate status with white text/red background.
	 * ATT: REQUIRES BOOTSTRAP 4 OR EQUIVALENT CLASSES
     * @returns True if nothing is selected, False otherwise. ??reverse??
     */
	 checkStatus() {
		if (this.getValue() === '' || !this.getValue()) {
			this.addClass('bg-danger');
			this.addClass('text-white');
			return true
		} 
		this.removeClass('bg-danger');
		this.removeClass('text-white');
		return false
	}
}

class InputText extends Input {
	constructor(settings) {
		super(settings);
		this.dom.type="text";
	}
}

/**
 * settings = {..., "max": Z, "min": W, "step": K}
 */
class InputNumber extends Input {
	constructor(settings) {
		super(settings);
		this.dom.type="number";			
	}
}


/**
* settings = {"value":X}
 */
class InputColor extends BasicBlock {
	constructor(settings) {
		super(document.createElement('input'), settings);
		this.addClass('Color');
		this.dom.type = 'color';
	}

	getValue() {
		return this.dom.value;
	}

	getHexValue() {
		return parseInt( this.dom.value.substr( 1 ), 16 );
	}

	setValue(value) {
		this.dom.value = value;
		return this;
	}

	setHexValue(hex) {
		this.dom.value = '#' + ( '000000' + hex.toString( 16 ) ).slice( - 6 );
		return this;
	}
}


class Table extends BasicBlock {
	constructor(settings) {
		super(document.createElement('table'), settings);
		this.addClass('TableElement');
	}
}

class TableCol extends BasicBlock {
	constructor(settings) {
		super(document.createElement('col'), settings);
		this.addClass('TableCol');
	}
}

class TableTr extends BasicBlock {
	constructor(settings) {
		super(document.createElement('tr'), settings);
	}
}

class TableTd extends BasicBlock {
	constructor(settings) {
		super(document.createElement('td'), settings);
	}
}


class TableTh extends BasicBlock {
	constructor(settings) {
		super(document.createElement('th'), settings);
	}
}

class TableThead extends BasicBlock {
	constructor(settings) {
		super(document.createElement('thead'), settings);
	}
}
class TableTbody extends BasicBlock {
	constructor(settings) {
		super(document.createElement('tbody'), settings);
	}
}

class Hx extends BasicBlock {
	constructor(x, settings) {
		super(document.createElement('h' + x), settings);
	}
}


/**
 * Create n newlines.
 */
class Br extends Div {
	constructor(times=1, settings) {
		super(settings);

		for (let i=0; i<times; i++) {
			const new_line = document.createElement('br');
			this.dom.appendChild(new_line);
		}
	}
}



class Hr extends BasicBlock {
	constructor(settings) {
		super(document.createElement('hr'), settings);
	}
}

class AwesomeIcon extends BasicBlock {
	constructor(icon) {
		super(document.createElement('i'));
		this.addClass('AwesomeIcon');
		const classes = icon.split(' ');
		for (let i=0; i<classes.length; i++)
			this.addClass(classes[i]);
	}
}

class ButtonAndAwesomeIcon extends Button {
	constructor(value, icon, settings) {
		super(value, settings);
		this.addClass('ButtonAndAwesomeIcon');
		const icon_ele = new AwesomeIcon(icon);
		icon_ele.setStyle('pointer-events','none');
		icon_ele.attachTo(this);
	}
}

class AwesomeIconAndButton extends Button {
	constructor(value, icon, settings) {
		super('', settings);
		this.addClass('AwesomeIconAndButton');
		const text = new Text(value);
		text.attachTo(this);
		const icon_ele = new AwesomeIcon(icon);
		icon_ele.setStyle('pointer-events','none');
		this.dom.insertBefore(icon_ele.dom, text.dom)
	}
}

class Img extends BasicBlock {
	constructor(imageUrl=null, width=null, height=null, settings) {
		super(document.createElement('img'), settings);
		if (imageUrl) this.setAttribute('src', imageUrl);
		if (width) this.setAttribute('width', width + 'px');
		if (height) this.setAttribute('height', height + 'px');
	}
}

class TextArea extends BasicBlock {
	constructor(rows=null, cols=null, settings) {
		super(document.createElement('textarea'), settings);
		if (rows)
			this.setAttribute('rows', rows);
		if (cols)
			this.setAttribute('cols', cols);
	}

	getValue() {
		return this.dom.value;
	}

	setValue(value) {
		this.dom.value = value;
		return this;
	}	
}

class Label extends BasicBlock {
	constructor(text=null, settings) {
		super(document.createElement('label'), settings);
		if (text) this.setTextContent(text);
	}
}

class Canvas extends BasicBlock {
	constructor(text=null, settings) {
		super(document.createElement('canvas'), settings);
		if (text) this.setTextContent(text);
	}
}

class Ul extends BasicBlock {
	constructor(settings) {
		super(document.createElement('ul'), settings);
	}
}

class Li extends BasicBlock {
	constructor(settings) {
		super(document.createElement('li'), settings);
	}
}

class Form extends BasicBlock {
	constructor(settings) {
		super(document.createElement('form'), settings);
	}
}

export {
	BasicBlock, 
	Link, Text, 
	Span, Div, 
	Input, InputText, InputNumber, InputColor,
	Select, 
	Button, 
	Table, TableCol, TableTr, TableTd, TableTh, TableThead, TableTbody,
	Hx, Br, Hr,
	AwesomeIcon, ButtonAndAwesomeIcon, AwesomeIconAndButton,
	Img,
	TextArea,
	Label,
	Canvas,
	Ul, Li,
	Form
}