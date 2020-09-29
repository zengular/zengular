import brickRegistry from "./brick-registry";
import AppEvent      from "./app-event";
import decopt        from "zengular/src/decopt";

@decopt('listen:listeners',
	(target, fn, ...events) => events.forEach(eventName => target.options.listeners.push({eventName, handlerName: fn})),
	(target) => target.options.listeners = []
)
export default class Application {

	static instance = null;

	constructor(run = true, initializeBrickRegistry = true, event = 'DOMContentLoaded') {
		Application.instance = this;
		document.addEventListener(event, ()=> {
			for (let event of this.constructor.options.listeners) {
				const {eventName, handlerName} = event;
				const handler = this[handlerName];
				this.listen(eventName, (eventData) => handler.call(this, eventData));
			}
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

