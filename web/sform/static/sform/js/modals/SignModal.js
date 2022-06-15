
import { Div, Img } from '/static/js/ui/BuildingBlocks.js'
import { printBase64 } from '../printexport/Print.js'
import { 
    STATUS_GREEN, 
    STATUS_ORANGE, 
    STATUS_RED,
    URL_IS_OPERATION_SIGNED,
    getFileFromUrl 
} from '/static/js/urls.js'
import { fetchGET } from '/static/js/Fetch.js';
import { Translator } from '/static/js/Translator.js';
import { UploadAsset } from '/static/js/UploadAsset.js';
import { ASSETTYPE } from '/static/js/assettype.js';
import { APP } from '/static/js/constants.js';
import { isChrome } from '/static/js/jsdetection.js';



const SM_DIV_SIZE_X = 210;
const SM_DIV_SIZE_Y = 297;

const SM_SIG_MODAL = $('#signature-modal');
const SM_PAGE_NUMBER = $('#sm-page-number');
const SM_LAST_PAGE = $('#sm-last-page');
const SM_RESTART_BTN = $('#sm-restart-btn');
const SM_ADD_BTN = $('#sm-add-btn');
const SM_SIGNATURES_AREA = $('#sm-signatures-area');
const SM_SIG_LOCATION_PAGE = $('#sm-signature-location-page');
//const ALERT_EXISTS = $('#sm-alert-exists');
const SM_OK_BTN = $('#sm-ok');
const SM_PRINT_BTN = $('#sm-print');
const SM_SPINNER = $('#sm-sign-processing');
const SM_CANCEL_BTN = $('#sm-cancel');
const SM_CANCEL_TIMES_BTN = $('#sm-close-times');

const SIGNING_TIME = 30000; // 30 seconds

const SM_STATUS = {
    GREEN: "GREEN",
    ORANGE: "ORANGE",
    RED: "RED",
}

/**
 * Modal to sign the filled operation form (in PDF format) with a smart card.
 * If successful:
 *  - closes the operation
 *  - adds the signed pdf to the annexes with the name DOC_SIGNED.pdf
 * If fails:
 *  - exits without any change
 * If a file named DOC_SIGNED.pdf already exists, then overwrites it.
 * @param {Context} context Context.
 */
export function SignModal(context) {
    this.context = context;
    this.signatures = {};           // to keep track of each signature in each page
    this.page = 1;                  // current page
    this.last = false;              // signature at the last page
    this.operation_id = null;
    this.original_pdf_data = null;  // base64 pdf data - this should remain constant
    this.pdf_data = null;           // base64 pdf data - this will be modified as the signatures are inserted
    const self = this;
    this.total_sigs = 0;            // total number of ok signatures
    this.current_status = null;     // status of the current on-going signature    
    this.ready = true;              // ready for another signature
    this.next_sig_position = [0,0]; // signature location
    this.sign_timeout = null;

    SM_ADD_BTN.on('click', function() {
        if (!self.ready) return;
        self.lock();
        self.changeStatus(self.current_status, SM_STATUS.ORANGE);
        // TODO: send data to extension

        window.postMessage({ 
            origin: "APP", 
            content: {
                data: self.pdf_data, 
                pos_x: self.next_sig_position[0], 
                pos_y: self.next_sig_position[1], 
                page: self.page
            }
        }, "*");

        self.sign_timeout = setTimeout(() => {
            clearTimeout(self.sign_timeout);
            self.unlock();
            self.changeStatus(self.current_status, SM_STATUS.RED);
            console.error("ERROR > registry error?");
            self.context.signals.onWarning.dispatch(Translator.translate("Attention: either you are taking too long to input the PIN number or there is something wrong with the native application or with the APLICAÇÃO AUTENTICAÇÃO.GOV!"));
        }, SIGNING_TIME);
    })

    SM_RESTART_BTN.on('click', function() {
        if (!self.ready) return;
        self.reset();
    })

    SM_OK_BTN.on('click', function() {
        if (!self.ready) return;
        self.uploadSignedDoc();
        SM_SIG_MODAL.modal('hide');
    })

    SM_PRINT_BTN.on('click', function() {
        if (!self.ready) return;
        printBase64(self.pdf_data);
   })

   SM_CANCEL_BTN.on('click', function() {
        if (!self.ready) return;
        self.close();
   })

   SM_CANCEL_TIMES_BTN.on('click', function() {
        if (!self.ready) return;
        self.close();
    })


    SM_PAGE_NUMBER.on('change paste focus', function() {
        if (!self.ready) return;
        if (self.page == SM_PAGE_NUMBER.val()) return;
        SM_SIG_LOCATION_PAGE.empty();
        self.page = SM_PAGE_NUMBER.val();
        self.loc = self.addSignatureLocation(self.total_sigs+1, (x,y) => {
            self.next_sig_position = self.position2Interval(x,y);
        }).attachTo(SM_SIG_LOCATION_PAGE.get(0));        
        // update visual indication of signatures in page
        const signatures = self.signatures[self.page];
        if (signatures === undefined) return;
        signatures.forEach(signature => {
            self.addSignatureLocation(signature.number, null, true, [signature.left, signature.top]).attachTo(SM_SIG_LOCATION_PAGE.get(0))
            /*
            const loc = self.interval2Position(signature.left, signature.top);
            sig.setStyle('left', loc[0] + "px");
            sig.setStyle('top', loc[1] + "px");
            console.log(loc);
            */
        });
    })


    SM_LAST_PAGE.on('change', function() {
        if (!self.ready) return;
        self.last = SM_LAST_PAGE.prop('checked');
        SM_PAGE_NUMBER.val(SM_PAGE_NUMBER.prop('max'));
        SM_PAGE_NUMBER.trigger('change');
        if (SM_LAST_PAGE.prop('checked')) {
            SM_PAGE_NUMBER.prop('disabled', true);
        } else {
            SM_PAGE_NUMBER.prop('disabled', false);
        }
    })

    /**
     * Comunication with extension and stuff.
     */
     window.addEventListener("message", (event) => {
		// We only accept messages from ourselves and from native
        // here NATIVE also implies native related errors, such as does not exist
		if (event.source != window || event.data.origin !== 'NATIVE') {
		  return;
		}        
		const key =  event.data.content.key;
		const data = event.data.content.data;
        if (key === 'test') {
            // test && error => no native app installed
            if ( event.data.content.result &&  event.data.content.result === "ERROR") {
                self.unlock();
                self.changeStatus(self.current_status, SM_STATUS.RED);
                console.error("ERROR > ", key, event.data.content.message);
                self.context.signals.onWarning.dispatch(Translator.translate(event.data.content.message));
            }
        }
		else if (key === 'status') {
            console.warn("SIGNING STATUS > ", key, data);
		} else if (key === 'error') {
            self.unlock();
            self.changeStatus(self.current_status, SM_STATUS.RED);
            console.error("ERROR > ", key, data);
            self.context.signals.onWarning.dispatch(data);
		} else if (key === 'result') {
            self.unlock();
            console.log("RESULT > ", key);//, data);
            self.pdf_data = data;
            self.messageOk();
            clearTimeout(self.sign_timeout);
        }            
	}, false);
}


SignModal.prototype = {

    close: function() {
        this.context.signals.onAYS.dispatch(
            Translator.translate("Cancel the signing process?"),
            () => {
                this.original_pdf_data = null;
                this.pdf_data = null;
                SM_SIG_MODAL.modal('hide');
            },
            () => {}
        );
    },

    /**
     * Locks all modal operations.
     */
    lock: function() {
        SM_SPINNER.css('visibility','visible');
        this.ready = false;
        if (this.loc) $(this.loc.dom).draggable("disable");
    },

    /**
     * Unlocks all modal operations.
     */
    unlock: function() {
        SM_SPINNER.css('visibility','hidden');
        this.ready = true;
        $(this.loc.dom).draggable("enable");
    },

    messageOk: function(x,y) {
        this.total_sigs++;
        
        const location = this.interval2Position(this.next_sig_position[0], this.next_sig_position[1]);

        if (!(this.page in this.signatures)) this.signatures[this.page] = [];
        this.signatures[this.page].push({number: this.total_sigs, left:location[0], top:location[1]});

        this.addSignatureLocation(this.total_sigs, null, true, location).attachTo(SM_SIG_LOCATION_PAGE.get(0));
        this.loc.setTextContent('#' + (this.total_sigs + 1));
        this.loc.setStyle('top','0px');
        this.loc.setStyle('left','0px');

        this.changeStatus(this.current_status, SM_STATUS.GREEN);
        this.current_status = this.addStatus(this.total_sigs + 1).attachTo(SM_SIGNATURES_AREA.get(0));
    },

    reset: function() {
        SM_SIG_LOCATION_PAGE.empty();
        SM_SIGNATURES_AREA.empty();
        SM_PAGE_NUMBER.val(1);            
        SM_PAGE_NUMBER.prop('disabled', false);
        SM_LAST_PAGE.prop('checked', false);        
        this.signatures = {};
        this.pdfdata = null;
        this.page = 1;
        this.last = false;
        this.next_sig_position = [0,0];
        this.pdf_data = this.original_pdf_data;
        this.sign_timeout = null;

        this.loc = this.addSignatureLocation(1, (x,y) => {
            this.next_sig_position = this.position2Interval(x,y);
        }).attachTo(SM_SIG_LOCATION_PAGE.get(0));        
        this.current_status = this.addStatus(1).attachTo(SM_SIGNATURES_AREA.get(0));
        
    },

    /**
     * Show modal.
     * @param {number} operation_id Operation ID.
     */
    show: function(operation_id, form_view) {
        this.operation_id = operation_id;
        if (isChrome()) {
            if (localStorage.getItem("has_sign_extension") === null || localStorage.getItem('has_sign_extension') === 'false') {
                this.context.signals.onWarning.dispatch(Translator.translate("Smart Card Signing Extension not installed!"));
            } else {
                SM_SIG_MODAL.modal('show');
                //SM_SPINNER.css('visibility','visible');
                this.lock();
                this.reset();     
                this.checkSignStatus(                    
                    () => {
                        this.context.signals.onWarning.dispatch(
                            Translator.translate("The operation is already signed! Either delete the signed document or the resulting document will be: ") + "DOC_SIGNED_[***]. "
                        );
                        this.prepare2Sign(form_view);
                    }, () => {
                        this.prepare2Sign(form_view);
                    }
                ); 
            }
        } else {
            this.context.signals.onWarning.dispatch(Translator.translate("Smart card signatures are only available in Chrome!"));
        }
    },

    prepare2Sign: function(form_view) {
        this.context.signals.onBase64PDF.dispatch(this.context.form_id, form_view, (data) => {
            this.original_pdf_data = data[0];
            this.pdf_data = data[0];            
            SM_PAGE_NUMBER.prop('max', data[1])
            this.unlock();
        });
        /*
        SM_PAGE_NUMBER.prop('max', 5)
        this.original_pdf_data = pdf_test_data;
        this.pdf_data = pdf_test_data;
        */
    },

	
    /**
     * Get signature position in the page with coordinates between 0 and 1.
     * Top left: [0,0]
     * Center: [0.5,0.5]
     * Note: the location is relative to top left of the signture and not its center. This
     * means that [0.5,0.5], is actually not in the center, but offset to the right and down.
     * @param {number} left Left location in relation to the parent.
     * @param {number} top Top location in relation to the parent. 
     * @returns Set of coordinates, between [0,1], indicating the position in the page.
     */
	position2Interval: function(left, top) {
		const x = parseFloat(Math.abs(left / SM_DIV_SIZE_X).toFixed(2));
		const y = parseFloat(Math.abs(top / SM_DIV_SIZE_Y).toFixed(2));
		return [x,y]
	},

    /**
     * Get signature position in the page with coordinates between 0 and DIV_SIZE_?.
     * @param {number} left [0,1]
     * @param {number} top [0,1]
     * @returns Set of coordinates, between [0,DIV_SIZE_?], indicating the position in the page.
     */
	interval2Position: function(left, top) {
		const x = parseInt(Math.abs(left * SM_DIV_SIZE_X));
		const y = parseInt(Math.abs(top * SM_DIV_SIZE_Y));
		return [x,y]
	},

    addStatus: function(number) {
        const row = new Div();
        row.addClass('row');

        const col_text = new Div().attachTo(row);
        col_text.addClass('col-8');
        col_text.setTextContent("#" + number);

        const col_img = new Div().attachTo(row);
        col_img.addClass('col-3');

        const img = new Img(STATUS_RED).attachTo(col_img);
        img.addClass("signature-status-color");

        return row;
    },

    changeStatus: function(sig, status = SM_STATUS.ORANGE) {
        const x = $(sig.dom).find('.signature-status-color');
        switch (status) {
            case SM_STATUS.ORANGE: 
                x.prop('src',STATUS_ORANGE);
                break;
            case SM_STATUS.RED: 
                x.prop('src',STATUS_RED);
                break;
            default:
                x.prop('src',STATUS_GREEN);
        }	
    },

    addSignatureLocation(number, onStop= null, done=false, pos = [0,0]) {
        const loc = new Div();
        loc.addClass((done?'signature-location-done':'signature-location') + ' justify-content-center d-flex align-items-center font-weight-bold');
        loc.setTextContent('#' + number);
        loc.setStyle('top', pos[1] + "px");
        loc.setStyle('left', pos[0] + "px");
        if (!done) {
            //loc.addClass('signature-location');
            $(loc.dom).draggable({ 
                containment: ".signature-location-page", 
                scroll: false,
                stop: function( event, ui ) {
                    if (onStop) return onStop(ui.position.left, ui.position.top);
                }
            });
        } /*else {
            loc.addClass('signature-location-done')
        }*/

        return loc;
    },

    checkSignStatus: function(onExists = null, onDontExists = null) {
        SM_SPINNER.css('visibility','visible');
        const url = URL_IS_OPERATION_SIGNED + this.operation_id + '/';
        fetchGET(url, 
            (result) => {                
                //SM_SPINNER.css('visibility','hidden');
                if (result.exists) {
                    if (onExists) onExists();
                } else {
                    if (onDontExists) onDontExists();
                }
            },
            (error) => {
                SM_SPINNER.css('visibility','hidden');
                this.context.signals.onError.dispatch(Translator.translate("Error while checking if opertion was signed!"),
                "[SignModal::checkSignStatus]");
            }
        );
    },

    /**
     * Upload signed document.
     */
    uploadSignedDoc: function() {
        if (Object.keys(this.signatures).length == 0) return;
        const form = $('<form>', {name: 'form', enctype: 'multipart/form-data'});
        const data = new FormData(form.get(0));
        //const filename = "DOC_" + this.operation_id + "_SIGNED.pdf";
        const filename = "DOC_SIGNED.pdf";
        data.append('file', 'data:application/pdf;base64,' + this.pdf_data);
        data.append('is_annex', true);

        UploadAsset(
            data, 
            this.operation_id,
            filename, 
            ASSETTYPE.PDF, 
            APP.OPERATION, 
            (result) => {
                this.context.changed = true;
                this.context.signals.onAnnexUploaded.dispatch(getFileFromUrl(result.asset), this.operation_id, result.id);
                this.context.signals.saveOperation.dispatch();
            }, 
            (error) => {
                this.context.signals.onError.dispatch(error,"[SignModal::uploadSignedDoc]");  
            }
        );
        
    },

}


//const pdf_test_data = "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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC/24NDAgAAAABB/1+7wQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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";