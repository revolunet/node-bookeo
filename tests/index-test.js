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
  let mockBookings, mockAccounts;
  beforeEach(() => {
    install()
    mockBookings = mockRequest({
      method: 'get',
      url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/bookings/gi),
      response: {
        body: { data: [1, 2, 3, 4] }
      }
    })
    mockAccounts = mockRequest({
      method: 'get',
      url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/subaccounts/gi),
      response: {
        body: { data: [{ id: 1234, name:'prizoners1'}, { id: 5678, name:'prizoners2'}] }
      }
    })
  })
  afterEach(() => uninstall())
  describe('General', () => {
    it("add credentials headers to request", done => {
      bookeo.bookings().then(data => {
        expect(mockBookings.callsCount()).toEqual(1)
        expect(mockBookings.mostRecentCall().headers()['x-bookeo-secretkey']).toEqual('fakeSecretKey')
        expect(mockBookings.mostRecentCall().headers()['x-bookeo-apikey']).toEqual('fakeApiKey')
        done();
      })
    })
    it("return data key", done => {
      bookeo.bookings().then(data => {
        expect(data).toEqual([1, 2, 3, 4])
        done();
      })
    })
    it("fetch and concat multiple pages if any", done => {
      mockBookings = mockRequest({
        method: 'get',
        url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/bookings/gi),
        response: {
          body: { data: [1, 2, 3, 4], info: { pageNavigationToken: 'fakePageNavigationToken', totalPages: 3 } }
        }
      })
      bookeo.bookings().then(data => {
        expect(mockBookings.callsCount()).toEqual(3)
        expect(mockBookings.calls()[1].params()).toEqual({pageNavigationToken: 'fakePageNavigationToken', pageNumber: 2})
        expect(mockBookings.calls()[2].params()).toEqual({pageNavigationToken: 'fakePageNavigationToken', pageNumber: 3})
        expect(data).toEqual([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4])
        done();
      }).catch(e => console.log(e))
    })
  })
  describe('Bookings', () => {
    it("add default startTime as 'startOfToday'", done => {
      bookeo.bookings().then(data => {
        expect(mockBookings.mostRecentCall().params().startTime).toEqual = startOfToday().toISOString()
        done();
      })
    })
    it("add default endTime when not given", done => {
      bookeo.bookings({ startTime: addDays(startOfToday(), 2).toISOString() }).then(data => {
        expect(mockBookings.mostRecentCall().params().endTime).toEqual = addDays(startOfToday(), 3).toISOString()
        done();
      })
    })
  })
  describe('Subaccounts', () => {
    it("get account key by name", done => {
      bookeo.getSubAccountApiKey('prizoners2').then(data => {
        expect(data).toEqual('5678')
        done();
      });
    })
    it("return null if not found", done => {
      bookeo.getSubAccountApiKey('xxx').then(data => {
        expect(data).toEqual(null)
        done();
      });
    })
    describe('setSubAccount', () => {
      it("throw when unknown account", done => {
        bookeo.setSubAccount('xxx').then(data => {
          // should fail
          expect(true).toEqual(false)
        }).catch(e => {
          done();
        })
      })
      it("set subaccount api key for future operations", () => {
        return bookeo.bookings().then(data => {
          // check we use the standard api key
          expect(mockBookings.mostRecentCall().headers()['x-bookeo-apikey']).toEqual('fakeApiKey')
          // check we use the new api key
          return bookeo.setSubAccount('prizoners2').then(data => bookeo.bookings().then(data => {
            expect(mockBookings.mostRecentCall().headers()['x-bookeo-apikey']).toEqual('5678')
          }));
        })
      })
    })
  })
})
