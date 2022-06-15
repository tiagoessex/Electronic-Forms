import {
	TableTr, 
	TableTd, InputText, 
	InputNumber, 
	InputColor, 
	Select, 
	Button, 
	Div
} from '/static/js/ui/BuildingBlocks.js'

export const INPUT_TYPE = {
    TEXT: "TEXT",
    NUMBER: "NUMBER",
    COLOR: "COLOR",
    SELECT: "SELECT",
	TEXTBUTTON: "TEXTBUTTON",	// button id: btn-[input_id]
	BUTTON: "BUTTON"
}

export class UIPropertiesItem extends TableTr {
	/**
	 * Constructor.
	 * @param {Context} context Context.
	 * @param {string} label Label.
	 * @param {string} input_id ID.
	 * @param {INPUT_TYPE} type 
	 * @param {object} settings Styles, classes, ... {"options":{"key1":"value 1",...}}
	 */
	constructor(context, label, input_id, type, settings={}) {
		super();
		this.addClass('UIPropertiesItem');
		this.setId(input_id + "-UIPropertiesItem");	// table line id -- for visibility -
													// - check setPropertiesVisibility in UIPropertiesMenu.js
		const td_label = new TableTd().attachTo(this.dom);       
		td_label.setTextContent(label);
		td_label.addClass("pl-2");

		const td_input = new TableTd().attachTo(this.dom);        
		td_input.addClass("pr-2");
		td_input.setStyle("display", "flex")		
		
		switch (type) {
			case INPUT_TYPE.TEXT:
				this.input = Input_Text(context, input_id, settings).attachTo(td_input);
				break;
			case INPUT_TYPE.NUMBER:
				this.input = Input_Number(context, input_id, settings).attachTo(td_input);
				break;
			case INPUT_TYPE.COLOR:
				this.input = Input_Color(context, input_id, settings).attachTo(td_input);
				break;
			case INPUT_TYPE.SELECT:
				this.input = Input_Select(context, input_id, settings).attachTo(td_input);
				break;
			case INPUT_TYPE.TEXTBUTTON:
				this.input = Input_TextButton(context, input_id, settings).attachTo(td_input);
				break;
			case INPUT_TYPE.BUTTON:
				this.input = Input_Button(context, input_id, settings).attachTo(td_input);
				break;	
			default:
		}
	}

}


/**
 * Simple text input.
 * @param {Context} context Context.
 * @param {string} input_id ID.
 * @param {object} settings Styles, classes, ...
 * @returns The input.
 */
const Input_Text = (context, input_id, settings) => {
	settings.styles = Object.assign({}, settings.styles, {"flex-grow":1, "width": "100%"});
	const input = new InputText(settings);
	input.setId(input_id);
	input.setAttribute("name", input_id);
	input.dom.addEventListener('change', (e)=>context.signals.onPropertyChanged.dispatch(input_id, e.target.value) );
	return input;
}


/**
 * Simple number input.
 * @param {Context} context Context.
 * @param {string} input_id ID.
 * @param {object} settings Styles, classes, ...
 * @returns The input.
 */
const Input_Number = (context, input_id, settings) => {	
	settings.styles = Object.assign({}, settings.styles, {"flex-grow":1, "width": "100%"});
	const input = new InputNumber(settings);
	input.setId(input_id);
	input.setAttribute("name", input_id);	
	input.dom.addEventListener('change', (e)=>context.signals.onPropertyChanged.dispatch(input_id, e.target.value) );
	return input;
}

/**
 * Color pickup input.
 * @param {Context} context Context.
 * @param {string} input_id ID.
 * @param {object} settings Styles, classes, ...
 * @returns The input.
 */
const Input_Color = (context, input_id, settings) => {	
	settings.styles = Object.assign({}, settings.styles, {"flex-grow":1, "width": "100%"});
	const input = new InputColor(settings);
	input.setId(input_id);
	input.setAttribute("name", input_id);
	input.dom.addEventListener('change', (e)=>context.signals.onPropertyChanged.dispatch(input_id, e.target.value) );	
	return input;
}


/**
 * Select input.
 * @param {Context} context Context.
 * @param {string} input_id ID.
 * @param {object} settings Styles, classes, ...
 * @returns The input.
 */
const Input_Select = (context, input_id, settings) => {
	settings.styles = Object.assign({}, settings.styles, {"flex-grow":1});	
	const input = new Select(settings);
	input.setId(input_id);
	input.setAttribute("name", input_id);
	input.dom.addEventListener('change', (e)=>context.signals.onPropertyChanged.dispatch(input_id, e.target.value) );
	return input;
}

/**
 * Text input with a button.
 * @param {Context} context Context.
 * @param {string} input_id ID.
 * @param {object} settings Styles, classes, ...
 * @returns The input.
 */
const Input_TextButton = (context, input_id, settings) => {	
	const div = new Div();

	settings.styles = Object.assign({}, settings.styles, {"flex-grow":1, "width": "80%"});
	const input = new InputText(settings);
	input.setId(input_id);
	input.setAttribute("name", input_id);	

	const button = new Button(settings.hasOwnProperty('icon')?settings.icon:"...");
	button.setStyle("width", "20%");
	button.setId("btn-" + input_id);
	button.setAttribute("type","button");

	input.attachTo(div);
	button.attachTo(div);

	input.dom.addEventListener('change', (e)=>context.signals.onPropertyChanged.dispatch(input_id, e.target.value) );
	button.dom.addEventListener('click', (e)=>context.signals.onPropertyBtnClicked.dispatch(input_id, e.target.value) );

	return div;
}



const Input_Button = (context, input_id, settings) => {	

	settings.styles = Object.assign({}, settings.styles, {"flex-grow":1, "width": "100%"});
	const input = new Button(settings.hasOwnProperty('text')?settings.text:"XXX", settings);
	input.setId("btn-" + input_id);
	input.setAttribute("type","button");

	input.dom.addEventListener('click', (e)=>context.signals.onPropertyBtnClicked.dispatch(input_id, e.target.value) );	
	
	return input;
}
