export default class RJson {

	constructor(schema, data) {
		this.entities = {};
		this.search = {};
		this.get = {};
		this.storage = {};
		this.array = {};
		this.readSchema(schema);
		this.loadSchemaData(data);
	}

	static schema() {return new Schema();}

	load(definition, records){
		if(records === undefined) return;
		let Entity = this.entities[definition];
		if (typeof records !== 'object') throw new Error('type error');
		if (records instanceof Array) {
			let recordsObject = {};
			for (let i in records) {
				let key = Entity.idField ? records[i][Entity.definition.idField] : i;
				recordsObject[key] = records[i];
			}
			records = recordsObject;
		}

		let storage = {};
		let array = [];

		for (let id in records) if (records.hasOwnProperty(id)) {
			id = parseInt(id);
			let record = records[id];
			Entity.definition.converter(record);
			let item = new Entity(record, id, this);
			storage[id] = item;
			array.push(item);
		}

		this.storage[Entity.definition.name] = storage;
		this.array[Entity.definition.name] = array;
	}

	loadSchemaData(data) {
		for (let _ in this.entities) {
			let Entity = this.entities[_];
			let records = data[Entity.definition.dataKey];
			this.load(_, records);
		}
	}

	readSchema(schema) {
		for (let _ in schema.definitions) if (schema.definitions.hasOwnProperty(_)) {
			let definition = schema.definitions[_];
			for (let _ in definition.relations) if (definition.relations.hasOwnProperty(_)) {
				let relation = definition.relations[_];
				if (relation.reverse) {
					schema.definitions[relation.definition].hasMany(relation.reverse, definition.name, relation.field);
				}
			}
			if (definition.mapId === true) definition.mapId = 'id';
			if (typeof definition.mapId === 'string') {
				definition.getter(definition.mapId, entity => entity._id);
			}
		}

		for (let _ in schema.definitions) if (schema.definitions.hasOwnProperty(_)) {
			let definition = schema.definitions[_];
			this.search[definition.name] = (searchfunc) => this.array[definition.name].filter(searchfunc);
			this.get[definition.name] = (id) => this.storage[definition.name][id];

			let Entity = function (data, id, rjson) {
				this._data = data;
				this._id = id;
				this._rjson = rjson;
			};

			Entity.definition = definition;

			Entity.prototype = {};
			Entity.prototype.stringifyer = definition.stringifyer;
			Entity.prototype.toString = function () { return this.stringifyer(this);};

			for (let _ in definition.fields) if (definition.fields.hasOwnProperty(_)) {
				let field = definition.fields[_];
				let attributes = {get: function () {return this._data[field.name];}};
				if (!field.readonly) attributes.set = function (value) {this._data[field.name] = value; };
				Object.defineProperty(Entity.prototype, field.name, attributes);
			}

			for (let _ in definition.relations) if (definition.relations.hasOwnProperty(_)) {
				let relation = definition.relations[_];
				Object.defineProperty(Entity.prototype, relation.name, {
					get: function () {
						return this._rjson.get[relation.definition](this._data[relation.field]);
					}
				});
			}

			for (let _ in definition.revRelations) if (definition.revRelations.hasOwnProperty(_)) {
				let relation = definition.revRelations[_];
				Object.defineProperty(Entity.prototype, relation.name, {
					get: function () {
						return this._rjson.array[relation.definition].filter((item) => {
							return parseInt(item[relation.field]) === this._id
						});
					}
				});
			}

			for (let _ in definition.getters) if (definition.getters.hasOwnProperty(_)) {
				let getter = definition.getters[_];
				Object.defineProperty(Entity.prototype, getter.name, {
					get: function () {
						return getter.func(this, this._rjson)
					}
				});
			}

			this.entities[definition.name] = Entity;
		}
	}
}

class Schema {

	constructor() {
		this.definitions = {};
	}

	define(name, dataKey = null, idField = null, mapId = true) {
		let definition = new Definition(name, dataKey, idField, mapId);
		this.definitions[name] = definition;
		return definition;
	}
}

class Definition {

	constructor(name, dataKey, idField, mapId) {
		this.idField = idField;
		this.mapId = mapId;
		this.dataKey = dataKey === null ? name : dataKey;
		this.name = name;
		this.fields = {};
		this.relations = {};
		this.revRelations = {};
		this.getters = {};
		this.converter = item => {};
		this.stringifyer = item => item.id;
	}

	convert(func) {
		this.converter = func;
		return this;
	}

	stringify(func) {
		this.stringifyer = func;
		return this;
	}

	field(name, readonly = true) {
		if (typeof name === 'string') name = [name];
		for (let i in name) {
			this.fields[name[i]] = {name: name[i], readonly};
		}
		return this;
	}

	relation(name, definition, field = null, reverse = null) {
		if (field === null) field = name + "Id";
		this.relations[name] = {name, definition, field, reverse};
		return this;
	}

	belongsTo(name, definition, field = null) {
		this.relation(name, definition, field, null);
		return this;
	}

	hasMany(name, definition, field) {
		this.revRelations[name] = {name, definition, field};
		return this;
	}

	getter(name, func) {
		this.getters[name] = {name, func};
		return this;
	}
}