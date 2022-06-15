
import { Properties } from './properties.js';

export function Context() {

    // ---------------
    // --- SIGNALS ---
    // ---------------
    // Use signals to communicate and pass values.
    // For now, all signals are defined here.
    var Signal = signals.Signal;
    this.signals = {
        // dispatches originated from everywhere
        onStuffDone: new Signal(),              // basically only for tracking the execution flow
        onError: new Signal(),
        onAYS: new Signal(),                    // are you sure signal
        onChange: new Signal(),                 // on any change: new stuff, movement, scale, ...
        onSaved: new Signal(),                   // the form was saved

        
        onRequireDBFieldSelection: new Signal(),    // show db field selection modal
        onDBFieldSelected: new Signal(),            // a db field was selected

        //
        onPageAdded: new Signal(),
        onPageRemoved: new Signal(),
        onPagesChanged: new Signal(),           // add/remove, scroll, moves, ...
        onPagesScrolled: new Signal(),
        onElementMoved: new Signal(),
        onElementResized: new Signal(),
        onElementRemoved: new Signal(),
        onElementCreated: new Signal(),        
        removeThisElement: new Signal(),        // element -> manager    
        onPropertyChanged: new Signal(),        // any change in any property field
        onPropertyBtnClicked: new Signal(),     // some textbutton in the properties was clicked
        onElementRenamed: new Signal(),         // element renamed through the prop. tab
        onElementSectionChanged: new Signal(),  // on changing the section of an element in the prop. tab
        onElementGroupChanged: new Signal(),    // on changing the group of an element in the prop. tab
        onElementLabelChanged: new Signal(),         // element label changed through the prop. tab
        onElementMoveStoped: new Signal(),
        onElementResizeStoped: new Signal(),
        onMultiMoveStoped: new Signal(),
        onRepeatableCreated: new Signal(),      // element is not repeatable
        onRepeatableRemoved: new Signal(),      // element is no longer repeatable
        onPagesSwapped: new Signal(),

        //
        onElementSelected: new Signal(),
        onLockElement: new Signal(),
        onUnlockElement: new Signal(),

        onElementShiftSelected: new Signal(),
        onElementShiftUnSelected: new Signal(),
        

        //
        onMouseGridChanged: new Signal(),
        onCursorGridChanged: new Signal(),

        // dispatches originated from list view
        onSectionCreated: new Signal(),
        onSectionNameChanged: new Signal(),     // listview
        onSectionRemoved: new Signal(),         // listview, SectionManager
        onSectionItemMoved: new Signal(),       // item moved from section
        //onSectionItemRemoved: new Signal(),     // element -> item eliminated

        // dispatches originated from groups view
        onGroupCreated: new Signal(),
        onGroupRemoved: new Signal(),
        onElementAdded2Group: new Signal(),
        onElementRemovedFromGroup: new Signal(),
        onGroupRenamed: new Signal(),
        onGroupTypeChanged: new Signal(),
        onCheckRadioChanged: new Signal(),

        // from ea view
        onEACreated: new Signal(),
        onEARemoved: new Signal(),
        onAnyElementChanged: new Signal(),
        onEACloned: new Signal(),
        onEAStatusChanged: new Signal(),     // dispatched by any input change
        
        // dispatches originated from main
        onMainTabChanged: new Signal(),
        onLoadStarted: new Signal(),
        onLoadEnded: new Signal(),
        onElementsLoadEnded: new Signal(),

        //
        onTableRemoved: new Signal(),
        onTableAdded: new Signal(),

        // progress
        onProgress: new Signal(),

        // for better performance, namely when droping db radio/check elements
        onLockEAList: new Signal(),
        onUnlockEAList: new Signal(),
        onLockGroupsList: new Signal(),
        onUnlockGroupsList: new Signal(),

    }

    this.zoom = 1.0;

    // CURRENT FORM PROPERTIES
    this.properties = new Properties();

    // all changes are up to date?
    this.isSaved = true;

    // flag to indicate whather or not a form is loading
    // used this when onLoadStarted/onLoadEnded signals are not practical
    this.isLoading = false;

    // grid cell size
    this.grid = 10;
    this.grid_cursor = 5;

    
    // references for global access
    this.elements_manager = null;
    this.sections_manager = null;
    this.repeatables_manager = null;
    this.groups_manager = null;
    this.pages_manager = null;
    //this.table_element_menu = null;

    // save scroll positions for focus reasons (check baseelement.js and pagesscroller.js)
    this.scroll_top = 0;
    this.scroll_left = 0;

    // ready
    this.signals.onStuffDone.add((msg) => console.log("Log message > ", msg));

}


Context.prototype = {
    isEmpty: function() {
        return (
            this.properties.n_elements == 0 && 
            this.properties.n_groups == 0 && 
            this.properties.n_sections == 1 &&  // default section
            this.properties.n_eas == 0
        );
    }
}