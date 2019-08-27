/**
 * @property {XMLHttpRequest} xhr
 * @property {string} url
 * @property {*} payload
 * @property {string} method
 * @property {string|null} contentType
 */
export default class Ajax {

	static method = {
		get: 'GET',
		post: 'POST',
		put: 'PUT',
		patch: 'PATCH',
		delete: 'DELETE',
	};

	/**
	 * @param {string} url
	 * @param {string} method
	 * @param {Function} onProgress
	 * @returns {Ajax}
	 */
	static request(url, method, onProgress = null) { return new Ajax(url, method, onProgress); }

	/**
	 * @param {string} url
	 * @param {Function} onProgress
	 * @returns {Promise<XMLHttpRequest>}
	 */
	static get(url, onProgress = null) { return Ajax.request(url, Ajax.method.get, onProgress).promise(); }

	/**
	 * @param {string} url
	 * @param {*} data
	 * @param {Function} onProgress
	 * @returns {Promise<XMLHttpRequest>}
	 */
	static post(url, data = null, onProgress = null) { return Ajax.request(url, Ajax.method.post, onProgress).post(data).promise(); }

	/**
	 * @param {string} url
	 * @param {*} data
	 * @param {Function} onProgress
	 * @returns {Promise<XMLHttpRequest>}
	 */
	static json(url, data = null, onProgress = null) { return Ajax.request(url, Ajax.method.post, onProgress).json(data).promise(); }

	/**
	 * @param url
	 * @param onProgress
	 * @returns {Promise<XMLHttpRequest>}
	 */
	static delete(url, onProgress = null) { return Ajax.request(url, Ajax.method.delete, onProgress).promise(); }

	/**
	 * @param {string} url
	 * @param {string} method
	 * @param {Function} onProgress
	 */
	constructor(url, method, onProgress = null) {
		this.xhr = new XMLHttpRequest();
		if (onProgress) this.xhr.onprogress = (event) => onProgress(event);
		this.url = url;
		this.payload = null;
		this.method = method;
		this.contentType = null;
		return this;
	}

	/**
	 * @param {*} data
	 * @returns {Ajax}
	 */
	json(data) {
		this.payload = JSON.stringify(data);
		this.contentType = 'application/json';
		return this;
	}

	/**
	 * @param {*} data
	 * @returns {Ajax}
	 */
	post(data) {
		let formData = new FormData();
		for (let name in data) if (data.hasOwnProperty(name)) formData.append(name, data[name]);
		this.payload = formData;
		this.contentType = 'application/x-www-form-urlencoded';
		return this;
	}
	/**
	 * @param {*} data
	 * @param {files} data
	 * @returns {Ajax}
	 */
	upload(data, files) {
		this.post(data);
		if (!(files instanceof Array)) files = [files];
		files.forEach((file) => this.payload.append('file', file, file.name));
		return this;
	}

	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	promise() {
		return new Promise((resolve, reject) => {
			this.xhr.onreadystatechange = () => { if (this.xhr.readyState === 4) resolve(this.xhr);};
			this.xhr.onerror = (event) => { reject(event); };
			this.xhr.ontimeout = (event) => { reject(event); };
			this.xhr.open(this.method, this.url);
			if (this.contentType) { this.xhr.setRequestHeader('Content-type', this.contentType); }
			this.xhr.send(this.payload);
		});
	}
}
