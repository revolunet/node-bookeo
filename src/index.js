import forge from "mappersmith";
import EncodeJson from 'mappersmith/middlewares/encode-json'

import {
  startOfToday,
  endOfToday,
  endOfDay,
  addDays,
  parse as parseDate
} from "date-fns";
import flatten from "lodash.flatten";

import api from "./api";

const authHeaders = ({ secretKey, apiKey }) => ({
  "X-Bookeo-secretKey": secretKey,
  "X-Bookeo-apiKey": apiKey
});

const getAuthMiddleware = headers => () => ({
  request(request) {
    return request.enhance({
      headers
    })
  }
})

const BookeoApiResponseMiddleware = () => ({
  response(next) {
    return next().then((response) => {
      if (response.responseData) {
        const json = JSON.parse(response.responseData);
        // return "data" key for array
        if (json.info && json.info.totalPages) {
          return json.data
        }
        return json
      } else {
        return {}
      }
    })
  }
})

export class Bookeo {
  constructor({ secretKey, apiKey, host }) {
    this.creds = { secretKey, apiKey };
    const bookeoApiDefinition = {
      ...api
    }
    if (host) {
      bookeoApiDefinition.host = host
    }


    this.client = forge({
      middlewares: [
        EncodeJson,
        getAuthMiddleware({
          ...authHeaders(this.creds),
          'Content-Type': 'application/json'
        }),
        BookeoApiResponseMiddleware
      ],
      ...bookeoApiDefinition
    });
  }
  // fetch a singlepage based on pageNavigationToken
  // see https://www.bookeo.com/api/protocol/
  fetchPage = (endpoint, pageNavigationToken, pageNumber) => {
    return this.client[endpoint]
      .all({
        pageNavigationToken,
        pageNumber
      })
      //.then(response => JSON.parse(response.responseData));
  };
  // fetch pages 2->totalPages
  fetchNextPages = (endpoint, pageNavigationToken, totalPages) => {
    const singleFetch = pageNumber =>this.fetchPage(endpoint, pageNavigationToken, pageNumber).then(response => response.data)
    const fetchs = Array.from({ length: Math.min(4, totalPages - 1) }, (k, v) => singleFetch(v + 2))
    return Promise.all(fetchs).then(flatten);
  };

  // getNextPages = endpoint => json => {
  //   if (json.info && json.info.totalPages > 1) {
  //     return this.fetchNextPages(
  //       endpoint,
  //       json.info.pageNavigationToken,
  //       json.info.totalPages
  //     )
  //   }
  //   return [];
  // };

  setApiKey = key => {
    this.apiKey = key
  }

  // return all slots for all products
  getAllSlots = (params) => {
    return this.products().then(products => {
      const getSlotsParams = product => ({
        productId: product.productId,
        itemsPerPage: 300,
        startTime: startOfToday().toISOString(),
        endTime: addDays(startOfToday(), 7).toISOString(),
        ...params
      });
      // match all products slots and return an object with all slots grouped by productId
      const getSlotPromise = product => this.slots(getSlotsParams(product)).then(data => ({ [product.productId]: data || [] }))
      const productsSlots = products.map(getSlotPromise)
      return Promise.all(productsSlots).then(res => res.reduce((acc, c) => ({
        ...acc,
        ...c
      }), {}));
    }).catch(e=>console.log('getAllSlots error', e))
  }

  // get collection and massage data
  getItemsData = (collection, params) => {
    const items = [];
    return this.client[collection]
      .all({
        ...params
      })
      // .then(response => {
      //   const json = JSON.parse(response.responseData)
      //   items.push(...json.data);
      //   return json;
      // })
    //  .then(this.getNextPages(collection))
      .then(data => data.data)
  //    .then(() => items)
      .catch(e => {
        console.log('\n\nERROR', e, '\n\n');
        throw e;
      })
  }

  // get collection item
  getItemData = (collection, itemId, method='byId') => {
    return this.client[collection][method]({
      id: itemId
    })
  //  .then(response => JSON.parse(response.responseData))
    .catch(e => {
      console.log('\n\nERROR', e, '\n\n');
      throw e;
    })
  }

  // fetch products
  products = params => this.getItemsData('products', params)
  subaccounts = params => this.getItemsData('subaccounts', params)
  slots = params => this.getItemsData('slots', params)
  payments = params => this.getItemsData('payments', params)
  webhooks = params => this.getItemsData('webhooks', params)

  // fetch bookings
  bookings = params => {
    let bookingsParams = {
      startTime: startOfToday().toISOString(),
      ...params
    }
    if (!bookingsParams.endTime) {
      bookingsParams.endTime = endOfDay(
        parseDate(bookingsParams.startTime)
      ).toISOString();
    }
    return this.getItemsData('bookings', bookingsParams)
  };

  booking = (bookingId, {expand=false} = {}) => {
    return this.getItemData('bookings', bookingId).then(bookingData => {
      if (!expand) {
        return bookingData
      }
      const data = {
        ...bookingData
      }
      return this.getItemData('bookings', bookingId, 'customer').then(customerData => {
        data.customer = { ...customerData };
        return this.getItemData('bookings', bookingId, 'payments').then(paymentsData => {
          data.payments = { ...paymentsData };
          return data
        })
      })
    })
  }
}

export default Bookeo;
module.exports = Bookeo;
