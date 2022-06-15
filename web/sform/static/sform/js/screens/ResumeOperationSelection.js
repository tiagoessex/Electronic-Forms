import { fetchGET } from '/static/js/Fetch.js';
import { mysqlTimeStamp2JS } from '/static/js/jstime.js';
import { URL_LIST_OPERATIONS } from '/static/js/urls.js';
import { TableTr, TableTd } from '/static/js/ui/BuildingBlocks.js';
import { 
        RESUME_OPERATION_SECTION,
        RESUME_NO_CONTENT,
        RESUME_HAS_CONTENT,
        RESUME_OPERATIONS_AVAILABLE,
        BACK_BTN
} from "../ids.js";
import { TITLE_RESUME_OPERATION_SELECTION, STATUS } from "../constants.js";
import { Title } from '../Title.js';


export function ResumeOperationSelection(context) {
    this.context = context;
    const ref = this;

    this.title = new Title(TITLE_RESUME_OPERATION_SELECTION, () => {
        console.log("ResumeFormSelection");
        $(RESUME_OPERATION_SECTION).collapse('hide');
        ref.title.hide();
        context.signals.onMain.dispatch();  
    });

    $(RESUME_OPERATIONS_AVAILABLE).on('click', function(e) {
        
        ref.context.form_operation_id = $(e.target.parentNode).data('id');
        ref.context.form_operation_name = $(e.target.parentNode).data('name');
        ref.context.form_operation_description = $(e.target.parentNode).data('description');
        ref.context.form_id = $(e.target.parentNode).data('form');
        ref.context.form_name = $(e.target.parentNode).data('form-name');

        $(RESUME_OPERATION_SECTION).collapse('hide');
        ref.title.hide();
        context.new_operation = false;
        context.resume = true;
        //context.continue = true;
        context.signals.onFillForm.dispatch();

    });

}

ResumeOperationSelection.prototype = {

    show: function () {
        this.title.show();
        $(RESUME_OPERATION_SECTION).collapse('show');    
        $(BACK_BTN).collapse('show');        
        this.getOperations();
    },

    getOperations: function () {
        $('#resume-operation-spinner').show();
        fetchGET(URL_LIST_OPERATIONS + STATUS.OPEN + '/', 
            (result) => {
                $(RESUME_OPERATIONS_AVAILABLE).empty();
                if (result.length > 0) {
                    $(RESUME_NO_CONTENT).collapse('hide');
                    $(RESUME_HAS_CONTENT).collapse('show');      
                } else {
                    $(RESUME_HAS_CONTENT).collapse('hide');
                    $(RESUME_NO_CONTENT).collapse('show'); 
                }
                const table = $(RESUME_OPERATIONS_AVAILABLE)[0];
                // order by ID
                result.reduceRight((_, operation) => {
                    const row = new TableTr().attachTo(table);
                    if (parseInt(operation.id)<0) {
                        row.setStyle('color','red');
                        row.setStyle('background-color','#FFFFCC');
                    }                    
                    row.setAttribute('data-id', operation.id);
                    row.setAttribute('data-name', operation.name);
                    row.setAttribute('data-form', operation.form);
                    row.setAttribute('data-form-name', operation.form_name);
                    row.setAttribute('data-description', operation.description);
                    //row.setAttribute('data-name', operation.name);
                    const id = new TableTd().attachTo(row);
                    const name = new TableTd().attachTo(row);
                    const description = new TableTd().attachTo(row);
                    const date = new TableTd().attachTo(row);
                    const form = new TableTd().attachTo(row);
                    id.setTextContent(parseInt(operation.id)<0?'-':operation.id);
                    name.setTextContent(operation.name);
                    description.setTextContent(operation.description);
                    date.setTextContent(mysqlTimeStamp2JS(operation.date_creation));
                    form.setTextContent(operation.form_name);
                }, null)
                $('#resume-operation-spinner').hide();
            },
            (error) => {
                $('#resume-operation-spinner').hide();
                this.context.signals.onError.dispatch(error,"[ResumeOperationSelection::getOperations]");
            }
        );       
    },
   
}
