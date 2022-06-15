
/**
 * Global object.
 */
export function Context() { 
    var Signal = signals.Signal;
    this.signals = {
        onStuffDone: new Signal(),
        onError: new Signal(),
        onAYS: new Signal(),

        onClose: new Signal(),
        onOpen: new Signal(),
        onDatabase: new Signal(),
        onJson: new Signal(),
        onZip: new Signal(),
        onValidate: new Signal(),
        onCompleted: new Signal(),
        onRemove: new Signal(),
        onEdit: new Signal(),

        onAnnexModal: new Signal(),
        onAnnexUploaded: new Signal(),
        onAnnexRemoved: new Signal(),        
        
    }
}
