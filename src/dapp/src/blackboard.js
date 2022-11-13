// const initWeb3 = async () => {
//     /// Find or Inject Web3 Provider
//     /// Modern dapp browsers...
//     if (window.ethereum) {
//         App.web3Provider = window.ethereum;
//         try {
//             // Request account access
//             await window.ethereum.enable();
//         } catch (error) {
//             // User denied account access...
//             console.error("User denied account access")
//         }
//     }
//     // Legacy dapp browsers...
//     else if (window.web3) {
//         App.web3Provider = window.web3.currentProvider;
//     }
//     // If no injected web3 instance is detected, fall back to Ganache
//     else {
//         //App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
//     }

//     let appAddress = contract.flightSuretyApp._address
//     console.log("App address", appAddress);

//     let options = {
//       fromBlock: 0,
//       address: [appAddress],    //Only get events from specific addresses
//       topics: []                              //What topics to subscribe to
//       };
  
//       let subscription = contract.web3.eth.subscribe('logs', options,(err,event) => {
//           if (!err)
//           console.log(event)
//       });
  
//       subscription.on('data', event => console.log(event))
//       subscription.on('changed', changed => console.log(changed))
//       subscription.on('error', err => { throw err })
//       subscription.on('connected', nr => console.log(nr))

//     // App.getMetaskAccountID();
//   }

//   const getMetaskAccountID = () => {
//       let web3 = new Web3(App.web3Provider);

//       // Retrieving accounts
//       web3.eth.getAccounts(function(err, res) {
//           if (err) {
//               console.log('Error:',err);
//               return;
//           }
//           console.log('getMetaskID:',res);
//           App.metamaskAccountID = res[0];

//       })
//   }