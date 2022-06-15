
import { ALteCollapsibleCard } from '/static/js/ui/ALteCollapsibleCard.js';
import { Div, TextArea, AwesomeIconAndButton } from '/static/js/ui/BuildingBlocks.js';
import { OpFormData } from '../OpFormData.js';
import { download, searchForRelativeUrls } from '/static/js/jsfiles.js';
import { today } from '/static/js/jsutils.js';
import { fetchPOST } from '/static/js/Fetch.js';
import { URL_SET_OPERATION_STATUS } from '/static/js/urls.js';
import { STATUS } from "../constants.js";
import { OPERATIONS_TRANSFER_FILTER } from '../ids.js';
import { Translator } from '/static/js/Translator.js';


export class TransferCard extends ALteCollapsibleCard {
    constructor(context, title, id, operation_id, onClose) {
        super(title, id, onClose);

        const self = this;
        this.data = null;

        const row = new Div({classes:['row']}).attachTo(this.getBody());
        const col_left = new Div({classes:['col-10']}).attachTo(row);
        const col_right = new Div({classes:['col-2']}).attachTo(row);

        const text_area_gp = new Div({classes:['form-group']}).attachTo(col_left);
        this.text_area = new TextArea(6,null,{classes:['form-control','bg-light','font-weight-bold']}).attachTo(text_area_gp);
        this.text_area.setStyle('height','210px');

        const operations_area = new Div({classes:['btn-group-vertical','btn-block']}).attachTo(col_right);
        const json_file = new AwesomeIconAndButton(Translator.translate(' Json File'),'fas fa-download', {classes:['btn','btn-primary','mb-1','btn-block','anim-btn']}).attachTo(operations_area);
        const zip_file = new AwesomeIconAndButton(Translator.translate(' Zip File'),'fas fa-download', {classes:['btn','btn-success','mb-1','btn-block','anim-btn']}).attachTo(operations_area);
        const pdf = new AwesomeIconAndButton(' PDF','fas fa-file-pdf', {classes:['btn','btn-warning','mb-1','btn-block','anim-btn']}).attachTo(operations_area);
        const database = new AwesomeIconAndButton(Translator.translate(' Database'),'fas fa-database', {classes:['btn','btn-dark','mb-1','btn-block','anim-btn']}).attachTo(operations_area);
        const complete = new AwesomeIconAndButton(Translator.translate(' Set as Completed'),'fas fa-check', {classes:['btn','btn-danger','btn-block','anim-btn']}).attachTo(operations_area);
        
        new OpFormData(context, operation_id, (data) => {
            this.data = data;
            this.filter(data);
        })

        $(json_file.dom).on('click', function() {
            const name = 'operation_' + operation_id + '_' + today() + '.json'
            download(self.text_area.dom.value, name,'json');
        })

        $(complete.dom).on('click', function() {
            context.signals.onAYS.dispatch(Translator.translate("Mark operation as Completed?"), () => {
                self.completed(operation_id, complete);
            });
        })

        $(database.dom).on('click', function() {
            context.signals.onTransferModal.dispatch(operation_id, self.data);
        })        

        $(zip_file.dom).on('click', function() {
            const name = 'operation_' + operation_id + '_' + today();
            var zip = new JSZip();
            zip.file(name + '.json', self.text_area.dom.value);

            // get the relative path of all assets (only images)
            const images = [];
            searchForRelativeUrls(JSON.parse(self.text_area.dom.value), images);

            // add images folder to the zip file
            let folder = null;
            if (images.length > 0)
                folder = zip.folder('images');

            // fetch all images and add them to the zip file
            var promises = [];
            images.forEach(imageUrl => {
                promises.push(
                fetch(imageUrl).then(response => {
                    return response.blob().then(function(myBlob) {
                        const name = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                        const imageFile = new File([myBlob], name, {base64: true});
                        if (folder) folder.file(name, imageFile);                        
                    });                    
                }));                
            });

            // zip and download file
            Promise.all(promises).then(() => {
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    saveAs(content, name + '.zip');
                }); 
            });
        })
    }

    completed (operation_id, btn) {
        fetchPOST(URL_SET_OPERATION_STATUS,
            {
                operation_id: operation_id,
                status: STATUS.COMPLETED,
            },
            (result) => {
                $(btn.dom).hide();
            },
            (error) => {
                this.context.signals.onError.dispatch(error,"[TransferCard::completed]");
            }
        );
    }
    /*
    setData(data) {        
        this.data = data;
        this.text_area.dom.value = JSON.stringify(this.filter(), null,'\t');
    }
    */

    getData() {
        return this.data;
    }  
    
    filter() {
        const keys = [];
        const sel = $(OPERATIONS_TRANSFER_FILTER).select2('data');
        for (let key in sel) {
            keys.push(sel[key].id)
        }
        // close the data
        //const _data = {...this.data}; // only in modern browsers
        const _data = JSON.parse(JSON.stringify(this.data));
        console.log(_data.groups);
        _data.groups.forEach(rc => {
            if (!keys.includes('id') && rc.hasOwnProperty('id')) delete rc.id;
            if (!keys.includes('value') && rc.hasOwnProperty('value')) delete rc.value;
            if (!keys.includes('name') && rc.hasOwnProperty('name')) delete rc.name;
            if (!keys.includes('label') && rc.hasOwnProperty('label')) delete rc.label;
            if (!keys.includes('database') && rc.hasOwnProperty('db_field')) delete rc.db_field;
            if (!keys.includes('type') && rc.hasOwnProperty('type')) delete rc.type;
            if (!keys.includes('validations') && rc.hasOwnProperty('validations')) delete rc.validations;
            if (rc.hasOwnProperty('selected_elements')) {
                rc.selected_elements.forEach(s_e => {
                    if (!keys.includes('id') && s_e.hasOwnProperty('id')) delete s_e.id;
                    if (!keys.includes('value') && s_e.hasOwnProperty('value')) delete s_e.value;
                    if (!keys.includes('name') && s_e.hasOwnProperty('name')) delete s_e.name;
                    if (!keys.includes('label') && s_e.hasOwnProperty('label')) delete s_e.label;
                    if (!keys.includes('database') && s_e.hasOwnProperty('db_field')) delete s_e.db_field;
                    if (!keys.includes('type') && s_e.hasOwnProperty('type')) delete s_e.type;
                    if (!keys.includes('validations') && s_e.hasOwnProperty('validations')) delete s_e.validations;                
                });
            }
        })
        _data.elements.forEach(element => {
            if (!keys.includes('id') && element.hasOwnProperty('id')) delete element.id;
            if (!keys.includes('value') && element.hasOwnProperty('value')) delete element.value;
            if (!keys.includes('name') && element.hasOwnProperty('name')) delete element.name;
            if (!keys.includes('label') && element.hasOwnProperty('label')) delete element.label;
            if (!keys.includes('database') && element.hasOwnProperty('database')) delete element.database;
            if (!keys.includes('type') && element.hasOwnProperty('type')) delete element.type;
            if (!keys.includes('validations') && element.hasOwnProperty('validations')) delete element.validations;
        })
        this.text_area.dom.value = JSON.stringify(_data, null,'\t');
    }
}


