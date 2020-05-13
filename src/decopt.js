export default function decopt(option, value = null) {

	let decopt = {
		decorator: Array.isArray(option) ? option[1] : option,
		option: Array.isArray(option) ? option[0] : option,
		setter: typeof value === "function" ? value : (t, f, v) => {  t.options[Array.isArray(option) ? option[0] : option] = typeof v === "undefined" ? value : v;},
		value: typeof value === "function" ? [] : [value]
	};

	return (target) => {
		// create blank or copy parents decopts
		if (!target.hasOwnProperty('__decopts')) Object.defineProperty(target, '__decopts', {value: typeof target.__decopts === "object" ? {...target.__decopts} : {}});

		// create blank options and fill with parent's decopts
		if (!target.hasOwnProperty('options')) {
			Object.defineProperty(target, 'options', {value: {}});
			for (let decopt of Object.values(target.__decopts)) decopt.setter(target, false, ...decopt.value);
		}
		// add decopt to target
		target.__decopts[decopt.decorator] = decopt;

		// run default decopt
		decopt.setter(target, false, ...decopt.value);

		// add decorator to target
		target[decopt.decorator] = function () {
			return (target, fn) => {

				// if function decorator set target
				target = typeof fn === "undefined" ? target : target.constructor;

				// create own options (and fill with defaults) if not exists
				if (!target.hasOwnProperty('options')) {
					Object.defineProperty(target, 'options', {value: {}});
					for (let decopt of Object.values(target.__decopts)) decopt.setter(target, false, ...decopt.value);
				}

				// run decorator setter
				decopt.setter(target, fn, ...arguments);
			}
		}
	};

}

