
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
            // errors
            onError: new this.Signal(),
            // dialogs
            onAYS: new this.Signal(),

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
            //onTransfer: new this.Signal(),
            // operations
            onBarcodeReader: new this.Signal(),
            //onTransferModal: new this.Signal(),
            onPrint: new this.Signal(),
            onPdf: new this.Signal(),
            onValidation: new this.Signal(),

            // to flag something changed after save
            onChange: new this.Signal(),
        }

        this.signals.onStuffDone.add((msg) => console.log("Log message > ", msg)); 
        
        // is currently printing or exporting to pdf
        this.isExport = false;

        // indicates any change
        this.changed = false; 

        this.form_id = null;
        this.form_operation_id = null;

        this.setChangeListeners();     
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
    }  

}
