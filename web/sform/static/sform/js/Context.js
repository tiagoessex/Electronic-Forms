/**
 * Shared with the Preview and opeditview apps.
 */


export class Context {
    constructor() {

        // ---------------
        // --- SIGNALS ---
        // ---------------
        this.Signal = signals.Signal;
        this.signals = {

            // --- GENERAL ---
            // for logging
            onStuffDone: new this.Signal(),
            // dialogs
            onError: new this.Signal(),            
            onAYS: new this.Signal(),            
            onWarning: new this.Signal(),

            // --- EASYSTEM ---
            onEventChanged: new this.Signal(),
            onEventCleared: new this.Signal(),
            onEventFilled: new this.Signal(),
            onEventFormOpened: new this.Signal(),
            onEventUnselected: new this.Signal(),
            onEventSelected: new this.Signal(),


            // --- APP ---
            // inter view communication
            onFormValueChanged: new this.Signal(),    // for form <-> list elements communication ... only for some
            onListValueChanged: new this.Signal(),    // for form <-> list elements communication ... only for some            
            onViewChanged: new this.Signal(),
            onSectionOpened: new this.Signal(),
            onAddRow: new this.Signal(),
            onRemoveRow: new this.Signal(),

            // actions
            onEnabled: new this.Signal(),
            onDisabled: new this.Signal(),
            onShowed: new this.Signal(),
            onHidden: new this.Signal(),
            onCrossed: new this.Signal(),
            onUncrossed: new this.Signal(),
            onSelected: new this.Signal(),
            onUnselected: new this.Signal(),
            onRequired: new this.Signal(),
            onNotRequired: new this.Signal(),

            // screens
            onMain: new this.Signal(),
            onFormSelection: new this.Signal(),
            onOperationDetails: new this.Signal(),
            onFillForm: new this.Signal(),
            onResumeOperationSelection: new this.Signal(),
            onManager: new this.Signal(),
            onSync: new this.Signal(),
            
            // operations
            onBarcodeReader: new this.Signal(),
            onAnnexModal: new this.Signal(),
            onAnnexUploaded: new this.Signal(),
            onAnnexRemoved: new this.Signal(),
            //onTransferModal: new this.Signal(),
            onPrint: new this.Signal(),
            onPdf: new this.Signal(),
            onValidation: new this.Signal(),
            onSignModal: new this.Signal(),
            onBase64PDF: new this.Signal(),
            onFoodexModal: new this.Signal(),

            // to flag something changed after save
            onChange: new this.Signal(),

            saveOperation: new this.Signal(),       // trigger to save the operation
        }

        // globals - ATT: NECESSARY FOR SAVING OPERATIONS
        this.form_id = null;
        this.form_name = null;
        this.form_operation_name = null;
        this.form_operation_description = null;
        this.form_operation_id = null;

        this.new_operation = true;
        this.resume = false;

        // true if the context belongs to the preview app
        // used, for example, to prevent uploding/removing images, ...
        this.is_preview = false;

        // indicates any change
        this.changed = false;

        this.signals.onStuffDone.add((msg) => console.log("Log message > ", msg)); 
        
        // is currently printing or exporting to pdf
        this.isExport = false;

        this.setChangeListeners();

    }


    clear(clearsignals = false) {
        this.form_id = null;
        this.form_name = null;
        this.form_operation_name = null;
        this.form_operation_description = null;
        this.form_operation_id = null;

        this.new_operation = true;
        this.resume = false;

        this.changed = false;

        if (clearsignals) this.clearSignals();
    }

    /**
     * Set the listeners required to flag wheather a change happened or not.
     */
    setChangeListeners() {
        this.signals.onChange.add(() => this.changed = true); 
        this.signals.onFormValueChanged.add(() => this.signals.onChange.dispatch());
        this.signals.onListValueChanged.add(() => this.signals.onChange.dispatch());
        this.signals.onEnabled.add(() => this.signals.onChange.dispatch());
        this.signals.onDisabled.add(() => this.signals.onChange.dispatch());
        this.signals.onShowed.add(() => this.signals.onChange.dispatch());
        this.signals.onHidden.add(() => this.signals.onChange.dispatch());
        this.signals.onCrossed.add(() => this.signals.onChange.dispatch());
        this.signals.onUncrossed.add(() => this.signals.onChange.dispatch());
        this.signals.onSelected.add(() => this.signals.onChange.dispatch());
        this.signals.onUnselected.add(() => this.signals.onChange.dispatch()); 
        this.signals.onRequired.add(() => this.signals.onChange.dispatch()); 
        this.signals.onNotRequired.add(() => this.signals.onChange.dispatch()); 
        this.signals.onAddRow.add(() => this.signals.onChange.dispatch());
        this.signals.onRemoveRow.add(() => this.signals.onChange.dispatch());
        this.signals.onRemoveRow.add(() => this.signals.onChange.dispatch());
    }    

    /**
     * Remove listeners used in the form filling.
     * App operational signals (ex: onMain) remain.
     */
    clearSignals(clearEA = true, setChange = true) {
        this.signals.onFormValueChanged.removeAll();
        this.signals.onListValueChanged.removeAll();
        this.signals.onViewChanged.removeAll();
        this.signals.onSectionOpened.removeAll();
        this.signals.onAddRow.removeAll();
        this.signals.onRemoveRow.removeAll();

        this.signals.onEnabled.removeAll();
        this.signals.onDisabled.removeAll();
        this.signals.onShowed.removeAll();
        this.signals.onHidden.removeAll();
        this.signals.onCrossed.removeAll();
        this.signals.onUncrossed.removeAll();
        this.signals.onSelected.removeAll();
        this.signals.onUnselected.removeAll();
        this.signals.onRequired.removeAll();
        this.signals.onNotRequired.removeAll();

        if (clearEA) {
            this.signals.onEventChanged.removeAll();
            this.signals.onEventCleared.removeAll();
            this.signals.onEventFilled.removeAll();
            this.signals.onEventFormOpened.removeAll();
            this.signals.onEventUnselected.removeAll();
            this.signals.onEventSelected.removeAll();
        }

        if (setChange) this.setChangeListeners();
    }

}
