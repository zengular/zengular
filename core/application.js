import brickRegistry from "./brick-registry";
import AppEvent from "./app-event";

export default class Application {

	constructor(run = true, initializeBrickRegistry = true) {
		Promise.resolve(this.initialize())
		.then(() => initializeBrickRegistry ? brickRegistry.initialize() : Promise.resolve())
		.then(() => { if (run) this.run();});
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

