import expect from 'expect'
import forge from 'mappersmith'
import { install, uninstall, mockClient, mockRequest } from 'mappersmith/test'

import {
  startOfToday,
  endOfToday,
  endOfDay,
  addDays,
  parse as parseDate
} from 'date-fns'

import api from '../src/api'

import Bookeo from '../src'


var bookeo = new Bookeo({
  secretKey: 'fakeSecretKey',
  apiKey: 'fakeApiKey'
});

const client = forge(api)

describe('Bookeo', () => {
  let mock;
  beforeEach(() => {
    install()
    mock = mockRequest({
      method: 'get',
      url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/bookings/gi),
      response: {
        body: { data: [1, 2, 3, 4] }
      }
    })
  })
  afterEach(() => uninstall())
  describe('Bookings', () => {
    it("add credentials headers to request", done => {
      bookeo.bookings().then(data => {
        expect(mock.callsCount()).toEqual(1)
        expect(mock.mostRecentCall().headers()['x-bookeo-secretkey']).toEqual('fakeSecretKey')
        expect(mock.mostRecentCall().headers()['x-bookeo-apikey']).toEqual('fakeApiKey')
        done();
      })
    })
    it("return data key", done => {
      bookeo.bookings().then(data => {
        expect(data).toEqual([1, 2, 3, 4])
        done();
      })
    })
    it("add default startTime as 'startOfToday'", done => {
      bookeo.bookings().then(data => {
        expect(mock.mostRecentCall().params().startTime).toEqual = startOfToday().toISOString()
        done();
      })
    })
    it("add default endTime when not given", done => {
      bookeo.bookings({ startTime: addDays(startOfToday(), 2).toISOString() }).then(data => {
        expect(mock.mostRecentCall().params().endTime).toEqual = addDays(startOfToday(), 3).toISOString()
        done();
      })
    })
    it("fetch and concat multiple pages if any", done => {
      mock = mockRequest({
        method: 'get',
        url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/bookings/gi),
        response: {
          body: { data: [1, 2, 3, 4], info: { pageNavigationToken: 'fakePageNavigationToken', totalPages: 3 } }
        }
      })
      bookeo.bookings().then(data => {
        expect(mock.callsCount()).toEqual(3)
        expect(mock.calls()[1].params()).toEqual({pageNavigationToken: 'fakePageNavigationToken', pageNumber: 2})
        expect(mock.calls()[2].params()).toEqual({pageNavigationToken: 'fakePageNavigationToken', pageNumber: 3})
        expect(data).toEqual([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4])
        done();
      }).catch(e => console.log(e))
    })
  })
})
