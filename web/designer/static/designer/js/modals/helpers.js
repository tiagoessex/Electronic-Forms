
import { Div, TableTd, TableTh } from '/static/js/ui/BuildingBlocks.js';

// -------------------
// HELPER CONSTRUTORS
// -------------------


export const card = (parent, height) => {
    const _card = new Div().attachTo(parent);
    _card.addClass('card shadow p-3 mb-5 bg-white rounded');
    _card.setStyle('overflow','auto');
    _card.setStyle('height',height);
    return _card;
}

/**
 * 
 * @param {*} parent 
 * @param {*} text 
 * @param {string} classes Space separed classes ('class1 class2')
 */
export const th = (parent, text, classes=null) => {
    const _th = new TableTh().attachTo(parent);
    _th.setTextContent(text);
    if (classes) _th.addClass(classes);
}

export const cell = (parent, text, pop=0) => {
    const td = new TableTd().attachTo(parent);
    if (pop > 0 && text.constructor === Array) {
        for (let i=0; i<pop; i++)
            text.pop();
    }
    td.setTextContent(text);
}



