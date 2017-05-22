import forge from "mappersmith";
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

export class Bookeo {
  constructor({ secretKey, apiKey }) {
    this.creds = { secretKey, apiKey };
    this.client = forge(api);
  }
  // fetch a singlepage based on pageNavigationToken
  // see https://www.bookeo.com/api/protocol/
  fetchPage = (endpoint, pageNavigationToken, pageNumber) => {
    return this.client[endpoint]
      .all({
        pageNavigationToken,
        pageNumber,
        headers: authHeaders(this.creds)
      })
      .then(response => JSON.parse(response.responseData));
  };
  // fetch pages 2->totalPages
  fetchNextPages = (endpoint, pageNavigationToken, totalPages) => {
    const singleFetch = pageNumber =>
      this.fetchPage(endpoint, pageNavigationToken, pageNumber).then(
        response => response.data
      );
    const fetchs = Array.from({ length: Math.min(5, totalPages - 1) }, (k, v) =>
      singleFetch(v + 2)
    );
    return Promise.all(fetchs).then(flatten);
  };
  addNextPages = endpoint => json => {
    if (json.info && json.info.totalPages > 1) {
      return this.fetchNextPages(
        endpoint,
        json.info.pageNavigationToken,
        json.info.totalPages
      ).then(d => {
        json.data.push(...d);
        return json;
      });
    }
    return json;
  };

  getItemsData = (collection, params) => {
    return this.client[collection]
      .all({
        ...params,
        headers: authHeaders(this.creds)
      })
      //.then(res => console.log(res) || res)
      .then(response => JSON.parse(response.responseData))
      .then(this.addNextPages(collection))
      .then(json => json.data)
      .catch(e => {
        console.log('ERROR', e);
        throw e;
      })
  }

  // fetch products
  products = params => this.getItemsData('products', params)
  subaccounts = params => this.getItemsData('subaccounts', params)

  // fetch bookings
  bookings = params => {
    let bookingsParams = {
      expandCustomer: true,
      itemsPerPage: 50,
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
}

export default Bookeo;
