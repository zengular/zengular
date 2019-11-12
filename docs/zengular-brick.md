# Brick

A `Brick` része az zengular core csomagnak. [GitHub](https://github.com/laborci/zengular)

---
A Zengular alkalmazás **brick**ekből áll. A brickek nem mások, mint egy-egy kiterjesztett html tag, saját kontroller logikával és templéttel. Ezeket az általános html elemektől az `is` attributum különbözteti meg.

```html
<div is="my-brick"></div>
```

Egy általános brick definíció két fájlból áll, a kontroller osztályból és a hozzá kapcsolódó templétből, aminek a legegyszerűbb formájára példa az alábbi kód:

*brick.js*

```js
import Brick from "zengular-brick";
import twig from "./template.twig";

@Brick.register('my-brick', twig)
class MyBrick extends Brick{}
```

*template.twig*

```twig
Hello Word!
```
## Brick dekorátorok

Az alábbi dekorátorok segítségével tudod a brickek alapvető működését módosítani definiálni.

#### Register
```js
@Brick.register(tag, twig=null)
```
Kötelező dekorátor, ezzel a sorral definiálhatod, hogy mi a brick neve, illetve, hogy melyik twig tartozik hozzá. Mint látod, a twig megadása nem kötelező, viszont ebben az esetben egy nem renderelő brickről beszélünk, később részletesen erről szó esik majd az AppBrick fejezetben.

#### ObserveAttributes

```js
@Brick.observeAttributes(value, attributes = null)
```
A brick feliratkozhat attribumum változás eseményre, amennyiben használod ezt a dekorátort. Ha `value` true, akkor a brick értesítést küldd az attributumok változásáról. Ha az `attributes` értéke `null`, akkor minden attributum változásról kapsz értesítést, ha viszont egy tömböt adsz át attributumok listájával, csak a megnevezett attributumok változásáról értesülsz az `onAttributeChange()` metóduson keresztül. 

A brick, ha nem használod ezt a dekorátort nem figyel az attributumok változására.

#### RenderOnConstruct (default: `true`)
```js
@Brick.renderOnConstruct(value = true)
```
A brick alapesetben amikor a dom-ba bekerül rendereli önmagát. Ezzel a dekorátorral és explicit ```false``` érték megadásával tudod ezt megtiltani. (ekkor neked kell gondoskodnod a renderelésről, a brick kontrollerében levő `render(args = {})` metódus meghívásával)

```js
this.$(MyLateRenderBrick.selector).node.controller.render();
```

#### RegisterSubBricksOnRender (default: `false`)
```js
@Brick.registerSubBricksOnRender(value = true)
```
Amennyiben szükség van rá - azaz az ` onRender()` metódusban dolgoznál a subbrickek kontrollereivel -, explicit kimondhatod, hogy a renderelés után, de még az `onRender()` metódus meghívása előtt, a renderelt tartalmak brickjeit a rendszer biztosan inicializálja számodra.

#### AddClass (default: `false`)
```js
@Brick.addClass(<string, array>class)
```
A bricked automatikusan fűzze hozzá a paraméterként kapott css osztályt, osztályokat a `root` elemének `classList`-jéhez.

#### CleanOnConstruct (default: `true`)
```js
@Brick.cleanOnConstruct(value = true)
```
A brick inicializálásakor törölje ki a saját tartalmát. (a `render` process mindenképpen töröl!)




## A brick tulajdonságai

- `root` : A brick kontrollerén belül annak html reprezentációját a `this.root` tulajdonságon keresztül érheted el!
- `root.controller` : A brick kontrollerét kívülről a brick dom node controller tulajdonságán keresztül tudod elérni.
- `dataset` : Egy referencia a brick dom node dataset tulajdonságára.



## Static

### Tulajdonságok

- `tag` : A brick neve található itt.
- `twig` : A brick által használt template érhető el ezen keresztül.
- `selector` : A brick taggel felparaméterezett selectora (pl: `[is=my-brick]`).

### Metódusok

```js
 createBrickElement(tag = 'div')
```
Létrehoz egy új elementet, amit beszúrhatsz a dom-ba.


```js
create(tag = 'div', render = true)
```
Létrehoz egy új brick kontrollert, visszatérése egy `Promise`, ami resolve argumentumként megkapja a brick-et, amit, ha a `render` argumentumod `true`, akkor már renderelve érkezik. A visszakapott brick `root`-ját beszúrhatod a dom-ba.

```js
MyBrick.create().then(brick=>{this.root.appendChild(brick.root);});
```



## Brick Template és a viewModel

A **Zengular-Brick** *Twig* templéteket használ. Átalában egy brickhez egy darab template tartozik, de persze írhatsz olyan logikát, amivel több templétet is felhasználsz. (https://twig.symfony.com/)

A templétjeid nem csak puszta html állományok, hanem a legtöbbször logikát is tartalmaznak. A logika megvalósításához adatokat kell kapjnak, ezt hívjuk viewModel-nek. A viewModelek összeállításáról a `createViewModel()` metódusodnak kell gondoskodnia. A viewModel összeállításához több forrásból is származhatnak információid:

- többek között elérheted a brick `root` elemének összes attributumát, 
- illetve az inicializáláskor (`onInitialize`) ki tudod olvasni a bricked eredeti html tartalmát is. 
- `lateRendering` esetében - azaz, amikor egy másik brick hozza létre az adott bricket és hívja meg annak `render` metódusát, ott átadhat adatokat a bricknek, amit az `beforeRender` metódusban el tudsz kapni és feldolgozhatod/tárolhatod az abban érkező értékeket.

A `createViewModel()` metódus általában egy **adattároló objektummal** tér vissza visszatérjen, de megírhatod úgy is, hogy egy **Promise** példány legyen a válasza, páldául abban az esetben, ha egy Ajax hívásból vársz adatokat a megjelenítéshez.

## Inicializálás

Egy brick létrejöttekor megtörténnek azok a beállítások, amiket a dekorátorokon keresztül beállítottál, majd meghívódik az `onInitialize` metódus. A brick tartalma ekkor még elérhető, ezt követően törli a rendszer. Ezt követően - amennyiben ezt a dekorátorod azt nem tiltja - a `render` metódus hívódik meg.

## Rendering process

A renderelés egy aszinkron művelet, mindig egy `Promise` a visszatérési értéke, ami magát a bricket adja vissza a `resolve` ágban. Abban az esetben is ha indirekt hívódik meg (pl.: a statikus `create()` metóduson keresztül.

A folyamat:

- `render(args)`
- `beforeRender(args)`
- `createViewModel()`
- `renderTemplate(viewModel)`
- `onRender()`

Ezek közül a `beforeRender`, a `createViewModel` és az `onRender` metódusok azok, ahol be tudsz avatkozni a működésbe!

### Manuális renderelés
A `render()` metódus alapesetben automatikusan meghívásra kerül az inicializálás végén. Ez végrehajt egy teljes renderelési ciklust - azaz újra gyártja a viewModel-t, majd az abból nyert adatokkal új tartalmat renderel. A `render` metódust meghívhatod te is, argumentumokkal, amit a `beforeRender` metódusban dolgozhatsz fel.

## Overrideoldandó metódusok / eseménykezelők

### createViewModel()
```js
createViewModel()
```
Erről bővebben a **Brick Template és a viewModel** fejezetben olvashatsz!

### onAttributeChange()
```js
onAttributeChange(attr, value, oldValue)
```
Ha használod az `ObserveAttributes` dekorátort, akkor attributum változáskor hívódik meg ez a metódus, argumentumként a megváltozott attributum nevét, értékét, illetve az új értékét kapja.

### onInitialize()
```js
onInitialize()
```
Egyetlen egyszer hívódik meg, a brick konstruktorában.

### beforeRender(args)
```js
beforeRender(args)
```
A render process elején, a createViewModel hívását követően kerül meghívásra. A paraméterezett renderelés argumentumat tudod itt feldolgozni.

### onRender()
```js
onRender()
```
A renderlés végén kerül meghívásra, többek között ebben állíthatod be a renderelt tartalmakhoz az eseménykezelőket, illetve polírozhatod a renderelést.

## AppEvents

### Listen

Az `AppEvent`-ekre történő feliratkozás többnyire az `onInitialize` metódusban történik. A feliratkozást a `listen` metóduson keresztül teheted meg.

```js
listen(event, handler)
```

### Fire

Az téglád bármely pontján küldhet `AppEvent`-eket, amiket a brick `fire` metódusát hívva tehetsz meg.

```js
fire(event, data = null, options = {
	bubbles: true,
	cancelable: true
})
```

## Finder, azaz $()

A finder egy nagyon hatékony eszköz arra, hogy a bricked működését definiáld. Példányosítás után elkérheted a node-ot, nodeokat, végigiterálhatsz rajtuk, könnyen fűzhetsz hozzájuk eseménykezelőket, stb...

```js
$(selector, func = null, scope = this.root) : Finder
```

A `$()` metódusnak egy selectort átadva példányosíthatsz egy új `Finder`-t. Második argumentumként átadhasz egy metódust, ami az átadott selectorra illeszkedő minden elem-re illesztve lefut.

```js
this.$('li.active', li=>{ li.classList.add('active'); });
```

## Role-ok és actorok, azaz $$()

Az alkalmazásodban a tag-ek csak azért vannak ott, mert design, tartalom vagy funkció szempontból fontosak. A design és tartalom megjelenítő tag-ek nagy részét jól kezelheted a `twig` állományaidban. Ellenben vannak olyan elemek, amik egyéb szerepet (role) is betöltenek az alkalmazásodban. Olyan elemek, amiket meg szeretnél szólítani a kontrolleredből.

Ezt megteheted az eddig ismertetett eszköztárral is, viszont a zengular-ban erre inkább használd a szerepeket és az aktorokat, ugyan is így kód szinten is jól elkülönülnek egymástól a funkcióval bíró tag-ek, a többi, csak a megjelenítésért felelő tag-től.

Aktort az alábiak szerint hozhatsz létre:

```html
<button (submit)>OK</button>
```
A fenti kódban a gomb egy aktor, aki megkapta a `submit` szerepet. A kontrolleredben a bizonyos szerepeket játszó aktorokat így szólítsd meg:

```js
this.$$('submit').node;
```