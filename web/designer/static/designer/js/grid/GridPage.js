import { Div } from '/static/js/ui/BuildingBlocks.js';
import { GRID_CLASS } from './constants.js';
import { GRID_PRIMARY_COLOR, GRID_SECONDARY_COLOR } from './constants.js';


const GRID_SIZE = 50;

/**
 * Grid page.
 * Each page has one GridPage.
 */
export class GridPage extends Div{
    /**
     * Constructor.
     * @param {Page} page Page to attach the grid. Use this reference to also attach it.
     */
    constructor(page) {
        super();
        this.addClass(GRID_CLASS);
        this.attachTo(page);
        this.setStyle('width', $(page.dom).width());
        this.setStyle('height', $(page.dom).height());

        $(this.dom).hide();        
        $(this.dom).gridBuilder({
            color: GRID_PRIMARY_COLOR,
            secondaryColor: GRID_SECONDARY_COLOR,
            vertical: GRID_SIZE,
            horizontal: GRID_SIZE,
            gutter: 0,
        });

    }
}

