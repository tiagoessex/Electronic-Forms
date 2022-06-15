
/**
 * Global object.
 */
export function Context() { 
    var Signal = signals.Signal;
    this.signals = {
        onStuffDone: new Signal(),
        onError: new Signal(),
        onAYS: new Signal(),

        onUsed: new Signal(),
        onDisabled: new Signal(), 
        onRemoved: new Signal(), 
        onEditForm: new Signal(), 
        onClone: new Signal(), 
        onPreview: new Signal(), 
        onChanged: new Signal(), 
        onPrint: new Signal(),
        onPdf: new Signal(),
    }

    this.isExport = false;  // TODO: REMOVE THIS
}
