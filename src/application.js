import brickRegistry from "./brick-registry";
import AppEvent      from "./app-event";

export default class Application {

	static instance = null;

	constructor(run = true, initializeBrickRegistry = true) {
		this.constructor.instance = this;
		window.addEventListener('load',()=> {
			Promise.resolve(this.initialize())
			.then(() => initializeBrickRegistry ? brickRegistry.initialize() : Promise.resolve())
			.then(() => run ? this.run() : null);
		});
	}

	initialize() {}

	run() {};

	/**
	 * @param {string|Array<string>} event
	 * @param {Function} handler
	 */
	listen(event, handler) { AppEvent.listen(event, handler, document.body); }

	/**
	 * @param {string} event
	 * @param {*} data
	 * @param {{bubbles:boolean, cancelable: boolean}} options
	 */
	fire(event, data, options = {
		bubbles: true,
		cancelable: true
	}) { AppEvent.fire(event, data, options, document.body); }
}

