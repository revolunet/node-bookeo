export default {
  host: "https://api.bookeo.com/v2",
  resources: {
    bookings: {
      all: {
        path: "/bookings",
        //params: {}
      },
      byId: {
        path: "/bookings/{id}",
        params: { expandCustomer: true, itemsPerPage: 100 }
      }
    }
  }
}