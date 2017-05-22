import "console.table";

import creds from "./creds.json";

import Bookeo from "./src";

const bookeo = new Bookeo(creds);

const showBookings = () => {
  return bookeo.bookings().then(data => {
    if (!data.length) {
      console.log("no booking")
      return
    }
    console.table(
      data.map(i => ({
        startTime: i.startTime,
        title: i.title,
        productName: i.productName
      }))
    );
  }).catch(e => console.log(e))
}

const showSubaccounts = () => {
  return bookeo.subaccounts().then(data => {
    if (!data.length) {
      console.log("no sub account")
      return
    }
    console.table(
      data
    );
  }).catch(e => console.log(e))
}

const showProducts = () => {
  return bookeo.products().then(data => {
    if (!data.length) {
      console.log("no product")
      return
    }
    console.table(
      data
    );
  }).catch(e => console.log(e))
}

showSubaccounts();
showBookings();
showProducts();
