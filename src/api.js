export default {
  host: "https://api.bookeo.com/v2",
  resources: {
    slots: {
      all: {
        path: '/availability/slots'
      }
    },
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
    payments: {
      all: {
        path: "/payments",
        //params: {}
      }
    },
    bookings: {
      all: {
        path: "/bookings",
        //params: {}
      },
      byId: {
        path: "/bookings/{id}"
      },
      payments: {
        path: "/bookings/{id}/payments"
      },
      customer: {
        path: "/bookings/{id}/customer"
      }
    },
    webhooks: {
      create: {
        method: 'post',
        path: '/webhooks',
        bodyAttr: 'webhook'
      },
      byId: {
        path: '/webhooks/{id}'
      },
      all: {
        path: "/webhooks"
      },
    }
  }
}