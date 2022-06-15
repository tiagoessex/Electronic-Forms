import { TITLE_OPERATIONS_TRANSFER } from "../constants.js";
import {    
    OPERATIONS_TRANSFER_SECTION,
    BACK_BTN,
    OPERATIONS_TRANSFER_REFRESH_BTN,
    OPERATIONS_TRANSFER_EXECUTE_ALL_BTN,
    OPERATIONS_TRANSFER_ALL_AS,
} from "../ids.js";
import { Title } from '../Title.js';
import { TransferCard } from '../TransferCard.js';
import { download, searchForRelativeUrls } from '/static/js/jsfiles.js';
import { today } from '/static/js/jsutils.js';
import { Translator } from '/static/js/Translator.js';

export function Transfer(context) {
    this.context = context;
    const ref = this;

    this.transfers = {};

    this.title = new Title(TITLE_OPERATIONS_TRANSFER, () => {
        this.title.hide();
        $(OPERATIONS_TRANSFER_SECTION).collapse('hide');        
        this.context.signals.onManager.dispatch();
    }, [
        {
            name:'<span class="text-danger"><i class="fa fa-home" aria-hidden="true"></i> ' + Translator.translate("Back to Main") + '</span>', callback:()=> {            
            this.title.hide();    
            $(OPERATIONS_TRANSFER_SECTION).collapse('hide');
            context.signals.onMain.dispatch();
        }},
    ]);

    $(OPERATIONS_TRANSFER_REFRESH_BTN).on('click', function() {
        for(let key in ref.transfers) {
            ref.transfers[key].filter();
        }
    })

    $(OPERATIONS_TRANSFER_EXECUTE_ALL_BTN).on('click', function() {
        var op = $(OPERATIONS_TRANSFER_ALL_AS).val();
        switch (op) {
            case 'json-file':
                ref.jsonAll();
                break;
            case 'zip-file-comb':
                ref.zipAll();
                break;
            case 'zip-file-split': 
                ref.zipSplitted();
                break;
            case 'database': 
                break;
        }
    })    

}

Transfer.prototype = {

    /**
     * Show the screen.
     */
    show: function (operations) {
         this.title.show();
        $(OPERATIONS_TRANSFER_SECTION).collapse('show');
        $(BACK_BTN).collapse('show');

        this.process(operations);
    },

    process: function(operations) {
        const sel = $('#transfer-operations-list');
        sel.empty();
        const LIST = sel[0];
        operations.forEach(operation => {
            this.transfers[operation] = new TransferCard(
                this.context, 
                "Operation ID: " + operation, 
                "transfer-card-id-" + operation, 
                operation,
                () => {
                    delete this.transfers[operation];
                }).attachTo(LIST);
        });
    },

    jsonAll: function() {
        const name = 'operations_' + today() + '.json';
        const data = {};
        for(let key in this.transfers) {
            data[key] = this.transfers[key].getData();
        }
        download(JSON.stringify(data), name,'json');
    },

 
    zipAll: function() {
        const name = 'operations_' + today();
        var zip = new JSZip();     

        const data = {};
        const folder = {};
        let images = [];
        for(let key in this.transfers) {            
            data[key] = JSON.parse(this.transfers[key].getData());
            const imgs = [];
            searchForRelativeUrls(data[key], imgs);
            if (imgs.length > 0) {
                images = images.concat(imgs)
                folder[key] = zip.folder(key);
            }
        }

        zip.file(name + '.json', JSON.stringify(data));

       
        // fetch all images and add them to the zip file
        var promises = [];
        images.forEach(imageUrl => {
            promises.push(
            fetch(imageUrl).then(response => {
                return response.blob().then(function(myBlob) {
                    const parts = imageUrl.split('/');
                    const name = parts[parts.length-1];
                    const op = parts[parts.length-2];
                    const imageFile = new File([myBlob], name, {base64: true});
                    if (folder.hasOwnProperty(op)) folder[op].file(name, imageFile);                        
                });
            })); 
        });

        // zip and download file
        Promise.all(promises).then(() => {
            zip.generateAsync({type:"blob"})
            .then(function(content) {
                saveAs(content, name + '.zip');
            }); 
        })
    },
    
    zipSplitted: function() {
        const name = 'operations_' + today();
        var zip = new JSZip();     

        const folder = {};
        let images = [];
        for(let key in this.transfers) {            
            const data = JSON.parse(this.transfers[key].getData());
            zip.file('operation_' + key + '.json', JSON.stringify(data));
            const imgs = [];
            searchForRelativeUrls(data, imgs);
            if (imgs.length > 0) {
                images = images.concat(imgs)
                folder[key] = zip.folder(key);
            }
        }

       
        // fetch all images and add them to the zip file
        var promises = [];
        images.forEach(imageUrl => {
            promises.push(
            fetch(imageUrl).then(response => {
                return response.blob().then(function(myBlob) {
                    const parts = imageUrl.split('/');
                    const name = parts[parts.length-1];
                    const op = parts[parts.length-2];
                    const imageFile = new File([myBlob], name, {base64: true});
                    if (folder.hasOwnProperty(op)) folder[op].file(name, imageFile);                        
                });
            })); 
        });

        // zip and download file
        Promise.all(promises).then(() => {
            zip.generateAsync({type:"blob"})
            .then(function(content) {
                saveAs(content, name + '.zip');
            }); 
        })
        

    },    

}

