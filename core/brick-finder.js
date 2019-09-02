import Brick from "./brick";

/**
 * @property {string} selector
 * @property {Brick} controller
 * @property {HTMLElement} queryRoot
 */
export default class BrickFinder {

    /**
     * @param {string} selector
     * @param {HTMLElement} scope
     * @param {Brick} controller
     * @param {Function} func
     */
    constructor(selector, scope, controller, func = null) {
        this.selector = selector;
        this.controller = controller;
        this.queryRoot = scope;
        if (func) this.each(func);
    }

    /**
     * @returns {Element | null}
     */
    get node() {
        let element = this.queryRoot.querySelector(this.selector);
        return (element && element.parentElement.closest('[is]').controller !== this.controller) ? null : element;
    }

    get brick(){
        let element = this.node;
        return (element && element.hasOwnProperty('controller')) ? element.controller : null;
    }

    /**
     * @param {Function} func
     * @returns {Element | null}
     */
    first(func){
        let node = this.node;
        if (node) func(node);
        return node;
    }

    /**
     * @returns {Element[]}
     */
    get nodes() {
        let elements = this.queryRoot.querySelectorAll(this.selector);
        return Array.prototype.filter.call(elements, element => element.parentNode.closest('[is]').controller === this.controller);
    }
    /**
      * @param {Function} func
     * @returns {Element[]}
     */
    each(func){
        let nodes = this.nodes;
        nodes.forEach(node => func(node));
        return nodes;
    }
    /**
     * @param {string | Array<string>} events
     * @param {Function} handler
     * @returns {BrickFinder}
     */
    listen(events, handler) {
        if (typeof events === 'string') events = [events];
        this.each((element) => {
            events.forEach(eventType => {
                element.addEventListener(eventType, event => handler(event, element));
            });
        });
        return this;
    }

    /**
     * @param {HTMLElement} scope
     * @param {Function} func
     * @returns {BrickFinder}
     */
    scope(scope, func = null) {return new BrickFinder(this.selector, scope, this.controller, func);}
    /**
     * @param {string} filter
     * @param {Function} func
     * @returns {BrickFinder}
     */
    filter(filter, func = null) {return new BrickFinder(this.selector + filter, this.queryRoot, this.controller, func);}

}