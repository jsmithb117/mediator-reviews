/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const postgres = require('../database/sqldb.js');
const newRelic = require('newrelic');
const fetch = require('node-fetch');

const SERVERNAME = 'Reviews2';
const PORT = 3006;
const app = express();

app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const handleError = (err, res, location, status) => {
  newRelic.noticeError(err);
  console.error(`Error in ${location}: `, err);
  res.sendStatus(status);
};

app.get('/serverName', (req, res) => {
  res.set('X-Backend-Server', SERVERNAME);
  res.send(SERVERNAME);
});
app.use('/:listingID', express.static(`${__dirname}/../client/dist`));

// Create
// app.post('/insertreview', (req, res) => {
//   postgres.insertOneReview(req.body)
//     .then((dbResponse) => {
//       res.send(dbResponse);
//     })
//     .catch((err) => {
//       handleError(err, res, 'app.post/insertreview', 500);
//     });
// });

// Read all reviews for a given listingID
app.get('/:listingID/reviews', (req, res) => {
    fetch(`http://54.215.82.50:80/${req.params.listingID}/reviews`)
//    postgres.getAverageReviewRating(req.params.listingID)
    .then((dbResponse) => {
      return dbResponse.json();
    })
    .then((json) => {
      res.set('X-Backend-Server', SERVERNAME);
      res.send(json);
    })
    .catch((err) => {
      handleError(err, res, 'app.get/reviewpostgres', 500);
    });
});

// Read number of reviews for a given listingID
app.get('/:listingID/totalReviewCount', (req, res) => {
  // console.log('fetching /listingID/totalReviewCount for listingID: ', req.params.listingID);
  fetch(`http://54.215.82.50:80/${req.params.listingID}/reviews`)
  // postgres.readAllByID(req.params.listingID)
    .then((dbResponse) => {
      return dbResponse.json();
    })
    .then((json) => {
      // console.log('totalReviewCount json: ', json);
      const reviewResponse = json.length === 0 ? 'No Reviews'
        : json.length === 1 ? '1 review'
          : `${json.length} reviews`;
      res.send(reviewResponse);
    })
    .catch((err) => {
      handleError(err, 'app.get/:listingID/totalReviewCount', 500);
    });
});

// Read average rating for a given listingID
app.get('/:listingID/averageReviewsRating', (req, res) => {
//  console.log('logging averageReviewsRating for listingID: ', req.params.listingID);
//  fetch(`http://54.215.82.50:80/${req.params.listingID}/reviews`)
  postgres.getAverageReviewRating(req.params.listingID)
    .then((dbResponse) => {
//      return dbResponse.json();
      res.send(dbResponse);
    })
//    .then((json) => {
//      res.send(json);
//    })
    .catch((err) => {
      handleError(err, res, 'app.get/:listingID/averageReviewsRating', 500);
    });
});

// // Update
// app.put('/reviewpostgres', (req, res) => {
//   postgres.update(req.body)
//     .then((dbResponse) => {
//       res.send(dbResponse);
//     })
//     .catch((err) => {
//       handleError(err, res, 'app.put/reviewpostgres', 500);
//     });
// });

// // Delete
// app.delete('/review', (req, res) => {
//   if (req.body.id) {
//     postgres.deleteOneReview(req.body.id)
//       .then((dbResponse) => {
//         res.send(JSON.stringify(dbResponse));
//       })
//       .catch((err) => {
//         handleError(err, res, 'app.delete/review', 500);
//       });
//   } else {
//     handleError(err, res, 'app.delete/review', 404);
//   }
// });

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
