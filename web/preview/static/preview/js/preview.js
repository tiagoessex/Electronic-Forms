
import { fetchGET } from '/static/js/Fetch.js';
import { URL_GET_FORM } from '/static/js/urls.js';
import { FormViewBuilder } from '/static/sform/js/views/formview/FormViewBuilder.js';
import { ListViewBuilder } from '/static/sform/js/views/listview/ListViewBuilder.js';
import { EASystem } from '/static/sform/js/ea/EASystem.js';
import { Context } from '/static/sform/js/Context.js'
import { ErrorModal } from '/static/js/modals/ErrorModal.js';
import { BarcodeModal } from '/static/sform/js/modals/BarcodeModal.js';
import { Translator } from '/static/js/Translator.js';
import { WarningModal } from '/static/js/modals/WarningModal.js';
import { FoodexModal } from '/static/sform/js/modals/FoodexModal.js';


const SPINNER = $('#preview-spinner');

// ------------
// --- INIT ---
// ------------


Translator.setLanguage($('#selected-lang-form').val());

$(function() {
    new Preview();
});


function Preview() {
    this.context = new Context();
    this.context.is_preview = true;
    this.form = null;
    const self = this;
    this.form_name = null;

    // --------------
    // --- MODALS ---
    // --------------
    /**
    * Error modal.
    */
    const error_modal = new ErrorModal().attachTo($('#modals-container').get(0));

    /**
     * Warning modal.
     */
    const warning_modal = new WarningModal().attachTo($('#modals-container').get(0));


    /**
     * Barcode capture/read modal.
     */
    const barcode_modal = new BarcodeModal(
        Translator.translate('Barcode Capture/Reader'),
        Translator.translate('Chose capture mode!'),
    ).attachTo($('#modals-container').get(0));


    /**
     * Foodex modal.
     */
    const foodex_modal = new FoodexModal(this.context);
    foodex_modal.init();


    // ---------------
    // --- SIGNALS ---
    // ---------------    
    this.context.signals.onError.add((msg, origin=null) => {
        error_modal.show(msg);
        console.error((origin?origin:'') + msg);
    });
    this.context.signals.onWarning.add((text) => {
        warning_modal.show(text);
    });    
    this.context.signals.onBarcodeReader.add((setResults = null, onError = null) => {
        barcode_modal.show(setResults, onError);
    });
    this.context.signals.onFoodexModal.add((onSelection) => {
        foodex_modal.show(onSelection);
    });


    // -----------------
    // --- OPEN FORM ---
    // -----------------  
    


    // -----------------------
    // --- BUTTONS ACTIONS ---
    // -----------------------

    $('#btn-preview-form-view').click(function() {
        self.context.signals.onViewChanged.dispatch();
    });

    $('#btn-preview-list-view').click(function() {
        self.context.signals.onViewChanged.dispatch();
    });

    $('#btn-preview-stats').click(function() {
        $('#stats-view').show();
        $('#form-view').hide();
        $('#list-view').hide();
        $('#btn-preview-print').hide();
        $('#btn-preview-pdf').hide();
    })
    $('#btn-preview-form-view').click(function() {
        $('#stats-view').hide();
        $('#form-view').show();
        $('#list-view').hide();
        $('#btn-preview-print').show();
        $('#btn-preview-pdf').show();
    })
    $('#btn-preview-list-view').click(function() {
        $('#stats-view').hide();
        $('#form-view').hide();
        $('#list-view').show();
        $('#btn-preview-print').hide();
        $('#btn-preview-pdf').hide();
    })
    $('#btn-preview-print').click(function() {
        if (!self.form) return false;
        self.form.printForm(null, (err) => {
            self.context.signals.onError.dispatch("Printing error! " + err, "[preview::printForm]"); 
        })
    })
    $('#btn-preview-pdf').click(function() {
        if (!self.form) return false;
        $("body").css("cursor","progress");
        $("#btn-preview-pdf").css("cursor","progress");
        self.form.pdfForm(() => {
            $("body").css("cursor","auto");
            $("#btn-preview-pdf").css("cursor","auto");   
        }, (err) => {
            $("body").css("cursor","auto");
            $("#btn-preview-pdf").css("cursor","auto");
            self.context.signals.onError.dispatch("Error while creating the PDF! " + err, "[preview::pdfForm]");             
        }, self.form_name)
    });

    this.loadForm();
}

Preview.prototype = {

    xxx: async function(dom) {
        await this.form.replicateData(dom);
    },

    loadForm: function() {
        if ($('#form-id-hidden').val() !== '') {
            const form_id = $('#form-id-hidden').val();
            this.context.form_id = form_id;
            const url = URL_GET_FORM + form_id + '/';
            fetchGET(url, 
                (result) => {
                    const form = result.form;
                    if (form) {
                        this.form_name = result.name;
                        this.stats(result);
                        const name = (result.name.length > 8 ? result.name.substring(0, 16) + '...' : result.name);
                        $('#form-name').text(name + ' [' + result.id + ']');                
                        this.setViews(form);
                        SPINNER.hide();
                    } else {
                        SPINNER.hide();
                        this.context.signals.onError.dispatch(Translator.translate("NO FORM! Nothing to show."), "[preview::loadForm]");
                    }
                },
                (error) => {
                    SPINNER.hide();
                    this.context.signals.onError.dispatch(error, "[preview::loadForm]");
                }
            );          
        } else {
            SPINNER.hide();
            this.context.signals.onError.dispatch(Translator.translate('No Form ID specified!'), "[preview::loadForm]");
        }
    },

    /**
     * Get and present the main stats of the form.
     * @param {FormInfo} data FormInfo object.
     */
    stats: function(data) {
        $('#id').html(data.id);
        $('#name').html(data.name);
        $('#description').html(data.description);
        $('#date').html(data.date_created);
        $('#n_pages').html(data.form.pages.length);
        $('#n_sections').html(data.form.sections.length);
        $('#n_groups').html(data.form.groups.length);
        $('#n_elements').html(data.form.elements.length);
        $('#n_eas').html(Object.keys(data.form.eas).length);

        let s = '';
        data.form.sections.forEach(section => {
            s += section.name + "<br/>"
        });
        $("#sections").html(s);

        s = '';
        data.form.groups.forEach(gp => {
            s += gp.name + "<br/>"
        });
        $("#groups").html(s);


        const eas = {};
        for (const key in data.form.eas) {
            const type=data.form.eas[key].type;
            if (eas.hasOwnProperty(type))
                eas[type] += 1;
            else
                eas[type]  = 1;
        }    
        s = '';
        for (const key in eas) {
            s += key + " : " + eas[key] + "<br/>"
        }
        $("#eas").html(s);



        const element_types = {};
        for (let i = 0; i<data.form.elements.length; i++) {
            const type=data.form.elements[i].type;
            if (element_types.hasOwnProperty(type))
                element_types[type] += 1;
            else
                element_types[type]  = 1;
        }    
        s = '';
        for (const key in element_types) {
            s += key + " : " + element_types[key] + "<br/>"
        }
        $("#elements").html(s);

    },

    /**
     * Parse and display all views.
     * @param {object} data Json object representing a form.
     */
    setViews: function(data) {
        /*
        this.parent = document.createElement('div');
        this.parent.style.visibility = 'hidden';
        document.body.appendChild(this.parent);
        this.form = new FormViewBuilder(this.parent, data, this.context);
        */
        this.form = new FormViewBuilder(document.getElementById('tablet-form'), data, this.context);        
        const list_view = new ListViewBuilder(document.getElementById('list-view-accordion'), data, this.context);
        new EASystem(this.context).clear().setup(data['eas']);
        list_view.createHeader(this.form.lv_header_elements);
    },    

}
