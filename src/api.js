export default {
  host: "https://api.bookeo.com/v2",
  resources: {
    products: {
      all: {
        path: "/settings/products",
        //params: {}
      },
    },
    subaccounts: {
      all: {
        path: "/subaccounts",
        //params: {}
      },
    },
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