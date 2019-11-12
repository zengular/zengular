# AppEvents

Az `AppEvents ` része az zengular core csomagnak. [GitHub](https://github.com/laborci/zengular)

---

Az applikációd biztosan fülel dom eseményekre, amiket kezelsz is. Kattintás, scrollozás, stb... Ezen felül az applikációd - mivel applikáció - jobb esetben saját eseményeket is kezel. Ezeket hívjuk **AppEvents**-nek. Az alap struktúra egy applikációban egymásba ágyazott elemeket (brickeket) feltételez, mindegyik elemhez egy-egy kontroller osztály példánnyal.

## Message

Ha jól tervezed és írod a programodat, akkor azt úgy teszed, hogy a tégládnak tudomása van minden saját maga alatt megjelenő új téláról, hiszen azokat ő hozza létre. Mivel tud róluk, ezért direkt módon meg is szólíthatod őket, sőt, a kontrollereik metódusait meg is tudod hívni.

```js
this.$(MyChartBrick.selector).node?.controller?.recalculate();
// vagy inkább
this.$$("chart").node?.controller.recalculate();
// vagy méginkább
this.$$("chart").controller?.recalculate();
```

## AppEvent

Az üzenetekkel jól tudsz direkt kommunikálni a téglád alá tartozó brickekkel, hiszen tisztában vagy minden api-val amit szolgáltatnak, viszont, amikor a tégládat írod, nem tudhatod, hogy milyen környezetben fogja azokat egy másik programozó felhasználni - azaz milyen téglák azok, amik a te téglád "felett állnak". Az ilyen irányú kommunikációt mindig eseményekkel oldjuk meg.

Az eseménykezelő metódusok részei a zengular `Brick` és az `Application` objektumoknak is.

```js
// küldünk egy 'backClicked' eseményt, 
this.fire('back-clicked');

// amit valahol valaki egy másik brickben elkap és feldolgoz
this.listen('back-clicked', appEvent=>{ ... }));
```

## fire()
```js
fire(eventType, data = null, options = {
		bubbles: true,
		cancelable: true
	})
```

- `eventType` : az eseményed neve.
- `data` : adatok, amik az eseményhez tartoznak
- `bubbles` : a kilövés helyén álljon e meg az esemény (`false`) vagy szeretnénk, ha eljutna a a root node-ig (`true`)
- `cancelable` : az esemény propagáció (bubbles) megállítható e?

## listen()
```js
listen(eventType, handler)
```

- `eventType` : az esemény neve, amire feliratkozol (ez lehet string vagy több eseményre fülelés esetén tömb is)
- `handler` : az eseménykezelő metódus

### Handler

Az eseménykezelő metódus paraméterként egy `AppEvent` példányt fog kapni, aminek az alábbi tulajdonságai vannak:

- `type` : az esemény neve
- `data` : az eseményhez kapcsolódó adatok
- `source` : az eseményt küldő objektum (brick)
- `domEvent` : az appEventet hordozó `CustomEvent`

Az appEvent egyteln egy fontos metódussal rendelkezik: `cancel()`, amivel, ha az eseményt feldolgoztad, akkor meg tudod állítani annak további propagálását.

```js
this.listen('back-clicked', appEvent=>{
	console.log(appEvent.data);
	appEvent.cancel();
});
```