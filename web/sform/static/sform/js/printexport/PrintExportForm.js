/**
 * Use these functions in case, the existence of FormViewBuilder is not certain.
 * If exists, then it will use it to proceed, otherwise, it will create the form in an iframe
 * and use it to print the form.
 */

import { URL_GET_FORM } from '/static/js/urls.js';
import { fetchGET } from '/static/js/Fetch.js';
import { FormViewBuilder } from '../views/formview/FormViewBuilder.js';



/**
 * Exports the form/operation to a PDF document.
 * If formview is given => is on screen => printing form + operation data
 * @param {number} id Form ID.
 * @param {FormViewBuilder} formview FormViewBuilder reference.
 * @param {function} onReady Called when export completed.
 * @param {function} onError Called if any error.
 * @param {Context} context Context.
 * @param {string} filename Output PDF filename.
 */
export function exportPDF(id, formview=null, onReady, onError, context, filename='form.pdf') {
    context.isExport = true;
    if (!formview) {
        const frame = build();
        buildForm(id, frame, context, 
            (_formview) => {
                _formview.pdfForm(() => {
                    frame.remove(); 
                    context.isExport = false;
                    onReady();
                }, (error) => onError(error), filename);
            },
            (error) => {
                context.isExport = false;
                onError(error);                
             })
    } else {
        formview.pdfForm(() => onReady(), (error) => onError(error), filename);  
    }
}

/**
 * Exports the form to a base64 string.
 * If formview is given => is on screen => printing form + operation data
 * @param {number} id Form ID.
 * @param {FormViewBuilder} formview FormViewBuilder reference.
 * @param {function} onReady Called when export completed.
 * @param {function} onError Called if any error.
 * @param {Context} context Context.
 */
 export function exportBase64PDF(id, formview=null, onReady, onError, context) {
    context.isExport = true;
    if (!formview) {
        const frame = build();
        buildForm(id, frame, context, 
            (_formview) => {
                _formview.base64PDFForm((pdf_data) => {
                    frame.remove(); 
                    context.isExport = false;
                    onReady(pdf_data);
                }, (error) => onError(error));
            },
            (error) => {
                context.isExport = false;
                onError(error);                
             })
    } else {
        formview.base64PDFForm((pdf_data) => onReady(pdf_data), (error) => onError(error));  
    }
}



/**
 * Prints the form.
 * @param {number} id Form ID.
 * @param {FormViewBuilder} formview FormViewBuilder reference.
 * @param {function} onReady Called when export completed.
 * @param {function} onError Called if any error.
 * @param {Context} context Context.
 */
export function exportPRINTER(id, formview=null, onReady, onError, context) {
    context.isExport = true;
    if (!formview) {
        const frame = build();
        buildForm(id, frame, context, 
            (_formview) => {
                _formview.printForm(() => {
                    frame.remove();
                    context.isExport = false;
                    onReady();
                }, (error) => onError(error));
            },
            (error) => {
                context.isExport = false;
                onError(error); 
            })
    } else {
        formview.printForm(() => onReady(), (error) => onError(error));  
    }
}


/**
 * Builds an iframe, where the form will be build.
 * @returns An iframe node.
 */
 function build() {
    const form_dom = $("<iframe>").get(0);
    $("body").append(form_dom);
    return form_dom;
}

/**
 * 
 * @param {number} id Form ID.
 * @param {node} form_dom Form parent.
 * @param {Context} context Context.
 * @param {function} onReady Called when export completed.
 * @param {function} onError Called if any error.
 */
function buildForm(id, form_dom, context, onReady, onError) {
    const url = URL_GET_FORM + id + '/';    
    fetchGET(url, 
        (result) => {
            const form = result.form;
            if (form) {                
                if (onReady) onReady(new FormViewBuilder(form_dom, form, context));
            } else {                
                if (onError) onError("Invalid form!");
            }
        },
        (error) => {
            if (onError) onError(error);
        }
    );
}