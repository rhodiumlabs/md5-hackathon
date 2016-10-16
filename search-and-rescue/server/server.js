const express    = require('express');
const bodyParser = require('body-parser');
const _          = require('lodash');

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));


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
      address: '0x8e3d6a8496cbac7ea255fe35be5d8e03a419c71a'
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
  // TODO: Check leftover through web3, pay out with decays
  const rewardRescueTotal = rescued.bounty.sum * rewardProportionRescue;
  getDecayed(rescued.finders).forEach((f) => {
    const payTo = f.recipient;
    const amount = f.reward * rewardRescueTotal;
    console.log(`[ PAY ] ${amount} out of ${rewardRescueTotal} to ${payTo}`);
    // TODO: Pay: amount to payTo
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
  // TODO: Calculate pay by web3 with decay
  console.log(
    `[ ${pay > 0.0 ? 'PAY' : 'ZERO'} ] ${payTo} receiving ${pay} reward`
  );
  printSearched();
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
