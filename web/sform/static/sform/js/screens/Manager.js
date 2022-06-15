import { mysqlTimeStamp2JS, today } from '/static/js/jstime.js';
import { fetchGET, fetchPOST } from '/static/js/Fetch.js';
import { 
    URL_LIST_NON_COMPLETED_OPERATIONS,
    URL_SET_OPERATION_STATUS,
    URL_DELETE_OPERATION,
    URL_VALIDATE_OPERATION_INPUTS,
    URL_OPERATIONS_ASSETS
} from '/static/js/urls.js';
import { TableTr, TableTd, AwesomeIconAndButton, Div, Link } from '/static/js/ui/BuildingBlocks.js';
import { 
    OPERATIONS_MANAGER_SECTION,
    OPERATIONS_NO_CONTENT,
    OPERATIONS_HAS_CONTENT,
    OPERATIONS_AVAILABLE,
    BACK_BTN,
    CLOSE_ALL_BTN,
    OPEN_ALL_BTN,
    DELETE_ALL_BTN,
    FILTER_BY,
} from "../ids.js";
import { TITLE_OPERATIONS_MANAGER, STATUS } from "../constants.js";
import { Title } from '../Title.js';
import { Badge } from '/static/js/ui/Badge.js';
import { Translator } from '/static/js/Translator.js';
import { download } from '/static/js/jsfiles.js';
import { OpFormData } from '../OpFormData.js';
import { ELEMENTS_TYPE } from '/static/designer/js/elements/constants.js';



const OPERATION_ROW_CLASS = 'manager-operations-row';
const OPERATION_OPEN_CLASS = 'manager-operation-row-open';
const OPERATION_CLOSE_CLASS = 'manager-operation-row-close';
const OPERATION_TRANSFER_CLASS = 'manager-operation-row-transfer';
const OPERATION_BADGE_CLASS = 'manager-operation-row-badge';
//const OPERATION_COMPLETE_CLASS = 'manager-operation-row-complete';
const OPERATION_VALIDATE_CLASS = 'manager-operation-validate';
const OPERATION_SIGN_CLASS = 'manager-operation-signature';

export function Manager(context) {
    this.context = context;
    const self = this;

    this.title = new Title(TITLE_OPERATIONS_MANAGER, () => {
        self.hide();
        context.signals.onMain.dispatch();
    });


    $(CLOSE_ALL_BTN).on('click',function() {
        context.signals.onAYS.dispatch(Translator.translate("Close all operations?"), () => {
            $(OPERATIONS_AVAILABLE).find("tr").each(function() {
                const operation_id = $(this).attr('data-id');
                self.close(operation_id, $(this)[0]);
            });
        });        
    })

    $(OPEN_ALL_BTN).on('click',function() {
        context.signals.onAYS.dispatch(Translator.translate("Open all operations?"), () => {
            $(OPERATIONS_AVAILABLE).find("tr").each(function() {
                const operation_id = $(this).attr('data-id');
                self.open(operation_id, $(this)[0]);
            });
        });          
    })

    
    $(DELETE_ALL_BTN).on('click',function() {
        context.signals.onAYS.dispatch(Translator.translate("Delete all operations?"), () => {
            $(OPERATIONS_AVAILABLE).find("tr").each(function() {
                const operation_id = $(this).attr('data-id');
                self.delete(operation_id, $(this)[0]);
            });
        });          
    })

    $(FILTER_BY).on('change', function(e) {
        const filter_by = e.target.value;
        $(OPERATIONS_AVAILABLE).find("tr").each(function() {
            const status = $(this).attr('data-status');
            if (status === filter_by || filter_by === 'ALL') {
                $(this).removeClass('collapse')
            } else {
                $(this).addClass('collapse');
            }
        });
    });
    
}

Manager.prototype = {

    /**
     * Show the screen.
     */
    show: function () {
        this.context.clear();
        this.title.show();
        $(OPERATIONS_MANAGER_SECTION).collapse('show');    
        $(BACK_BTN).collapse('show');
        this.getOperations();
    },

    /**
     * Hide the screen.
     */
    hide: function () {
        $(OPERATIONS_MANAGER_SECTION).collapse('hide');
        this.title.hide();        
    },

    /**
     * Get all OPEN | CLOSED operations.
     */
    getOperations: function () {
        $('#manager-spinner').show();
        const self = this;
        fetchGET(URL_LIST_NON_COMPLETED_OPERATIONS, 
            (result) => {
                $(OPERATIONS_AVAILABLE).empty();
                if (result.length > 0) {
                    $(OPERATIONS_NO_CONTENT).collapse('hide');
                    $(OPERATIONS_HAS_CONTENT).collapse('show');      
                } else {
                    $(OPERATIONS_HAS_CONTENT).collapse('hide');
                    $(OPERATIONS_NO_CONTENT).collapse('show'); 
                }
                const table = $(OPERATIONS_AVAILABLE)[0];
                // order by the most recent
                result.reduceRight((_, operation) => {
                    const row = new TableTr().attachTo(table);
                    if (parseInt(operation.id)<0) {
                        row.setStyle('color','red');
                        row.setStyle('background-color','#FFFFCC');
                    }
                    row.setAttribute('data-id', operation.id);
                    row.setAttribute('data-status', operation.status_name);
                    row.addClass(OPERATION_ROW_CLASS);
                    const id = new TableTd({classes:['text-center']}).attachTo(row);
                    const name = new TableTd().attachTo(row);
                    const description = new TableTd().attachTo(row);
                    const date = new TableTd({classes:['text-center']}).attachTo(row);
                    const status = new TableTd({classes:['text-center',OPERATION_BADGE_CLASS]}).attachTo(row);
                    const operations = new TableTd({classes:['text-center']}).attachTo(row);
                    //id.setTextContent(operation.id);
                    id.setTextContent(parseInt(operation.id)<0?'-':operation.id);
                    name.setTextContent(operation.name);      
                    description.setTextContent(operation.description);
                    date.setTextContent(mysqlTimeStamp2JS(operation.date_creation));

                    const group = new Div({classes:['btn-group']}).attachTo(operations);

                    const close = _button('fas fa-lock', [OPERATION_CLOSE_CLASS], 'outline-primary', Translator.translate('Close Operation')).attachTo(group);
                    $(close.dom).on('click',function() {
                        console.log(operation.id);
                        self.close(operation.id, row.dom);
                    })

                    const open = _button('fas fa-lock-open', [OPERATION_OPEN_CLASS], 'outline-success', Translator.translate('Open Operation')).attachTo(group);
                    $(open.dom).on('click',function() {
                        self.open(operation.id, row.dom);
                    })

                    const transfer_group = new Div().attachTo(group);
                    transfer_group.addClass('btn-group');  
                    const transfer_btn = _button('fa fa-exchange-alt', ['dropdown-toggle',OPERATION_TRANSFER_CLASS], 'outline-info', Translator.translate('Transfer operation')).attachTo(transfer_group);
                    transfer_btn.setAttribute('data-toggle','dropdown');
                    transfer_btn.setAttribute('aria-haspopup','true');
                    transfer_btn.setAttribute('aria-expanded','false');
                    const transfer_div = new Div().attachTo(transfer_btn);
                    transfer_div.addClass('dropdown-menu');
                    /*
                    const database_btn = new Link().attachTo(transfer_div);
                    database_btn.addClass('dropdown-item edit-form');
                    database_btn.setAttribute('href','javascript:void(0)');
                    database_btn.setAttribute('disabled','true');
                    database_btn.setTextContent(Translator.translate('Directly to Database'));
                    */
                    const json_btn = new Link().attachTo(transfer_div);
                    json_btn.addClass('dropdown-item edit-form');
                    json_btn.setAttribute('href','javascript:void(0)');
                    json_btn.setTextContent(Translator.translate('Json/Text File'));
                    const zip_file_btn = new Link().attachTo(transfer_div);
                    zip_file_btn.addClass('dropdown-item edit-form');
                    zip_file_btn.setAttribute('href','javascript:void(0)');
                    zip_file_btn.setTextContent(Translator.translate('Zip File'));
                    /*
                    $(database_btn.dom).on('click',function() {
                        // ----------------------
                        $("body").css("cursor","progress");
                        fetchGET(URL_VALIDATE_OPERATION_INPUTS + operation.id + '/',
                            (result) => {
                                //console.log(result);
                                $("body").css("cursor","auto");
                            },
                            (error) => {
                                $("body").css("cursor","auto");
                                self.context.signals.onError.dispatch(error,"[Manager::getOperations::database_btn]");
                            }
                        );
                        // ----------------------                           
                    })
                    */
                    $(json_btn.dom).on('click',function() {
                        $("body").css("cursor","progress");
                        new OpFormData(self.context, operation.id, (data) => {
                            const name = 'operation_' + operation.id + '_' + today() + '.json'
                            download(JSON.stringify(data, null,'\t'), name,'json');
                            $("body").css("cursor","auto");
                        })
                    })
                    $(zip_file_btn.dom).on('click',function() {
                        $("body").css("cursor","progress");
                        new OpFormData(self.context, operation.id, (data) => {
                            const _data = JSON.stringify(data, null,'\t');

                            const name = 'operation_' + operation.id + '_' + today();
                            var zip = new JSZip();
                            zip.file(name + '.json', _data);
                
                            // get the full path of all assets (only images)
                            const images = [];
                            data.elements.forEach(element => {
                                switch (element.type) {
                                    case ELEMENTS_TYPE.BARCODE_IMAGE.name:
                                        if (element.value.image) {
                                            const image = URL_OPERATIONS_ASSETS + operation.id + '/' + element.value.image;
                                            images.push(image);
                                        }
                                        break;
                                    case ELEMENTS_TYPE.SIGNATURE.name:
                                    case ELEMENTS_TYPE.DRAWING.name:
                                    case ELEMENTS_TYPE.USERIMAGE.name:
                                        if (element.value) images.push(URL_OPERATIONS_ASSETS + operation.id + '/' + element.value);
                                        break;
                                }
                            });
                            data.annexes.forEach(annex => {
                                if (annex) images.push(URL_OPERATIONS_ASSETS + operation.id + '/' + annex);
                            });


                
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
                                    $("body").css("cursor","auto");
                                    saveAs(content, name + '.zip');
                                }); 
                            });

                        });                        
                    })      

                    const validate = _button('fas fa-check', [OPERATION_VALIDATE_CLASS], 'info', Translator.translate('Validate Operation')).attachTo(group);
                    $(validate.dom).on('click',function() {
                        self.context.signals.onValidation.dispatch(operation.id);
                    })

                    const sign = _button('fas fa-signature', [OPERATION_SIGN_CLASS], 'warning', Translator.translate('Close & Sign')).attachTo(group);
                    $(sign.dom).on('click',function() { 
                        self.context.signals.onSignModal.dispatch(operation.id, () => {}, () => {});
                    })

                    /*
                    const completed = _button('fas fa-window-close', [OPERATION_COMPLETE_CLASS], 'dark', Translator.translate('Complete Operation')).attachTo(group);
                    $(completed.dom).on('click',function() {
                        self.context.signals.onAYS.dispatch(Translator.translate("Mark operation") + " [" + operation.name + "] " + Translator.translate("as COMPLETED? There is no way back, after this!"), () => {
                            self.completed(operation.id, row);
                        });
                    })
                    */

                    const remove = _button('fas fa-trash', [], 'danger', Translator.translate('Delete Operation')).attachTo(group);
                    $(remove.dom).on('click',function() {
                        self.context.signals.onAYS.dispatch(Translator.translate("Delete operation") + " [" + operation.name + "]?", () => {
                            self.delete(operation.id, row.dom);
                        });                        
                    })
                    self._setStatus(operation.status_name, row.dom);
                }, null)
                $('#manager-spinner').hide();
            },
            (error) => {
                $('#manager-spinner').hide();
                //self.context.signals.onError.dispatch(error);
                self.context.signals.onError.dispatch(error,"[Manager::getOperations]");
            })
    },

    /**
     * Display the status of an operation row: buttons and badge.
     * @param {string} status Status (see constants.js: OPEN | CLOSED | COMPLETED).
     * @param {node} row Table row.
     */
    _setStatus(status, row) {
        const badge = $(row).find("." + OPERATION_BADGE_CLASS);
        const open = $(row).find("." + OPERATION_OPEN_CLASS);
        const close = $(row).find("." + OPERATION_CLOSE_CLASS);
        const transfer = $(row).find("." + OPERATION_TRANSFER_CLASS);
        const sign = $(row).find("." + OPERATION_SIGN_CLASS);
        //const complete = $(row).find("." + OPERATION_COMPLETE_CLASS);
        row.setAttribute('data-status', status);
        badge.empty();
        if (status === STATUS.OPEN) {
            new Badge('primary', status,'p-2').attachTo(badge[0]);
            open.css('visibility','hidden');
            //complete.css('visibility','hidden');
            close.css('visibility','visible');
            transfer.css('visibility','hidden');
            //sign.css('visibility','visible');
        } else {
            new Badge('warning', status,'p-2').attachTo(badge[0]);
            open.css('visibility','visible');
            close.css('visibility','hidden');
            //complete.css('visibility','visible');
            transfer.css('visibility','visible');
            //sign.css('visibility','hidden');
        }
    },

    /**
     * Close a specific operation.
     * @param {number} operation_id Operation ID.
     * @param {node} row Table row.
     */
    close: function (operation_id, row=null) {
        //console.log(operation_id, row);
        $("body").css("cursor","progress");
        fetchPOST(URL_SET_OPERATION_STATUS,
            {
                operation_id: operation_id,
                status: STATUS.CLOSED,
            },
            (result) => {
                $("body").css("cursor","auto");
                this._setStatus(STATUS.CLOSED, row);                
            },
            (error) => {
                $("body").css("cursor","auto");
                this.context.signals.onError.dispatch(error,"[Manager::close]");
            }
        );
    },

    /**
     * Open a specific operation.
     * @param {number} operation_id Operation ID.
     * @param {node} row Table row.
     */    
    open: function (operation_id, row=null) {
        $("body").css("cursor","progress");
        fetchPOST(URL_SET_OPERATION_STATUS,
            {
                operation_id: operation_id,
                status: STATUS.OPEN,
            },
            (result) => {
                $("body").css("cursor","auto");
                this._setStatus(STATUS.OPEN, row);
            },
            (error) => {
                $("body").css("cursor","auto");
                this.context.signals.onError.dispatch(error,"[Manager::open]");
            }
        );       
    },

    /**
     * Deletes a specific operation.
     * @param {number} operation_id Operation ID.
     * @param {node} row Table row.
     */    
    delete: function (operation_id, row=null) {
        $("body").css("cursor","progress");
        fetchPOST(URL_DELETE_OPERATION,
            {
                operation_id: operation_id,
            },
            (result) => {
                $("body").css("cursor","auto");
                if (row) $(row).remove();
            },
            (error) => {
                $("body").css("cursor","auto");
                this.context.signals.onError.dispatch(error,"[Manager::delete]");
            }
        ); 
    },

    /*
    completed: function (operation_id, row) {
        $("body").css("cursor","progress");
        fetchPOST(URL_SET_OPERATION_STATUS,
            {
                operation_id: operation_id,
                status: STATUS.COMPLETED,
            },
            (result) => {
                $("body").css("cursor","auto");
                $(row.dom).hide();
            },
            (error) => {
                $("body").css("cursor","auto");
                this.context.signals.onError.dispatch(error,"[Manager::completed]");
            }
        );
    }
    */
   
}


/**
 * Helper builder function.
 * @param {*} icon 
 * @param {*} classes 
 * @param {*} color 
 * @param {*} tooltip 
 * @returns 
 */
function _button(icon, classes, color='primary', tooltip='') {
    const btn = new AwesomeIconAndButton('',icon);
    //btn.addClass('btn-actions');
    btn.addClass('btn');
    btn.addClass('btn-' + color);
    btn.addClass('mr-1');
    btn.addClass('btn-sm');
    //btn.setStyle('width','28px');
    classes.forEach(_class => {btn.addClass(_class)});
    btn.setAttribute('data-toggle','tooltip');
    btn.setAttribute('title',tooltip);
    return btn;
}