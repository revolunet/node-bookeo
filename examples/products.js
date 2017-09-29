
var Bookeo = require('../')
require('console.table')


var bookeo = new Bookeo(require('../creds.json'))

// list all products
bookeo.client.products.all().then(r => r.map(d => ({
  name: d.name,
  productId: d.productId
}))).then(console.table).catch(console.error)