const express    = require('express');
const bodyParser = require('body-parser');
const _          = require('lodash');
const Web3       = require('web3');


// -- Setup
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

console.log(web3.version.api);
console.log(web3.isConnected());
console.log(web3.version.node);

const sender = web3.eth.accounts[0];

const amount = web3.toWei(0.001, "ether")
console.log(`Coinbase: ${coinbase}`);

const balance = web3.eth.getBalance(coinbase);
console.log(balance.toString(10));

web3.eth.defaultAccount = web3.eth.accounts[0];


// -- State
const searchedEmpty = {
  bounty: {
    sum: 0,
    address: ''
  },
  // List of finders as payTo addresses
  finders: []
};

const timmy = 'DC:00:1A:2D:DC:FE';
const rewardProportionRescue = 0.8;
const rewardProportionFind = 1.0 - rewardProportionRescue;
var searched = {
  [timmy]: {
    bounty: {
      sum: 13.7,
      address: coinbase
    },
    finders: []
  }
};


// -- Utility Functions
const printSearched = () => {
  const infoSearched = _(searched).map((info, device) => {
    const { sum, address } = info.bounty;
    const b = `${sum} @ ${address}`;
    const fs = info.finders.join('\n\t\t');
    return `device: ${device}\n\tBounty: ${b}\n\tFinders:\n\t\t${fs}`;
  });
  console.log(`\n\n[ SEARCHED ]\n ${infoSearched} \n`);
}

const getDecayed = (ppl) => {
  return ppl.map((p, i) => {
    const reward = 1.0 / Math.pow(2, i + 1);
    return {
      recipient: p,
      index: i,
      reward: reward
    }
  });
}

const getDecayedRewardFor = (who, ppl) => {
  return getDecayed(ppl).filter(
    (d) => d.recipient === who
  )[0].reward;
}

// Adds payTo address as a finder of device
// Returns the sum that the finder should be paid.
const addToFinders = (device, payTo) => {
  console.log(`[ FIND ] ${payTo} found ${device}`);
  const lost = searched[device];
  if (lost) {
    console.log('[ OK ] Is a missing person');
    const seeingDouble = _.includes(lost.finders, payTo);
    if (seeingDouble) {
      console.log(`[ DBL ] ${payTo} already rewarded for ${device}`);
      return 0.0;
    } else {
      console.log(`[ OK ] First sighting of ${device} by ${payTo}`);
      lost.finders.push(payTo);
      const reward = getDecayedRewardFor(payTo, lost.finders);
      return reward * lost.bounty.sum * rewardProportionFind;
    }
  } else {
    console.log('[ ERROR ] Not a missing person');
    return 0.0;
  }
}

const rewardAndClear = (rescuedDevice) => {
  const rescued = searched[rescuedDevice];
  const finders = rescued.finders;
  const rewardRescueTotal = rescued.bounty.sum * rewardProportionRescue;
  getDecayed(rescued.finders).forEach((f) => {
    const payTo = f.recipient;
    const amount = f.reward * rewardRescueTotal;
    console.log(`[ PAY ] ${amount} out of ${rewardRescueTotal} to ${payTo}`);
    // TODO: send amount to payTo
    web3.eth.sendTransaction({
      from: coinbase,
      to: payTo,
      value: web3.toWei(amount, "ether")
    });
  });
  delete searched[rescuedDevice];
}


// -- REST Endpoints
app.get('/', function (req, res) {
  console.log('GET /');
  printSearched();
  res.send('Nothing to see here');
});

// POST /search
// Report a missing person
//
// Params:
// * device
app.post('/search', function (req, res) {
  console.log('POST /search');
  const deviceLost = req.body.device;
  searched[deviceLost] = searchedEmpty;
  printSearched();
  res.send('ok');
});

// POST /find
// A mobile device has found a missing person
//
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
  const pay = addToFinders(device, payTo);
  console.log(
    `[ ${pay > 0.0 ? 'PAY' : 'ZERO'} ] ${payTo} receiving ${pay} reward`
  );
  printSearched();
  // PAY: send pay Ether to payTo
  web3.eth.sendTransaction({
    from: coinbase,
    to: payTo,
    value: web3.toWei(pay, "ether")
  });
  res.send(`ok: ${pay}`);
});

// POST /rescue
// A missing person has been rescued
//
// Params:
// * device
app.post('/rescue', function (req, res) {
  console.log('POST /rescue');
  const rescuedDevice = req.body.device;
  if (searched[rescuedDevice]) {
    console.log('[ RESCUE ] Pre');
    printSearched();
    rewardAndClear(rescuedDevice);
    console.log('[ RESCUE ] Post');
    printSearched();
    res.send('ok');
  } else {
    console.log('Not needing rescue');
    printSearched();
    res.send('error');
  }
});


// -- Running
app.listen(3000, function () {
  console.log('Listening on 3000');
});
