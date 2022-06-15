import { PROPERTIES_ID } from '/static/designer/js/constants/constants.js';
import { Div } from '/static/js/ui/BuildingBlocks.js';
import { Status } from '../Status.js';

export class BaseElement extends Div {
    constructor(context, props=null) {
        super();
        this.status = { ...Status};
        this.props = props;
        this.real_id = props?props[PROPERTIES_ID.IDPROPERTY]:null;
        this.section = props?props[PROPERTIES_ID.SECTIONPROPERTY]:null;
        const visible = props?props[PROPERTIES_ID.VISIBLEPROPERTY] === 'yes':true;
        this.group = props?props[PROPERTIES_ID.GROUPPROPERTY]:null;
        const crossed = props?props[PROPERTIES_ID.CROSSEDPROPERTY] === 'yes':false;

        if (!visible) $(this.dom).hide();
        if (crossed) {
            this.addClass('cross');
            // dispatch signal, otherwise it would be required to go
            // element by element setting up code
            context.signals.onDisabled.dispatch(this.real_id);
        }

        if (context.isExport) return;

        context.signals.onHidden.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
                $(this.dom).hide();
            }
        })
        context.signals.onShowed.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
                $(this.dom).show();
            }
        })
        // || !props => checkbox group
        context.signals.onCrossed.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {// || !props) {
                this.addClass('cross');
            }
        })
        // || !props => checkbox group
        context.signals.onUncrossed.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {// || !props) {
                this.removeClass('cross');
            }
        })
        /*
        context.signals.onRequired.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
                this.status = {'validations': ["REQUIRED"]};
            }
        })
        context.signals.onNotRequired.add((id) => {
            if (id === this.real_id || id === this.section || id === this.group) {
                if (this.status) {
                    this.status.validations.splice(this.status.validations.indexOf("REQUIRED"), 2)
                }
            }
        })
        */          
    }


    save() {
        this.status.id = this.real_id;
        this.status.visible = $(this.dom).css('display') !== 'none';//$(this.dom).is(':visible'); //!this.hasClass('collapse');
        this.status.crossed = this.hasClass('cross');
    }

    async restore(data) {
        this.status = data;
        //this.status.enabled = data.enabled;
        if (this.status.crossed) this.addClass('cross');
        if (this.status.visible)
            $(this.dom).show();
        else
            $(this.dom).hide();
    }

    /**
     * Clear the element.
     * Signals are cleared in by the context.
     */
    clear() {
        this.status = null;
    }    
}