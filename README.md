# Node.js application - SSR
 
## Project structure

 - `index.js` - server file
 - `lib/` - server logic
 - `public/javascripts/` - client logic

### Setup

Uses Node module dependencies (`express` and `express-handlebars`).
To install them, simply run:

```
npm install
```

### Running

development mode:

```
npm run dev
```

starting the server:

```
npm start
```

Then visit _http://localhost:3000/_ in your browser.

### Working with an HTTP request from a browser:

get JSON data:

```
http://localhost:3000/data
```
### Working with an HTTP request from the console:

get JSON data:

```
curl -X GET http://localhost:3000/data
```


