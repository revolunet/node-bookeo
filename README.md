# node-bookeo

Node API for [Bookeo API](https://www.bookeo.com/api), based on [mappersmith](https://github.com/tulios/mappersmith).


## Usage

```js

import Bookeo from 'node-bookeo'

const bookeo = new Bookeo({ secretKey, apiKey });

bookeo.bookings().then(results => {
  // return today bookings
  console.table(results);
})

```

## Permissions

To get ApiKey with correct permission, send this link to user : `https://signin.bookeo.com/?authappid=L6W6RK34CCWR&permissions=bookings_r_all,availability_r,blocks_r_all`. see the [scopes docs](https://www.bookeo.com/api/setup).

## Tests

```txt
  Bookeo
    General
      ✓ add credentials headers to request
      ✓ return data key
      ✓ fetch and concat multiple pages if any
    Bookings
      ✓ add default startTime as 'startOfToday'
      ✓ add default endTime when not given
    Subaccounts
      ✓ return data key
    Products
      ✓ return data key
```