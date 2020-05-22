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
		if (this.selector === null) return this.queryRoot;
		let elements = this.queryRoot.querySelectorAll(this.selector);
		for (let i in elements) {
			if (elements[i]?.parentElement?.closest('[is]').controller === this.controller) return elements[i];
		}
		return null;
	}
	/**
	 * @returns {Brick | null}
	 */
	get brick() {
		let element = this.node;
		return (element && element.hasOwnProperty('controller')) ? element.controller : null;
	}

	/**
	 * @param {Function} func
	 * @returns {Element | null}
	 */
	first(func) {
		let node = this.node;
		if (node) func(node);
		return node;
	}

	/**
	 * @returns {Element[]}
	 */
	get nodes() {
		if (this.selector === null) return [this.queryRoot];
		let elements = this.queryRoot.querySelectorAll(this.selector);
		return Array.prototype.filter.call(elements, element => element.parentNode.closest('[is]').controller === this.controller);
	}
	/**
	 * @param {Function} func
	 * @returns {Element[]}
	 */
	each(func) {
		let nodes = this.nodes;
		nodes.forEach(node => func(node));
		return nodes;
	}
	/**
	 * @param {string | Array<string>} events
	 * @param {Function} handler
	 * @param {number} debounce
	 * @returns {BrickFinder}
	 */
	listen(events, handler, debounce = 0) {
		if (typeof events === 'string') events = [events];
		this.each((element) => {
			events.forEach(eventType => {
				if (debounce !== 0 && typeof debounce === 'number') {
					let debouncer = new Debouncer(handler, debounce);
					handler = (event, target) => debouncer.trigger(event, target);
				}
				element.addEventListener(eventType, event => handler(event, element));
			});
		});
		return this;
	}

	click(handler, debounce = 0) {return this.listen('click', handler, debounce);}
	contextMenu(handler, debounce = 0) {return this.listen('contextmenu', handler, debounce);}

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
	filter(filter, func = null) {
		let bases = this.selector.split(',');
		let filters = filter.split(',');
		let selector = [];
		for (let i in bases) for (let j in filters) selector.push(bases[i] + filters[j]);
		selector = selector.join(',');
		return new BrickFinder(selector, this.queryRoot, this.controller, func);
	}

}

class Debouncer {

	constructor(callback, wait) {
		this.callback = callback;
		this.wait = wait;
	}

	trigger(event, target) {
		if (this.timeout) clearTimeout(this.timeout)
		this.timeout = setTimeout(() => this.callback(event, target), this.wait);
	}

}