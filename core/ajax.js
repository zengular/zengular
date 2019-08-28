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
	 * @returns {Ajax}
	 */
	static get(url, onProgress = null) { return Ajax.request(url, Ajax.method.get, onProgress); }

	/**
	 * @param {string} url
	 * @param {*} data
	 * @param {Function} onProgress
	 * @returns {Ajax}
	 */
	static post(url, data = null, onProgress = null) {
		let request = Ajax.request(url, Ajax.method.post, onProgress);
		let formData = new FormData();
		for (let name in data) if (data.hasOwnProperty(name)) formData.append(name, data[name]);
		request.payload = formData;
		return request;
	}

	/**
	 * @param {string} url
	 * @param {*} data
	 * @param {Function} onProgress
	 * @returns {Ajax}
	 */
	static upload(url, data = null, files=null, onProgress = null) {
		let request = this.post(url, data, onProgress);
		this.contentType = 'multipart/form-data';
		if (!(files instanceof Array)) files = [files];
		files.forEach((file) => this.payload.append('file', file, file.name));
		return request;
	}

	/**
	 * @param {string} url
	 * @param {*} data
	 * @param {Function} onProgress
	 * @returns {Ajax}
	 */
	static json(url, data = null, onProgress = null) {
		let request = Ajax.request(url, Ajax.method.post, onProgress);
		request.payload = JSON.stringify(data);
		request.contentType = 'application/json';
		return request;
	}

	/**
	 * @param url
	 * @param onProgress
	 * @returns {Ajax}
	 */
	static delete(url, onProgress = null) { return Ajax.request(url, Ajax.method.delete, onProgress); }

	/**
	 * @param {string} url
	 * @param {string} method
	 * @param {Function} onProgress
	 * @param {string} responseType
	 */
	constructor(url, method, onProgress = null, responseType = "") {
		this.xhr = new XMLHttpRequest();
		if (onProgress) this.xhr.onprogress = (event) => onProgress(event);
		this.url = url;
		this.payload = null;
		this.method = method;
		this.xhr.responseType = responseType;
		return this;
	}

	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	promise(responseType = null) {
		if(responseType !== null) this.xhr.responseType = responseType;
		return new Promise((resolve, reject) => {
			this.xhr.onreadystatechange = () => { if (this.xhr.readyState === 4) resolve(this.xhr);};
			this.xhr.onerror = (event) => { reject(event); };
			this.xhr.ontimeout = (event) => { reject(event); };
			this.xhr.open(this.method, this.url);
			if (this.contentType) { this.xhr.setRequestHeader('Content-type', this.contentType); }
			this.xhr.send(this.payload);
		});
	}

	
	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	get get(){return this.promise('');}

	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	get getString(){return this.promise('');}

	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	get getJson(){return this.promise('json');}

	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	get getArrayBuffer(){return this.promise('arraybuffer');}

	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	get getBlob(){return this.promise('blob');}

	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	get getDocument(){return this.promise('document');}

	/**
	 * @returns {Promise<XMLHttpRequest>}
	 */
	get getText(){return this.promise('text');}

}
