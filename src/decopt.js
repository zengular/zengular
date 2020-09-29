/**
 *
 * @param {string} decorator
 * @param {any|function} value = null
 * @returns {function(*=): void}
 */
export default function decopt(decorator, value = null, defaultSetter = null) {

	let option = decorator;
	if (decorator.split(':', 2).length === 2) {
		option = decorator.split(':', 2)[1];
		decorator = decorator.split(':', 2)[0];
	}

	let decopt = {
		decorator,
		option,
		setter: typeof value === "function" ? value : (t, f, v) => { t.options[Array.isArray(option) ? option[0] : option] = typeof v === "undefined" ? value : v;},
		value: typeof value === "function" ? [] : [value]
	};
	if(defaultSetter === null)	decopt.defSetter = decopt.setter;
	else if(typeof defaultSetter === "function") decopt.defSetter = defaultSetter;
	else decopt.defSetter = ()=>{};

	return (target) => {
		// create blank or copy parents decopts
		if (!target.hasOwnProperty('__decopts')) Object.defineProperty(target, '__decopts', {value: typeof target.__decopts === "object" ? {...target.__decopts} : {}});

		// create blank options and fill with parent's decopts
		if (!target.hasOwnProperty('options')) {
			Object.defineProperty(target, 'options', {value: {}});
			for (let decopt of Object.values(target.__decopts)){
				decopt.defSetter(target, false, ...decopt.value);
			}
		}
		// add decopt to target
		target.__decopts[decopt.decorator] = decopt;

		// run default decopt
		decopt.defSetter(target, ...decopt.value);

		// add decorator to target
		target[decopt.decorator] = function () {
			return (target, fn) => {

				// if function decorator set target
				target = typeof fn === "undefined" ? target : target.constructor;

				// create own options (and fill with defaults) if not exists
				if (!target.hasOwnProperty('options')) {
					Object.defineProperty(target, 'options', {value: {}});
					for (let decopt of Object.values(target.__decopts)) decopt.defSetter(target, false, ...decopt.value);
				}

				// run decorator setter
				decopt.setter(target, fn, ...arguments);
			}
		}
	};

}

