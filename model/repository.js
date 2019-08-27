import Model from "./model";

/**
 * @property {Object} data
 * @property {Array<Model>} indexed
 * @property {string} idField
 * @property {typeof Model} model
 * @property {number} autoincrementId
 */
export default class Repository {

	/**
	 * @param {typeof Model} model
	 */
	constructor(model) {
		this.indexed = [];
		this.storage = {};
		this.model = model;
		this.autoincrementId = 1;
	}

	/**
	 * @param {Function} callback
	 */
	each(callback) { this.indexed.forEach((item, index) => callback(item, index)); }

	/**
	 * @param {Object} data
	 * @returns {Model}
	 */
	store(data) {
		let item = new (this.model)(data);
		if (typeof item[this.model.idField] === "undefined") {
			item[this.model.idField] = (this.autoincrementId++).toString();
		}
		this.storage[item[this.model.idField]] = item;
		this.indexed.push(item);
		return item;
	}

	/**
	 * @param {Array<Object>} data
	 * @returns {Repository}
	 */
	storeBulk(data) {
		data.forEach(item => this.store(item));
		return this;
	}

	/**
	 * @param {string} id
	 * @returns {Model|undefined}
	 */
	get(id) {return this.storage[id];}

	/**
	 * @param {Array<string>} ids
	 * @returns {Array<Model>}
	 */
	all(ids){
		let items = [];
		ids.forEach(id => items.push(this.storage[id]));
		return items;
	}

	/**
	 * @param {string} id
	 */
	remove(id) {
		let item = this.get(id);
		let index = this.indexed.indexOf(item);
		this.indexed.splice(index, 1);
		delete this.storage[id];
	}

	/**
	 * @returns {Repository}
	 */
	clear() {
		this.indexed.length = 0;
		for (let i in this.storage) if (this.storage.hasOwnProperty(i)) delete this.storage[i];
		this.autoincrementId = 1;
		return this;
	}

}