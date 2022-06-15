import { 
        MAIN_SECTION,
        NEW_OPERATION_BTN,
        RESUME_BTN,
        MANAGER_BTN,
        SYNC_BTN,
} from "../ids.js";
import { TITLE_MAIN } from "../constants.js";
import { Title } from '../Title.js';

export function Main(context) {
    this.context = context;
    this.title = new Title(TITLE_MAIN)
    const ref = this;

    $(NEW_OPERATION_BTN).on('click', function(e) {
        $(MAIN_SECTION).collapse('hide');
        ref.title.hide();        
        context.signals.onFormSelection.dispatch();
    });
    $(RESUME_BTN).on('click', function(e) {
        $(MAIN_SECTION).collapse('hide');
        ref.title.hide();        
        context.signals.onResumeOperationSelection.dispatch();
    });  
    $(MANAGER_BTN).on('click', function(e) {
        $(MAIN_SECTION).collapse('hide');
        ref.title.hide();        
        context.signals.onManager.dispatch();
    });  
    
    $(SYNC_BTN).on('click', function(e) {
        context.signals.onSync.dispatch();
    });  
    
}

Main.prototype = {
    show: function () {
        this.title.show();
        $(MAIN_SECTION).collapse('show');

        this.context.clear();
    },
}
