# node-bookeo

Node API for [Bookeo API](https://www.bookeo.com/api), based on [mappersmith](https://github.com/tulios/mappersmith).

## Usage

```js

import Bookeo from 'node-bookeo'

const bookeo = new Bookeo({ secretKey, apiKey });

bookeo.bookings().then(results => {
  console.log(results);
})

```



