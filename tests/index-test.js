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
  let mockBookings, mockAccounts, mockProducts, mockSlots, mockPayments
  beforeEach(() => {
    install()
    mockBookings = mockRequest({
      method: 'get',
      url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/bookings/gi),
      response: {
        body: { data: [1, 2, 3, 4] }
      }
    })
    mockPayments = mockRequest({
      method: 'get',
      url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/payments/gi),
      response: {
        body: { data: [42, 43, 44] }
      }
    })
    mockAccounts = mockRequest({
      method: 'get',
      url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/subaccounts/gi),
      response: {
        body: { data: [4, 5, 6] }
      }
    })
    mockProducts = mockRequest({
      method: 'get',
      url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/settings\/products/gi),
      response: {
        body: { data: [7, 8, 9] }
      }
    })
    mockSlots = mockRequest({
      method: 'get',
      url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/availability\/slots/gi),
      response: {
        body: { data: [10, 11, 12] }
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
    it("return data key", () => {
      return bookeo.bookings().then(data => {
        expect(mockBookings.callsCount()).toEqual(1)
        expect(data).toEqual([1, 2, 3, 4])
      })
    })
    // it("fetch and concat multiple pages if any", () => {
    //   mockBookings = mockRequest({
    //     method: 'get',
    //     url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/bookings/gi),
    //     response: {
    //       body: { data: [1, 2, 3, 4], info: { pageNavigationToken: 'fakePageNavigationToken', totalPages: 3 } }
    //     }
    //   })
    //   return bookeo.bookings().then(data => {
    //     expect(mockBookings.callsCount()).toEqual(3)
    //     expect(mockBookings.calls()[1].params()).toEqual({pageNavigationToken: 'fakePageNavigationToken', pageNumber: 2})
    //     expect(mockBookings.calls()[2].params()).toEqual({pageNavigationToken: 'fakePageNavigationToken', pageNumber: 3})
    //     expect(data).toEqual([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4])
    //   })
    // })
  })
  describe('Bookings', () => {
    it("add default startTime as 'startOfToday'", () => {
      return bookeo.bookings().then(data => {
        expect(mockBookings.mostRecentCall().params().startTime).toEqual = startOfToday().toISOString()
      })
    })
    it("add default endTime when not given", () => {
      return bookeo.bookings({ startTime: addDays(startOfToday(), 2).toISOString() }).then(data => {
        expect(mockBookings.mostRecentCall().params().endTime).toEqual = addDays(startOfToday(), 3).toISOString()
      })
    })
    it("return data key", () => bookeo.bookings().then(data => expect(data).toEqual([1, 2, 3, 4])))
    it("pass parameters", () => bookeo.bookings({ paramTest2: 'kikoo2' }).then(data => {
      expect(mockBookings.mostRecentCall().params().paramTest2).toEqual('kikoo2')
    }))
  })
  describe('Subaccounts', () => {
    it("pass parameters", () => bookeo.subaccounts({ paramTest: 'kikoo' }).then(data => {
      expect(mockAccounts.mostRecentCall().params().paramTest).toEqual('kikoo')
    }))
    it("return data key", () => bookeo.subaccounts().then(data => expect(data).toEqual([4, 5, 6])))
  })
  describe('Products', () => {
    it("pass parameters", () => bookeo.products({ paramTest3: 'kikoo3' }).then(data => {
      expect(mockProducts.mostRecentCall().params().paramTest3).toEqual('kikoo3')
    }))
    it("return data key", () => bookeo.products().then(data => expect(data).toEqual([7, 8, 9])))
  })
  describe('Slots', () => {
    it("pass parameters", () => bookeo.slots({ paramTest4: 'kikoo4' }).then(data => {
      expect(mockSlots.mostRecentCall().params().paramTest4).toEqual('kikoo4')
    }))
    it("return data key", () => bookeo.slots().then(data => expect(data).toEqual([10, 11, 12])))
  })
  describe('getAllSlots', () => {
    beforeEach(() => {
      mockSlots = mockRequest({
        method: 'get',
        url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/availability\/slots/gi),
        response: {
          body: { data: [1, 2, 3] }
        }
      })
      mockProducts = mockRequest({
        method: 'get',
        url: url => url.match(/^https:\/\/api.bookeo.com\/v2\/settings\/products/gi),
        response: {
          body: { data: [{
            productId: 1,
          },{
            productId: 2,
          },{
            productId: 3,
          }] }
        }
      })
    })
    it("should return all slots grouped by product", () => {
      return bookeo.getAllSlots().then(data => {
        expect(mockProducts.callsCount()).toEqual(1)
        expect(mockSlots.callsCount()).toEqual(3)
        expect(data).toEqual({
          1: [1, 2, 3],
          2: [1, 2, 3],
          3: [1, 2, 3]
        })
      })
    })
  });
  describe('booking', () => {
    it("should request bookeo api", () => {
      return bookeo.booking(123).then(data => {
        expect(mockBookings.callsCount()).toEqual(1)
        expect(mockBookings.mostRecentCall().params().id).toEqual('123')
      });
    })
    it("expand=false should have no customer, payments", () => {
      return bookeo.booking(123, {expand: false}).then(data => {
        expect(mockBookings.callsCount()).toEqual(1)
        expect(data.customer).toNotExist()
        expect(data.payments).toNotExist()
      });
    })
    it("expand=true should have customer + payments", () => {
      return bookeo.booking(123, {expand: true}).then(data => {
        expect(mockBookings.callsCount()).toEqual(3)
        expect(data.customer).toExist()
        expect(data.payments).toExist()
      });
    })
  })
  describe('payments', () => {
    it("should request bookeo api", () => {
      return bookeo.payments().then(data => {
        expect(mockPayments.callsCount()).toEqual(1)
        expect(data).toEqual([42, 43, 44])
      });
    })
  })
})
