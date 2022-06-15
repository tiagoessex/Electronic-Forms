//  ##########################################################
//  #                                                        #
//  #   UTILITIES ONLY FOR HTML RELATED CONTENT/OPERATIONS   #
//  #                                                        #
//  ##########################################################


/**
 * Check if an object is a node.
 * @param {object} o Object to test
 * @returns True if yes, else false.
 */
export function isNode(o){
    return (
      typeof Node === "object" ? o instanceof Node : 
      o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
  }
  
 
/**
 * Check if an object is an HTMLElement.
 * @param {object} o Object to test
 * @returns True if it is an HTMLElement.
 */
export function isElement(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
}



/**
 * Swap 2 nodes.
 * Example:
 *  var qwe = document.getElementsByClassName('someclass');
 *  swapNodes(qwe[0], qwe[2]);
 * @param {node} n1 
 * @param {node} n2 
 * @returns 
 */
 export function swapNodes(n1, n2) {

    var p1 = n1.parentNode;
    var p2 = n2.parentNode;
    var i1, i2;

    if ( !p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1) ) return;

    for (var i = 0; i < p1.children.length; i++) {
        if (p1.children[i].isEqualNode(n1)) {
            i1 = i;
        }
    }
    for (var i = 0; i < p2.children.length; i++) {
        if (p2.children[i].isEqualNode(n2)) {
            i2 = i;
        }
    }

    if ( p1.isEqualNode(p2) && i1 < i2 ) {
        i2++;
    }
    p1.insertBefore(n2, p1.children[i1]);
    p2.insertBefore(n1, p2.children[i2]);
}



/**
 * Check if a part of an HTMLElement is visible.
 * @param {HTMLElement} el Element.
 * @param {number} height_minus For instances where the top area of the viewport should not be considered. 
 *                              For example, if there is a top menu.
 * @returns True if any part of el is visible.
 */
export function isElementPartiallyInViewport(el, height_minus = 0)
{
    // Special bonus for those using jQuery
    if (typeof jQuery !== 'undefined' && el instanceof jQuery) 
        el = el[0];

    var rect = el.getBoundingClientRect();
    // DOMRect { x: 8, y: 8, width: 100, height: 100, top: 8, right: 108, bottom: 108, left: 8 }
    var windowHeight = (window.innerHeight || document.documentElement.clientHeight) - height_minus;
    var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

    // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
    var vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    var horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return (vertInView && horInView);
}

/**
 * Check if an element is visible.
 * From:
 *      http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
 * @param {HTMLElement} el 
 * @returns True if any corner of the element is visible
 */
export function isElementInViewport (el)
{
    // Special bonus for those using jQuery
    if (typeof jQuery !== 'undefined' && el instanceof jQuery) 
        el = el[0];

    var rect = el.getBoundingClientRect();
    var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

    return (
           (rect.left >= 0)
        && (rect.top >= 0)
        && ((rect.left + rect.width) <= windowWidth)
        && ((rect.top + rect.height) <= windowHeight)
    );
}


/**
 * Removes all children nodes from a parent.
 * @param {node} parent Parent node.
 */
export function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}



/**
 * Pure js to hide bootstrap modals
 * @param {*} id 
 */
export function hideModal(id) {
    const modal = document.getElementById(id);
    const modalsBackdrops = document.querySelector('.modal-backdrop');
    modal.setAttribute('aria-hidden','true');
    modal.style.display = 'none';
    modal.classList.remove('show')
    document.body.removeChild(modalsBackdrops);
}



/**
 * Swaps className1 with className2.
 * 
 * @param {*} element 
 * @param {*} className1 
 * @param {*} className2 
 */
export function toggleClass(element, className1, className2) {
    element.classList.toggle(className1);
    element.classList.toggle(className2);
}

/**
 * Loads an image asynchronously.
 * Ex:
 *      loadImage("example.com/house.jpg")
 *      .then(img => console.log(`w: ${img.width} | h: ${img.height}`))
 *      .catch(err => console.error(err));
 * 
 * @param {string} url Image url.
 * @returns Promise.
 */
export const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (err) => reject(err));
        img.src = url
      })
};

export const loadImage2Dom = (dom, url) => {
    return new Promise((resolve, reject) => {
        dom.addEventListener('load', () => resolve(dom));
        dom.addEventListener('error', (err) => reject(err));
        dom.src = url
      })
};