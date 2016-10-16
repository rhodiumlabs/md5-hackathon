var arDrone = require('ar-drone');
var client = arDrone.createClient();

var WiFiControl = require('wifi-control');

//  Initialize wifi-control package with verbose output
WiFiControl.init({
  debug: true
});

const droneFly = () => {
  // drone takeoff
  client.takeoff();

  // 2 seconds after takeoff, turn clockwise at .5 speed
  client.after(2000, function() {
    this.clockwise(0.5);
  })

  // stop all drone movements (just hover)
  client.stop();

  // after 2 seconds of hovering, drove move up at speed of 1.
  //client.after(6000, function() {
  //  client.up(1);
  //})

  // after 7 seconds of going up, stop and land the drone
  client.after(3000, function() {
    this.stop();
    this.land();
  });
}

var switchToDroneWifi = (callback) => {
  WiFiControl.resetWiFi(() => {
    console.log("wifi reset complete");
    WiFiControl.connectToAP({ssid: "ardrone2_v2.4.8"}, () => {
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


switchToDroneWifi(droneFly);

setTimeout(function() {
    switchToNewLab(() => {console.log("NEWLAB!")});
}, 20000);
