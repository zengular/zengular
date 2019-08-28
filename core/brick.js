import registry    from "./brick-registry";
import Twig        from "twig";
import BrickFinder from "./brick-finder";
import AppEvent    from "./app-event";


/**
 * @property {HTMLElement} root;
 * @property {DOMStringMap} dataset;
 */
export default class Brick {

	/**
	 * @param {string} tag
	 * @param {Function} twig
	 */
	static register(tag, twig = null) {
		return (target) => {
			target.tag = tag;
			target.twig = twig;
			this.setDefaultOptions(target);
			registry.register(target);
		};
	}

	/**
	 * @param {typeof Brick} target
	 * @param {string} option
	 * @param {*} value
	 */
	static setOption(target, option, value = null) {
		this.setDefaultOptions(target);
		target.options[option] = value;
	}

	/**
	 * @param {typeof Brick} target
	 */
	static setDefaultOptions(target) {
		if (typeof target.options === 'undefined') target.options = {
			renderOnConstruct: true,
			cleanOnConstruct: true,
			observeAttributes: false,
			observedAttributes: false,
			initializeSubBricksOnRender: false,
			rootCssClasses: []
		};
	}

	/**
	 * @param {boolean} value
	 * @returns {Function}
	 */
	static cleanOnConstruct(value = true) { return (target) => { this.setOption(target, 'cleanOnConstruct', value); }; }

	/**
	 * @param {boolean} value
	 * @returns {Function}
	 */
	static renderOnConstruct(value = true) { return (target) => { this.setOption(target, 'renderOnConstruct', value); }; }

	/**
	 * @param {boolean} value
	 * @returns {Function}
	 */
	static registerSubBricksOnRender(value = true) { return (target) => { this.setOption(target, 'registerSubBricksOnRender', value); }; }
	/**
	 * @param {string | Array<string>} value
	 * @returns {Function}
	 */
	static addClass(value) {return (target) => { this.setOption(target, 'rootCssClasses', typeof value === 'string' ? [value] : value);}; }
	/**
	 * @param {boolean} value
	 * @param {null | Array<string>} attributes
	 * @returns {Function}
	 */
	static observeAttributes(value, attributes = null) {
		return (target) => {
			this.setOption(target, 'observeAttributes', value);
			if (attributes) {
				this.setOption(target, 'observedAttributes', attributes);
			}
		};
	}

	/**
	 * @returns {string}
	 */
	static get selector() {return `[is="${this.tag}"]`;}


	/**
	 * @param {string} tag
	 * @param {boolean} render
	 * @returns {Promise<typeof Brick>}
	 */
	static create(tag = 'div', render = true) {
		let brick = new (this)(this.createBrickElement(tag), false);
		if(render) return brick.render();
		else return Promise.resolve(brick);
	}

	/**
	 * @param {string} tag
	 * @returns {HTMLElement}
	 */
	static createBrickElement(tag = 'div'){
		let element = document.createElement(tag);
		element.setAttribute('is', this.tag);
		return element;
	}

	/**
	 * @param {HTMLElement} root
	 * @param {boolean} renderOnConstruct
	 */
	constructor(root, renderOnConstruct = true) {
		this.root = root;
		this.root.controller = this;
		this.dataset = this.root.dataset;

		this.constructor.options.rootCssClasses.forEach((cssclass) => {this.root.classList.add(cssclass);});

		if (this.constructor.options.observeAttributes === true) {
			let attr_mut_opts = {
				attributes: true,
				childList: false,
				subtree: false,
				attributeOldValue: true,
				attributeFilter: undefined
			};
			if (this.constructor.options.observedAttributes) attr_mut_opts.attributeFilter = this.constructor.options.observedAttributes;

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

		if (this.constructor.options.cleanOnConstruct === true) while (this.root.firstChild) this.root.removeChild(this.root.firstChild);
		if (this.constructor.options.renderOnConstruct === true && this.constructor.twig && renderOnConstruct) this.render().then(() => {});
	}

	/**
	 * @param {string} attr
	 * @param {string} value
	 * @param {string} oldValue
	 */
	onAttributeChange(attr, value, oldValue) {
		console.warn(`You should implement your onAttributeChange method in "${this.constructor.tag}" brick! \n attribute "${attr}" changed: ${oldValue} -> ${value}`);
	};

	/**
	 * @param {Object} args
	 * @returns {Promise<typeof Brick>}
	 */
	render(args = {}) {
		return Promise.resolve(this.beforeRender(args))
		.then(() => Promise.resolve(this.createViewModel()))
		.then(viewModel => this.renderTemplate(viewModel))
		.then(() => this.onRender())
		.then(() => this);
	}

	/**
	 */
	onInitialize() {}

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
		while (root.firstChild) root.removeChild(root.firstChild);
		root.appendChild(template.content.cloneNode(true));
		if (this.constructor.options.registerSubBricksOnRender) return registry.initializeElements(this.root);
		return Promise.resolve();
	}

	/**
	 * @param {string} selector
	 * @param {Function} func
	 * @returns {BrickFinder}
	 */
	$(selector, func = null) { return new BrickFinder(selector, this.root, this, func); }

	/**
	 * @param {string} role
	 * @param {Function} func
	 * @returns {BrickFinder}
	 */
	$$(role, func = null) { return new BrickFinder('[\\(' + role + '\\)]', this.root, this, func);}

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
	}) { AppEvent.fire(event, data, options, this.root); }
}