import Repository from "./repository";

/**
 * @property {Repository} _repository
 * @property {Model} _
 */
export default class Model {

	/**
	 * @returns {string}
	 */
	static get idField(){return 'id';}
	/**
	 * @returns {typeof Repository}
	 * @constructor
	 */
	static get Repository(){return Repository;}

	/**
	 * @param {Object} data
	 * @param {Repository} repository
	 */
	constructor(data, repository) {
		this._repository = repository;
		this._cache = {};
		this._ = new Proxy(this, {
			has: (target, key) => {
				return key in this.constructor.viewHelpers || key in target;
			},
			get: (target, name, receiver) => {
				if (typeof target.constructor.viewHelpers[name] === 'undefined') return target[name];
				return target.constructor.viewHelpers[name].apply(target);
			}
		});

		for (let prop in data) {
			if (data.hasOwnProperty(prop)) {
				this[prop.replace(/-/g, '_')] = data[prop];
			}
		}
	}

	/**
	 *
	 * @param {string} name
	 * @param {Function} calculator
	 * @returns {*}
	 */
	cachedGet(name, calculator) { return (typeof this._cache[name] === 'undefined') ? (this._cache[name] = calculator()) : this._cache[name];}
	static get viewHelpers() {return (typeof this._viewHelpers === 'undefined') ? (this._viewHelpers = {}) : this._viewHelpers;}
	static clearViewHelpers() {for (let i in this.viewHelpers) if (this.viewHelpers.hasOwnProperty(i)) delete this.viewHelpers[i];}
	remove(){this._repository.remove(this[this.constructor.idField]);}

	/**
	 * @returns {Repository}
	 */
	static createRepository(){return new (this.Repository)(this);}

	/**
	 * @returns {Repository}
	 */
	static get repository(){
		if(typeof this._repository === "undefined") this._repository = this.createRepository();
		return this._repository;
	}

}

