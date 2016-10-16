import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import logo from './logo.svg';
import './App.css';

var web3 = window.web3;

class App extends Component {
  constructor(props) {
    super(props);
    var coinbase = web3.eth.accounts[0];
    var ABIString = '[ { "constant": false, "inputs": [ { "name": "x", "type": "uint256" } ], "name": "set", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "get", "outputs": [ { "name": "retVal", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "data", "type": "uint256" } ], "name": "ItFlies", "type": "event" } ]';//  Use the string and convert to a JSON object - ABI
    var ABI = JSON.parse(ABIString);
    web3.eth.defaultAccount = coinbase;
    // what contract are we going to interact with? 
    var ContractAddress = '0x2956D35832635bf506B5a12B6868A44dDbF3b428';
    this.droneContract = web3.eth.contract(ABI).at(ContractAddress);
    this.state = {
      loading: false,
      value: this.droneContract.get().toString()
    };
  
  }
  render() {
    const setDrone = (e) => { 
      e.preventDefault();
      if(this.state.loading) {
        return;
      }
      this.setState({loading: true});
      this.droneContract.set(12345);
      this.droneContract.ItFlies({}, (error, result) => {
        this.setState({loading: false, value: this.droneContract.get().toString()});
      });
      this.setState({value: this.droneContract.get().toString()});
    }

    return (
      <div className="App">
        <div className="App-header">
          <img height={'100px'} style={{border:'10px solid #CCC'}} src="front-logo.png"/>
        </div>
        
        <div style={{height:'100px',marginTop:'20px', width:'100%'}}>
        <a className={'button deploy-drone ' + (this.state.loading ? 'loading': '')} href="#" onClick={setDrone}> {this.state.loading ? 'Executing contract': 'Deploy drone'} </a>
         
        <img width={'50px'} height={'50px'} style={{margin:' 20px auto', display:this.state.loading ? 'block':'none'}} src={'/grid.svg'} className="App-logo" alt="logo" />
         
        </div> 

        <div style={{height:'400px', width:'100%'}}>
          <GoogleMap
            bootstrapURLKeys={{key: 'AIzaSyC5XWOkErufKgrUrlIfASKMOwXr3PYULFc'}}
            defaultCenter={{lat: 40.698981, lng: -73.974793}}
            defaultZoom={15}>
            <div lat={40.698981} lng={-73.974793} className={'marker'}></div>
          </GoogleMap>
        </div>
      
        <p>{this.state.loading ? 'loading...' : ''}</p>
              ~                             <div className={'roboto accounts'}> 
          <h1>Your Accounts </h1>
          {web3.eth.accounts.map(
            (account) => <div key={account}>
              <strong>Account:</strong> {account}. 
              <strong> Balance: </strong> {web3.fromWei(web3.eth.getBalance(account), 'ether').toNumber().toFixed(2)}</div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
