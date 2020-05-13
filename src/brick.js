import registry    from "./brick-registry";
import Twig        from "twig";
import BrickFinder from "./brick-finder";
import AppEvent    from "./app-event";
import decopt      from "./decopt";

/**
 * @property {HTMLElement} root;
 * @property {DOMStringMap} dataset;
 * @method register
 */
@decopt('register', function (t, f, tag, twig = null) {
	if (f !== false) {
		if (typeof t.tag === "undefined") t.tag = "";
		t.tag = t.tag + tag;
		t.tag = tag;
		t.twig = twig;
		registry.register(t);
	}
})
@decopt('addClass', (t, f, classes = []) => t.options.rootCssClasses = typeof classes === 'string' ? [classes] : classes)
@decopt('renderOnConstruct', true)
@decopt('cleanOnConstruct', true)
@decopt('registerSubBricksOnRender', true)
@decopt(['observedAttributes', 'observeAttributes'], false)
@decopt(['listeners', 'listen'], (t, f, eventNames) => {
	if (!Array.isArray(t.options.listeners)) t.options.listeners = [];
	if (f !== false) {
		if (!Array.isArray(t.options.listeners)) t.options.listeners = [];
		eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
		for (const eventName of eventNames) t.options.listeners.push({eventName, handlerName:f});
	}
})
export default class Brick {
	/**
	 * @returns {string}
	 */
	static get selector() {return `[is="${this.tag}"]`;}
	/**
	 * @param {string} tag
	 * @param {boolean} render
	 * @returns {Promise<typeof Brick>}
	 */
	static create(htmlTag = 'div', render = true) {
		let brick = new (this)(this.createBrickElement(htmlTag), false);
		if (render) return brick.render();
		else return Promise.resolve(brick);
	}
	/**
	 * @param {string} htmlTag
	 * @returns {HTMLElement}
	 */
	static createBrickElement(htmlTag = 'div') {
		let element = document.createElement(htmlTag);
		element.setAttribute('is', this.tag);
		return element;
	}

	/* --- CONSTRUCTOR ----*/
	/**
	 * @param {HTMLElement} root
	 * @param {boolean} renderOnConstruct
	 */
	constructor(root, renderOnConstruct = true) {
		this.root = this.eventSource = root;
		this.root.controller = this;
		this.dataset = this.root.dataset;
		this.constructor.options.rootCssClasses.forEach((cssclass) => {this.root.classList.add(cssclass);});


		for (let event of this.constructor.options.listeners) {
			const {eventName, handlerName} = event;
			const handler = this[handlerName];
			this.listen(eventName, (eventData) => handler.call(this, eventData));
		}


		if (this.constructor.options.observedAttributes !== false) {
			let attr_mut_opts = {
				attributes: true,
				childList: false,
				subtree: false,
				attributeOldValue: true,
				attributeFilter: undefined
			};

			if (Array.isArray(this.constructor.options.observedAttributes))  attr_mut_opts.attributeFilter = this.constructor.options.observedAttributes;

			(new MutationObserver((mutationsList) => {
				mutationsList.forEach(mutation => {
					if (mutation.type === 'attributes') this.onAttributeChange(
						mutation.attributeName,
						this.root.getAttribute(mutation.attributeName),
						mutation.oldValue
					);
				});
			})).observe(this.root, attr_mut_opts);
		}
		

		this.root.setAttribute('brick-initialized', 'yes');
		this.onInitialize();
		if (this.constructor.options.cleanOnConstruct === true) this.clearContent();
		if (this.constructor.options.renderOnConstruct === true && this.constructor.twig && renderOnConstruct) this.render().then(() => {});
	}
	/**
	 */
	onInitialize() {
	}
	/**
	 * @param {string} attr
	 * @param {string} value
	 * @param {string} oldValue
	 */
	onAttributeChange(attr, value, oldValue) {
		console.warn(`You should implement your onAttributeChange method in "${this.constructor.tag}" brick! \n attribute "${attr}" changed: ${oldValue} -> ${value}`);
	};
	/* --- RENDER ----*/
	/**
	 * @param {Object} args
	 * @returns {Promise<typeof Brick>}
	 */
	render(args = undefined) {
		return Promise.resolve(this.beforeRender(args))
			.then(() => Promise.resolve(this.createViewModel()))
			.then(viewModel => this.renderTemplate(viewModel))
			.then(() => this.onRender())
			.then(() => this);
	}
	/**
	 * @param {*} args
	 * @returns {*}
	 */
	beforeRender(args) {return args;}
	/**
	 * @returns {Object}
	 */
	createViewModel() { return {}; }
	/**
	 */
	onRender() {}
	/**
	 * @param {Object} viewModel
	 * @returns {Promise}
	 */
	renderTemplate(viewModel) {
		let root = this.root;
		let twig = this.constructor.twig;
		let template = document.createElement('template');
		let content = '';
		if (typeof twig === 'function') content = twig(viewModel);
		if (typeof twig === 'string') content = Twig.twig({data: twig}).render(viewModel, {}, false);
		template.innerHTML = content;
		this.clearContent()
		root.appendChild(template.content.cloneNode(true));
		if (this.constructor.options.registerSubBricksOnRender) return registry.initializeElements(this.root);
		return Promise.resolve();
	}
	/**
	 * @param {string|null} selector
	 * @param {Function} func
	 * @returns {BrickFinder}
	 */
	$(selector = null, func = null) { return new BrickFinder(selector, this.root, this, func); }
	/**
	 * @param {string} role
	 * @param {Function} func
	 * @returns {BrickFinder}
	 */
	$$(role, func = null) { return new BrickFinder('[\\(' + role + '\\)], [actor\\:'+role+']', this.root, this, func);}
	actor(role){
		this.root.setAttribute('actor:'+role, "")
	}
	/**
	 * @param {string | Array<string>} event
	 * @param {Function} handler
	 */
	listen(event, handler) { AppEvent.listen(event, handler, this.root); }
	/**
	 * @param {string} event
	 * @param {*} data
	 * @param {{bubbles:boolean, cancelable: boolean}} options
	 */
	fire(event, data = null, options = {
		bubbles: true,
		cancelable: true
	}) {
		AppEvent.fire(event, data, options, this.eventSource);
	}
	clearContent(node = this.root) {
		while (node.firstChild) this.root.removeChild(node.firstChild);
	}
	requestAnimationFrame() { return new Promise(resolve => window.requestAnimationFrame(resolve));}
	wait(ms) { return new Promise(resolve => setTimeout(() => resolve(ms), ms)); }
}