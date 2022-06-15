
import { 
    Div,  
    Label, 
    ButtonAndAwesomeIcon, 
    Text, 
    Table, TableThead, TableTbody, TableTd, TableTh, TableTr
} from '/static/js/ui/BuildingBlocks.js';
import { PRE_GROUP_ID, GROUP_CLASS, PRE_SELECT_ID, GROUP_TYPE } from './constants.js';
import { CollapsibleCard } from '../ui/CollapsibleCard.js';
import { FormGroupInput } from '../ui/FormGroupInput.js';
import { InputGroupAppend } from '../ui/InputGroupAppend.js';
import { CRElementSelector } from './CRElementSelector.js';
import { subStr } from '/static/js/jsutils.js';
import { PROPERTIES_ID } from '../constants/constants.js';
import { Translator } from '/static/js/Translator.js';
import { YesNoSelector } from '../ui/YesNoSelector.js';

/**
 * Group.
 */
export class Group extends CollapsibleCard {

    /**
     * Constructor.
     * @param {Context} context Context.
     * @param {string} id Group ID
     * @param {string} name Group Name
     */
    constructor(context, id, name) {
        super(id, GROUP_CLASS);
        this.context = context;
        this.name = name;
        const self = this;

        this.setTitle(subStr(name, 32, 32) + ' [' + id + ']');

        $(this.header.dom).toggleClass('is-empty bg-warning');

        const row_1 = new Div({classes:['row']}).attachTo(this.body);


        // -------- GROUP NAME --------------

        const div_name = new FormGroupInput(PRE_SELECT_ID + id, null, name,Translator.translate('Group Name/Description:')).attachTo(row_1);
        div_name.addClass('col-3');

        // Change group name
        div_name.input.dom.addEventListener('change', function(e) {
            let new_name = e.target.value;
            if (new_name === '') {
                e.target.value = self.name;
                new_name = self.name;
            } else {
                self.name = new_name;
                self.setTitle(subStr(new_name, 32, 32) + ' [' + id + ']');
                self.context.signals.onGroupRenamed.dispatch(self.id, new_name);
            }
        });        

        // -------- DATABASE FIELD --------------
        
        const div_db = new Div({classes:['col-3']}).attachTo(row_1);

        new Label(Translator.translate('Database Field:')).attachTo(div_db);
        this.db_field = new InputGroupAppend(
            null, 
            null, 
            null, 
            'text', 
            "Database Field", 
            'fa fa-search',
            'success',
            null, 
            (irrelevant, self) => {
                context.signals.onRequireDBFieldSelection.dispatch((value) => {this.db_field.setValue(value)});
        }).attachTo(div_db);
        this.db_field.input.setAttribute('readonly','true');

        // -------- SELECT - REQUIRED --------------        

        const col_3_row_2 = new Div({classes:['col-2']}).attachTo(row_1);
        const form_group_required = new Div({classes:['form-group']}).attachTo(col_3_row_2);
        new Label(Translator.translate('Required:')).attachTo(form_group_required);
        this.required_check = new YesNoSelector(context).attachTo(form_group_required);


        // -------- SELECT - AVAILABLE ELEMENTS --------------        

        const col_2_row_2 = new Div({classes:['col-4']}).attachTo(row_1);

        const form_group_element = new Div({classes:['form-group']}).attachTo(col_2_row_2);

        const name_element = new Label(Translator.translate('Elements to Add:')).attachTo(form_group_element);
        name_element.setAttribute('for',PRE_GROUP_ID + 'add-element-' + id)

        this.element_selector = new CRElementSelector(context, (_id, _label, _type) => {
                self.addElement(_id, _label, _type);                
        }).attachTo(form_group_element);


        // -------- TABLE - ELEMENTS IN THE GROUP --------------

        const row_2 = new Div({classes:['row']}).attachTo(this.body);
        const col_row_2 = new Div({classes:['col-12']}).attachTo(row_2);
        new Text('Elements in the group:').attachTo(col_row_2);
        const table = new Table({classes:['table','table-hover','mt-2','tight-table']}).attachTo(this.body);
        const thead = new TableThead().attachTo(table);
        const tr_head = new TableTr().attachTo(thead);
        const th_1 = new TableTh().attachTo(tr_head);
        th_1.setTextContent('ID');
        const th_2 = new TableTh().attachTo(tr_head);
        th_2.setTextContent('Label');
        const th_3 = new TableTh().attachTo(tr_head);
        th_3.setTextContent('Operations');
        th_3.addClass('text-center');        
        this.tbody = new TableTbody().attachTo(table);

  
        // -------- REMOVE STUFF -------------
        
        // Remove group and set all existing element to the default group
        this.close_btn.dom.addEventListener('click', function(e) {
            self.remove();
        });
        
        // Remove an element from the group
        this.tbody.dom.addEventListener('click', function (e) {
            if (e.target.classList.contains('gp-remove-element')) {
                let row = e.target.parentNode.parentNode;
                const id = row.dataset.id;
                row.parentNode.removeChild(row);

                // if empty, then group has no type
                if ($(self.tbody.dom).find('tr').length === 0) {
                    self.setGroupType(GROUP_TYPE.NONE);
                }
                self.element_selector.setSelectorType(self.group_type);

                context.signals.onElementRemovedFromGroup.dispatch(id);
            }
        });

        this.signal_onElementRemoved = context.signals.onElementRemoved.add(this.elementRemoved, this);
        this.signal_onElementLabelChanged = context.signals.onElementLabelChanged.add(this.elementLabelChanged, this);
    }

    /**
     * Removes this group. 
     * Removes from dom and clear signals.
     */
    remove() {
        // make sure all removed elements in group, making them available.
        const rows = this.tbody.dom.getElementsByTagName("tr");
        for (let i=0; i<rows.length; i++) {
            this.context.signals.onElementRemovedFromGroup.dispatch(rows[i].dataset.id);
        }
        this.context.signals.onGroupRemoved.dispatch(this.id);

        // clear the signals
        this.signal_onElementRemoved.detach();
        this.signal_onElementLabelChanged.detach();        
        this.element_selector.clear(); 

        // remove from dom
        this.detach();
    }


    /**
     * Adds a row to the table.
     * @param {string} id Element ID.
     * @param {string} label Element label.
     * @param {string} type Element type.
     * @param {boolean} signal If true, dispatch signal indicating that an element was added to the group, 
     *                          otherwise, no dispatch (used for restoring)
     */
    addElement(id, label, type, signal = true) {
        //console.log("add ", id, label, type, signal);
        const tr =  new TableTr().attachTo(this.tbody);
        tr.setAttribute('data-id', id);
    
        const td_1 = new TableTd().attachTo(tr);
        td_1.setTextContent(id);
        const td_2 = new TableTd().attachTo(tr);
        td_2.dom.innerHTML = (label!==id && label !=='')?label:('<span class="badge badge-danger p-2">' + Translator.translate("LABEL NOT DEFINED YET!") + '</span>');
        const td_3 = new TableTd({classes:['text-center']}).attachTo(tr);
        new ButtonAndAwesomeIcon('','fa fa-trash', {classes:['btn','btn-danger','btn-sm','gp-remove-element']}).attachTo(td_3);

        // first element in group => set the group's type, for filtering purposes.
        if ($(this.tbody.dom).find('tr').length === 1) {
            this.setGroupType(GROUP_TYPE[type]);
            //console.log("new type > ", GROUP_TYPE[type]);
        }
        this.element_selector.setSelectorType(this.group_type);

        // not loading from existing form => dispatch signal to normal operations.
        if (signal) {
            this.context.signals.onElementAdded2Group.dispatch(id, this.id);
        }
    }


    /**
     * == Listener ==
     * 
     * The label of an element changed.
     * 
     * @param {Element} element Element
     * @param {string} new_label New Label
     * @returns 
     */
    elementLabelChanged(element, new_label) {
        if (!element.type.availability.groups) return;
        const id = element.props[PROPERTIES_ID.IDPROPERTY];        
        const ele = $(this.tbody.dom).find(`[data-id='${id}']`);
        if (ele.length == 0) return;
        ele.children().eq(1).text(new_label);
    }

    /**
     * == Listener ==
     * 
     * An element was deleted.
     * 
     * @param {string} element_id Element ID.
     * @param {ELEMENT_TYPE} type ELEMENT_TYPE. Check constants.js.
     */
    elementRemoved(element_id, type) {
        if (!type.availability.groups) return;
        
        const ele = $(this.tbody.dom).find(`[data-id='${element_id}']`);
        if (ele.length == 0) return false;
        ele.remove();
    
        if ($(this.tbody.dom).find('tr').length === 0) {
            this.setGroupType(GROUP_TYPE.NONE);
        }
        this.element_selector.setSelectorType(this.group_type);
        return true;
    }

    /**
     * Sets the type of the group.
     * @param {GROUP_TYPE} type Group type. Check constants.js.
     */
    setGroupType(type) {
        this.group_type = type;
        if (type === GROUP_TYPE.NONE) {
            $(this.header.dom).toggleClass('is-empty is-ok');
        } else {
            $(this.header.dom).toggleClass('is-ok is-empty');            
        }
        this.context.signals.onGroupTypeChanged.dispatch(this.id, type);
    }

    /**
     * Get the current group type.
     * @returns GROUP_TYPE. See constants.js.
     */
    getType() {
        return this.element_selector.selector_type;
    }

    setDatabaseField(field) {
        this.db_field.setValue(field);
    }

}
