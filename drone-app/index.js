
// import ethereum web3 nodejs library
var Web3 = require('web3');

// set your web3 object
var web3 = new Web3();

var arDrone = require('ar-drone');
var client = arDrone.createClient();

var WiFiControl = require('wifi-control');

//  Initialize wifi-control package with verbose output
WiFiControl.init({
  debug: true
});

const droneFly = () => {
  //drone takeoff
  client.takeoff();

  //2 seconds after takeoff, turn clockwise at .5 speed
  // client.after(2000, function() {
  //   this.clockwise(0.5);
  // })
  //
  // //stop all drone movements (just hover)
  // client.stop();
  //
  // //after 2 seconds of hovering, drove move up at speed of 1.
  // client.after(6000, function() {
  //   client.up(1);
  // })
  //
  // client.animate('flipLeft', 1000);

  //after 7 seconds of going up, stop and land the drone
  client.after(3000, function() {
    this.stop();
    this.land();
  });
}

var switchToDroneWifi = (callback) => {
  WiFiControl.resetWiFi(() => {
    console.log("wifi reset complete");
    WiFiControl.connectToAP({ssid: "ardrone2_124817"}, () => {
      console.log("SWITCHED to dronewifi");
      callback();
    });
  });
}

var switchToNewLab = (callback) => {
  WiFiControl.resetWiFi(() => {
    console.log("wifi reset complete");
    WiFiControl.connectToAP({
      ssid: "NewLabMember", password: "!Welcome2NewLab!"
    }, () => {
      console.log("SWITCHED to new lab");
      callback();
    });
  });
}





// set the web3 object local blockchain node
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));


// log some web3 object values to make sure we're all connected
console.log(web3.version.api);
console.log(web3.isConnected());
console.log(web3.version.node);

// test to see if a local coinbase is running ... we'll need this account to interact with a contract.
var coinbase = web3.eth.accounts[0];

// if default wallet/account isn't set - this won't have a value.  needed to interact with a contract.
console.log(coinbase);

// let's print the balance of the wallet/account to test coinbase settings
// no worries if this is 0... don't need money to read events!
var balance = web3.eth.getBalance(coinbase);
console.log(balance.toString(10));

//  ABI - Application Binary Interface Definition for the contract that we want to interact with.
//  First set the ABI string ...
var ABIString = '[ { "constant": false, "inputs": [ { "name": "x", "type": "uint256" } ], "name": "set", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "get", "outputs": [ { "name": "retVal", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "data", "type": "uint256" } ], "name": "ItFlies", "type": "event" } ]';
//  Use the string and convert to a JSON object - ABI
var ABI = JSON.parse(ABIString);

// what contract are we going to interact with?
var ContractAddress = '0x2956D35832635bf506B5a12B6868A44dDbF3b428';

// Set the local node default account in order to interact with the contract
// (can't interact with a contract if it doesn't know 'who' it is interacting with)
web3.eth.defaultAccount = web3.eth.accounts[0];

// now retrieve your contract object with the ABI and contract address values
var droneflyer = web3.eth.contract(ABI).at(ContractAddress);

console.log(droneflyer);

// indefinite recursive loop to read the 'ItBlinks' event in the blink contract.
var event = droneflyer.ItFlies( {}, function(error, result) {
  if (!error) {
  	// when ItFlies event is fired, output the value 'data' from the result object and the block number
    var msg = "\n\n*********";
    msg += "Fly!: " + result.args.data + " (block:" + result.blockNumber + ")";
    msg += "*********";

    console.log(msg);

    switchToDroneWifi(droneFly);

    //setTimeout(function() {
    //    switchToNewLab(() => {console.log("NEWLAB!")});
    //}, 20000);

  }
});
