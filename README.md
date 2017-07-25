# node-bookeo

[![npm package][npm-badge]][npm]


Node API for [Bookeo REST API](https://www.bookeo.com/api), based on [mappersmith](https://github.com/tulios/mappersmith).

Works on the server AND the browser :)

Adds some helpers

## Usage

```js
import Bookeo from 'node-bookeo'

const bookeo = new Bookeo({ secretKey, apiKey });

bookeo.bookings().then(results => {
  // return today bookings
  console.table(results);
})
```

#### REST mapping

`bookeo.client` gives you access to [mappersmith](https://github.com/tulios/mappersmith) instance.

method | description
----|------
bookeo.bookings(params) | GET [/bookings](https://www.bookeo.com/apiref/index.html#!/Bookings/bookings_get)
bookeo.booking(id, options) | GET [/bookings/{bookingId}](https://www.bookeo.com/apiref/index.html#!/Bookings/bookings_get)
bookeo.slots(params) | GET [/availability/slots](https://www.bookeo.com/apiref/index.html#!/Availability/availability_slots_get)
bookeo.products(params) | GET [/settings/products](https://www.bookeo.com/apiref/index.html#!/Settings/settings_products_get)
bookeo.subaccounts(params) | GET [/subaccounts](https://www.bookeo.com/apiref/index.html#!/Subaccounts/subaccounts_get)

NB :  autoFetch the first 5 result pages if any

 - bookeo.booking options : expand(false) : expand booking customer + payments

#### Utilities

method | description
----|------
bookeo.setApikey(apikey) | change API key for next requests
bookeo.getAllSlots(params) | return all available slots grouped by products



## Permissions

To get ApiKey with correct permission, send this link to user : `https://signin.bookeo.com/?authappid=xxxxxx&permissions=bookings_r_all,availability_r,blocks_r_all`. see the [scopes docs](https://www.bookeo.com/api/setup).

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
    ✓ return data key
    ✓ pass parameters
  Subaccounts
    ✓ pass parameters
    ✓ return data key
  Products
    ✓ pass parameters
    ✓ return data key
  Slots
    ✓ pass parameters
    ✓ return data key
  getAllSlots
    ✓ should return all slots grouped by product
  booking
    ✓ should request bookeo api
    ✓ expand=false should have no customer, payments
    ✓ expand=true should have customer + payments
  payments
    ✓ should request bookeo api


18 passing (94ms)

```

## See also

 - [bookeo-proxy](http://github.com/revolunet/bookeo-proxy) : you need this to use node-bookeo in the browser
 - [react-bookeo](http://github.com/revolunet/react-bookeo)


[npm-badge]: https://img.shields.io/npm/v/node-bookeo.png?style=flat-square
[npm]: https://www.npmjs.org/package/node-bookeo
