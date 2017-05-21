import "console.table";

import creds from "./creds.json";

import Bookeo from "./src";

const bookeo = new Bookeo(creds);



const showBookings = () => {
  return bookeo.bookings().then(data => {
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
    console.table(
      data
    );
  }).catch(e => console.log(e))
}


// bookeo
//   .bookings({
//     startTime: new Date().toISOString()
//   })
//   .then(json => {
//     console.table(
//       json.map(i => ({
//         startTime: i.startTime,
//         title: i.title,
//         productName: i.productName
//       }))
//     );
//     //console.log(json.length);
//   })
//   .catch(e => {
//     console.error('error', e);
//     console.log(JSON.stringify(e, null, 2));
//   });

//bookeo.products().then(console.table).catch(console.error)
// bookeo.subaccounts().then(x => {
//   console.log("x", x);
// }).catch(e => {
//   console.error(e);
//   console.log(JSON.stringify(e, null, 2));
//   throw e
// })

showSubaccounts();
showBookings();

// bookeo.setSubAccount('prizoners')
//           .then(() => {
//             bookeo.bookings().then(d => console.table(d)).catch(e => console.log(e))
          //})


// getSubAccountApiKey = name => {
//   return bookeo.subaccounts().then(data => data.filter(a => a.name === name)[0]).catch(e => null);
// }