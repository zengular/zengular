# R-JSON

zengular/r-json/r-json

A zengular r-json csomag lehetővé teszi, hogy json adathalmazokat relációs modellként kezelj.

## Schema létrehozása

```
let schema = RJson.schema();
```

### "tábla" definició

```
let userDefinition = schema.define(name, dataKey = null, idField = null, mapId = true)
```

`name` : a tábla neve
`dataKey` : a táblához tartozó kulcs az adathalmazban
`idField` : amennyiben az adathalmaz nem objektum, hanem array, akkor az array-ben az adott sorhoz tartozó azonosító kulcsa
`mapId` : amennyiben false, az azonosító nem lesz kapcsolva a táblához. Amennyiben string, akkor a megadott néven történik meg a kapcsolás. true érték esetén : "id".

#### toString

`stringify(func)`

A toString metódust a definíció stringify metódusát hívva lehet megadni. A metódus paramétere az elem lesz.

```
userDefinition.stringify(item => item.name);
```

#### converter

`convert(func)`

A bemenő adatokat a betöltéskor lehet módosítani, az ezt megvalósító metódust lehet a `convert` metódusban megadni.

```
userDefinition.convert(item => {
	item.name = item.name.toUpperCase();
});
```

#### mezők hozzáadás

```
field(name, readOnyl = true)
```

A mezők alapesetben csak olvasásra nyitottak. A name argumentum lehet tömb is, így egyszerre több mezőt is hozzá lehet adni a definícióhoz.

```
userDefinition.field(['name', 'bossId'])
```

#### Relációk

##### belongsTo

```
belongsTo(name, definition, field = null)
```

`name`: az új tulajdonság neve
`definition`: a hivatkozott tábla neve
`field`: a hivatkozási kulcs neve. Alapesetben: `name + "Id"`

Azaz a definíciónk tartalmaz egy idegen kulcsot egy másik "táblára" vagy akár önmagára.

```
userDefinition.belongsTo('boss', 'user');
```

A fenti példában egy új getter jön létre, ami a "user" táblában hivatkozza meg a főnökét a felhasználónak. Az új tulajdonság neve "boss" és a hivatkozási kulcs a "bossId" lesz.

```
console.log(myUser.boss.name)
```

##### hasMany

```
hasMany(name, definition, field) 
```

A `belongsTo` párja. A fenti példát véve a főnökhoz hozzá tudunk adni egy `workers` tulajdonságot az alábbi módon, amiben visszakapjuk az összes felhasználót, akinek az aktuális felhasználónk a főnöke:

```
userDefinition.hasMany('workers', 'user', 'bossId')
```

##### relation

```
relation(name, definition, field = null, reverse = null)
```

Látszik, hogy a fenti két kapcsolat párban jár. Hogy egyszerűen megadható legyen az oda-vissza irány, használhatod a relation metódust is akár.

A fenti példa egyben deklarálva:

```
userDefinition.relation('boss', 'user', null, 'workers')
```

#### getter

```
getter(name, func)
```

Az entitásokhoz gettereket is definiálhatsz. A getter megkapja az adott rekordot és a teljes adatbázist is. A megírandó metódus szignatúrája:

```
fn(entity, rjson)
```

## Adatok 

### Adatbetöltés

Az adatok betöltése az RJson péltányosításával lehetséges.

```
let myData = new RJson(schema, data);
```

#### Parciális adatbetöltés

Amennyiben a schemaadatok egy részét felül szeretnéd írni, akkor az az `load` metóduson keresztül megteheted:

```
myData.load('user', users);
```


### Egy elem elkérése

```
myData.user.get(id)
```

### Keresés

```
myData.user.search(filterFunc)
```

Ez egy tömbbel tér vissza, minden egyéb műveletet (vágás, rendezés) alap JavaScript array hívásokkal megoldhatsz.
