# Application

Az `Application` része az zengular core csomagnak. [GitHub](https://github.com/laborci/zengular)

---
A Zengular alkalmazásod szokásos belépési pontja az Application-ből származtatott osztály példányosítása, illetve annak `run()` metódusa. Beavatkozásra még lehetőséged van az `initialize` metódusban (itt érdemes hozzáadni az `AppEvent` listenereket). Ez közvetlenül a brickek inicializálása előtt hívódik meg. Az `initialize` esemény vissszatérhet egy `Promise`-szal is, a process csak annak beteljesülésekor folytatódik.

A konstruktor folyamat tehát az alábbiak szerint történik:

`initialize` -> `initializeBrickRegistry` -> `run`

Példa egy applikációra.

```js
import Application from "zengular/core/application";
import '...load bricks';

export default class MyApplication extends Application{
	run(){
		// do whatever you want to
	}
};
```

A konstruktor két argumentumot vár (`run=true`, `initializeBrickRegistry=true`), amiket a származtatott osztályban tudsz megadni.

```js
export default class MyApplication extends Application{
	constructor(){
		super(false, false);
	}
};
```

Az applikációnak is van `listen` és `fire` metódusa, csakúgy, mint a brickeknek, hogy az `AppEvent`-eket kezelni tudd!


