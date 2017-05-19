import "console.table";

import creds from "./creds.json";

import Bookeo from "./src";

const bookeo = new Bookeo(creds);

bookeo
  .bookings({
    startTime: new Date().toISOString()
  })
  .then(json => {
    console.table(
      json.map(i => ({
        startTime: i.startTime,
        title: i.title,
        productName: i.productName
      }))
    );
    console.log(json.length);
  })
  .catch(e => {
    console.error('error', e);
    console.log(JSON.stringify(e, null, 2));
  });
