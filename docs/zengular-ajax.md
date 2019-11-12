# Ajax

Az `Ajax` része az zengular core csomagnak. [GitHub](https://github.com/laborci/zengular)

---

## Példányosítás
Új ajax requestet az alábbi módon hozhatsz létre:

### GET request
```js
var myRequset = Ajax.get(url, onProgress = null)
```

### DELETE request
```js
var myRequset = Ajax.delete(url, onProgress = null)
```

### POST request

`application/x-www-form-urlencoded`

```js
var myRequset = Ajax.post(url, data = null, onProgress = null)
```

### POST / json request

`application/json`

```js
var myRequset = Ajax.json(url, data = null, files=null, onProgress = null)
```

### POST / upload request

`multipart/form-data`

```js
var myRequset = Ajax.upload(url, data = null, files=null, onProgress = null)
```

## Események

Alapvetően a konstruktorokban az onProgress esemény kezelését valósíthatod meg. Amennyiben több eseménykezelőt fűznél az `XMLHttpRequest` objektumodhoz, akkor a példányosítás után visszakapott `Ajax` objektum `xhr` tulajdonságához (ami egy `XMLHttpRequest`) fűzheted hozzá azokat.

## Válasz

A válaszok egytől-egyig `Promise`-szal térnek vissza, ami resolve argumentumként az `XMLHttpRequest` objektumot adja vissza.

Választ speciális getterekkel kérhetsz, attől függően, hogy milyen `response` típust vársz.

[A válasz típusokról további információ](https://developer.mozilla.org/hu/docs/Web/API/XMLHttpRequest/responseType) 

```js
request.get;
request.getString;
```
- responseType: `""`
- válasz típusa: `DomString`

```js
request.getJson;
```
- responseType: `"json"`
- válasz típusa: `JSON`

```js
request.getArrayBuffer;
```
- responseType: `"arraybuffer"`
- válasz típusa: `ArrayBuffer`

```js
request.getBlob;
```
- responseType: `"blob"`
- válasz típusa: `Blob`

```js
request.getDocument;
```
- responseType: `"document"`
- válasz típusa: `Document`

```js
request.getText;
```
- responseType: `"text"`
- válasz típusa: `DomString`

## Példa

```js
Ajax.json("/some/url", {name: "elvis presley"}).getJson
.then(xhr=>{console.log(xhr.response);});
```
