var WiFiControl = require('wifi-control');
 
//  Initialize wifi-control package with verbose output 
WiFiControl.init({
  debug: true
});


var switchToDroneWifi = (callback) => {
  WiFiControl.resetWiFi(()=> {
    console.log("wifi reset complete");
    WiFiControl.connectToAP( {ssid:"ardrone2_124817"}, ()=>{
      console.log("SWITCHED to dronewifi");
      callback();
    });
  });
}

var switchToNewLab = (callback) => {
  WiFiControl.resetWiFi(()=> {
    console.log("wifi reset complete");
    WiFiControl.connectToAP( {ssid:"NewLabMember", password:"ADDPASSHERE"}, ()=>{
      console.log("SWITCHED to new lab");
      callback();
    });
  });
}


switchToDroneWifi(()=>{console.log("DROOONE!")});

setTimeout(function() {
    switchToNewLab(()=>{console.log("NEWLAB!")});
}, 10000);
