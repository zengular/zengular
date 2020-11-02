import registry    from "./brick-registry";
import Twig        from "twig";
import BrickFinder from "./brick-finder";
import AppEvent    from "./app-event";
import decopt      from "./decopt";


/**
 * @property {HTMLElement} root;
 * @property {DOMStringMap} dataset;
 * @method register
 * @method attr
 * @property {string} tag
 */
@decopt('register', function (target, fn, tag, twig = null) {
	if (typeof target.tag === "undefined") target.tag = "";
	target.tag = target.tag + tag;
	target.tag = tag;
	target.twig = twig;
	registry.register(target);
}, false)
@decopt('addClass', (t, f, ...classes) => t.options.rootCssClasses = classes)
@decopt('renderOnConstruct', true)
@decopt('cleanOnConstruct', true)
@decopt('initializeSubBricks', true)
@decopt('listen:listeners',
	(target, fn, ...events) => events.forEach(eventName => target.options.listeners.push({eventName, handlerName: fn})),
	(target) => target.options.listeners = []
)
@decopt('attr',
	(target, fn, ...attributes) => attributes.forEach(attribute => target.options.observedAttributes.push({
		attribute,
		handlerName: fn
	})),
	(target) => target.options.observedAttributes = []
)

export default class Brick {

	static register(tag, twig = null) {}
	static addClass(classes) {}
	static renderOnConstruct(render) {}
	static cleanOnConstruct(clean) {}
	static initializeSubBricks(init) {}
	static listen(events) {}
	static attr(attributes) {}

	/** @returns {string}*/
	static get selector() {return `[is="${this.tag}"]`;}
	/**
	 * @param {string} tag
	 * @param {boolean} render
	 * @param {Object} dataset
	 * @returns {Promise<typeof Brick>}
	 */
	static create(htmlTag = 'div', render = true, dataset = {}, content = '') {
		let brick = new (this)(this.createBrickElement(htmlTag, dataset), false);
		if (render) return brick.render();
		else return Promise.resolve(brick);
	}
	/**
	 * @param {string} htmlTag
	 * @param {Object} dataset
	 * @returns {HTMLElement}
	 */
	static createBrickElement(htmlTag = 'div', dataset = {}, content = '') {
		let element = document.createElement(htmlTag);
		element.setAttribute('is', this.tag);
		for (let property in dataset) {
			element.dataset[property] = dataset[property]
		}
		element.innerHTML = content;
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
			this.listen(eventName, this[handlerName].bind(this));
		}


		if (this.constructor.options.observedAttributes.length > 0) {
			(new MutationObserver((mutationsList) => {
				mutationsList.forEach(mutation => {
					if (mutation.type === 'attributes') {
						let fn = this.constructor.options.observedAttributes.find(item => item.attribute === mutation.attributeName).handlerName;
						if (typeof this[fn] === "function") {
							this[fn](
								mutation.attributeName,
								this.root.getAttribute(mutation.attributeName),
								mutation.oldValue
							);
						}
					}
				});
			})).observe(
				this.root,
				{
					attributes: true,
					childList: false,
					subtree: false,
					attributeOldValue: true,
					attributeFilter: this.constructor.options.observedAttributes.map((item) => item.attribute)
				}
			);
		}


		this.initialization = this.initialize();

		if (this.constructor.options.cleanOnConstruct === true) this.clearContent();
		if (this.constructor.options.renderOnConstruct === true && this.constructor.twig && renderOnConstruct) this.render();
	}

	initialize() {
		this.root.setAttribute('brick-initialized', 'yes');
		return Promise.resolve(this.onInitialize());
	}

	/**
	 */
	onInitialize() {
	}

	/* --- RENDER ----*/
	/**
	 * @param {Object} args
	 * @returns {Promise<typeof Brick>}
	 */
	render(args = undefined) {
		return this.initialization.then(this.beforeRender(args))
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
		if (this.constructor.options.initializeSubBricks) return registry.initializeElements(this.root);
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
	$$(role, func = null) { return new BrickFinder('[\\(' + role + '\\)], [actor\\:' + role + ']', this.root, this, func);}
	actor(role) {
		this.root.setAttribute('actor:' + role, "")
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
	}) { AppEvent.fire(event, data, options, this.eventSource);}

	message(event, data, targets) {
		if (targets instanceof BrickFinder) targets = targets.nodes;
		if (!Array.isArray(targets)) targets = [targets];
		targets.forEach(target => AppEvent.fire(event, data, {bubbles: false, cancelable: true}, target))
	}

	clearContent(node = this.root) { while (node.firstChild) this.root.removeChild(node.firstChild);}
	requestAnimationFrame() { return new Promise(resolve => window.requestAnimationFrame(resolve));}
	wait(ms) { return new Promise(resolve => setTimeout(() => resolve(ms), ms)); }
}