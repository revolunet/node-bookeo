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

const endTime = addDays(endOfToday(), 7).toISOString();

const bookeoAPI = forge(api);

export class Bookeo {
  constructor({ secretKey, apiKey }) {
    this.creds = { secretKey, apiKey };
  }
  // fetch a singlepage based on pageNavigationToken
  // see https://www.bookeo.com/api/protocol/
  fetchPage = (endpoint, pageNavigationToken, pageNumber) => {
    return bookeoAPI[endpoint]
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
  addNextPages = json => {
    if (json.info.totalPages > 1) {
      return this.fetchNextPages(
        "bookings",
        json.info.pageNavigationToken,
        json.info.totalPages
      ).then(d => {
        json.data.push(...d);
        return json;
      });
    }
    return json;
  };
  // fetch bookings
  bookings = params => {
    const bookingsParams = {
      expandCustomer: true,
      itemsPerPage: 50,
      startTime: startOfToday().toISOString(),
      ...params
    };
    if (!bookingsParams.endTime) {
      bookingsParams.endTime = endOfDay(parseDate(bookingsParams.startTime)).toISOString();
    }
    return bookeoAPI.bookings
      .all({
        ...bookingsParams,
        headers: authHeaders(this.creds)
      })
      .then(response => JSON.parse(response.responseData))
      .then(this.addNextPages)
      .then(json => json.data);
  };
}

export default Bookeo;
