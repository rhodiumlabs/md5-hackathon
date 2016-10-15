const express    = require('express');
const bodyParser = require('body-parser');
const _          = require('lodash');

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));


const searchedEmpty = {
  bounty: {
    sum: 0,
    address: ''
  },
  finders: []
};

const timmy = 'DC:00:1A:2D:DC:FE';
var searched = {
  timmy: searchedEmpty
};

const decays = (ppl) => {
  return ppl.map((p, i) => {
    const reward = 1.0 / Math.pow(2, i + 1);
    return {
      recipient: p,
      index: i,
      reward: reward
    }
  });
}

const addToFinders = (device, payTo) => {
  if (searched[device]) {
    const lost = searched[device];
    lost.finders = _.unique(lost.finders.push(payTo));
    // TODO: Pay by web3 with decay
    return true;
  } else {
    return false;
  }
}

const rewardAndClear = (rescuedDevice) => {
  const rescued = searched[rescuedDevice];
  const finders = rescued.finders;
  // TODO: Check leftover through web3, pay out with decays
  // const leftover = 0.8 * rescued.bounty.sum;
  delete searched[rescued];
}


app.get('/', function (req, res) {
  console.log('GET /');
  res.send('Nothing to see here');
});

app.post('/search', function (req, res) {
  console.log('POST /search');
  const deviceLost = req.body.device;
  searched[deviceLost] = searchedEmpty;
  res.send('ok');
});

// POST /find
// A mobile device has found a lost device
// Params:
// * device
// * payTo
// * rssi
// * lat
// * lng
app.post('/find', function (req, res) {
  const params = () => {
    const body = req.body;
    const pairs =
      Object.keys(body).map(
        (k) => `${k} -> ${body[k]}`
      );
    return pairs.join('\n');
  };
  console.log('POST /find\n' +params());
  const { device, payTo } = req.body;
  const success = addToFinders(device, payTo) ? 'ok' : 'error';
  res.send(success);
});

app.post('/rescue', function (req, res) {
  console.log('POST /rescue');
  const rescuedDevice = req.body.device;
  if (searched[rescuedDevice]) {
    rewardAndClear(rescuedDevice);
    res.send('ok');
  } else {
    console.log('Not needing rescue');
    res.send('error');
  }
});

app.listen(3000, function () {
  console.log('Listening on 3000');
});
