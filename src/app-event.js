/**
 * @property {*} data
 * @property {Node} source
 * @property {string} type
 * @property {CustomEvent} domEvent
 */
export default class AppEvent {

	/**
	 *
	 * @param {string} eventType
	 * @param {Node} sender
	 * @param {*} data
	 * @param {boolean} bubbles
	 * @param {boolean} cancelable
	 */
	constructor(eventType, sender, data, bubbles = true, cancelable = true) {
		this.data = data;
		this.source = sender;
		this.type = eventType;
		this.domEvent = new CustomEvent(eventType, {bubbles, cancelable, detail: this});
	}

	cancel() {this.domEvent.stopPropagation();}
	/**
	 * @param {string} event
	 * @param {*} data
	 * @param {{bubbles:boolean, cancelable: boolean}} options
	 * @param {Element} node
	 */
	static fire(event, data, options, node) {
		node.dispatchEvent(new AppEvent(event, node, data, options.bubbles, options.cancelable).domEvent);
	}

	/**
	 * @param {string | Array<string>} event
	 * @param {Function} handler
	 * @param {Element} node
	 */
	static listen(event, handler, node) {
		if (typeof event === 'string') event = [event];
		event.forEach(eventType => {
			node.addEventListener(eventType, (event) => {
				return handler(event.detail);
			});
		});
	}

	static broadcast(event, data = null) {
		document.querySelectorAll('[is]').forEach(node => AppEvent.fire(event, data, {
			bubbles: false,
			cancelable: true
		}, node));
	}

}
