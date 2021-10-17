import Web3 from "web3";
import consumerRoleArtifact from "../../build/contracts/ConsumerRole.json";
import distributorRoleArtifact from "../../build/contracts/DistributorRole.json";
import farmerRoleArtifact from "../../build/contracts/FarmerRole.json";
import retailerRoleArtifact from "../../build/contracts/RetailerRole.json";
import supplyChainArtifact from "../../build/contracts/SupplyChain.json";

const App = {
  web3: null,
  account: null,
  meta: null,


  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = supplyChainArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        supplyChainArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      // console.log(accounts)
      this.account = accounts[0];

      // set user ids
      const ownerId = "0x90f6a129a8f1384c8458629ca7a38a79d4bd08a0";
      const farmerId = "0xf59f23b03c53af29a972c0dd8eda935cbbae5efc";
      const distributorId = "0x03340bc262b9cdbc4227baaefcc443d4dddcbc70";
      const retailerId = "0x8df11573e8a48ab8bf17550de997b9adf3b115cf";
      const consumerId = "0x8042422cb4878cb82cb0565dae22bdeb679f22e6";


      document.getElementById("ownerID").value = ownerId;
      document.getElementById("addFarmerID").value = farmerId;
      document.getElementById("addDistributorID").value = distributorId;
      document.getElementById("addRetailerID").value = retailerId;
      document.getElementById("addConsumerID").value = consumerId;

      // this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain: " + error);
    }
  },

  // refreshBalance: async function() {
  //   const { getBalance } = this.meta.methods;
  //   const balance = await getBalance(this.account).call();

  //   const balanceElement = document.getElementsByClassName("balance")[0];
  //   balanceElement.innerHTML = balance;
  // },

  // sendCoin: async function() {
  //   const amount = parseInt(document.getElementById("amount").value);
  //   const receiver = document.getElementById("receiver").value;

  //   this.setStatus("Initiating transaction... (please wait)");

  //   const { sendCoin } = this.meta.methods;
  //   await sendCoin(receiver, amount).send({ from: this.account });

  //   this.setStatus("Transaction complete!");
  //   this.refreshBalance();
  // },

  // setStatus: function(message) {
  //   const status = document.getElementById("status");
  //   status.innerHTML = message;
  // },

  addRoles: async function () {
    // const { addFarmer, addDistributor, addRetailer, addConsumer } = this.meta.methods;
    const { addRoles } = this.meta.methods;

    try {
      const farmerID = document.getElementById("addFarmerID").value;
      const distributorID = document.getElementById("addDistributorID").value;
      const retailerID = document.getElementById("addRetailerID").value;
      const consumerID = document.getElementById("addConsumerID").value;

      document.getElementById("add-role-info").innerHTML = "";
      // listen for events
      // Or pass a callback to start watching immediately
      this.meta.events.FarmerAdded(function (error, result) {
        if (!error) {
          console.log('FarmerAdded ' + JSON.stringify(result, null, 2));
          document.getElementById("add-role-info").innerHTML += farmerID + " assigned farmer role\n";
        } else {
          console.log('FarmerAdded ' + error);
        }
      });
      this.meta.events.DistributorAdded(function (error, result) {
        if (!error) {
          console.log('DistributorAdded ' + JSON.stringify(result, null, 2));
          document.getElementById("add-role-info").innerHTML += distributorID + " assigned distributor role\n";
        } else {
          console.log('DistributorAdded ' + error);
        }
      });
      this.meta.events.RetailerAdded(function (error, result) {
        if (!error) {
          console.log('RetailerAdded ' + JSON.stringify(result, null, 2));
          document.getElementById("add-role-info").innerHTML += retailerID + " assigned retailer role\n";
        } else {
          console.log('RetailerAdded ' + error);
        }
      });
      this.meta.events.ConsumerAdded(function (error, result) {
        if (!error) {
          console.log('ConsumerAdded ' + JSON.stringify(result, null, 2));
          document.getElementById("add-role-info").innerHTML += consumerID + " assigned consumer role\n";
        } else {
          console.log('ConsumerAdded ' + error);
        }
      });

      // await addFarmer(farmerID).send({ from: this.account });
      // await addDistributor(distributorID).send({ from: this.account });
      // await addRetailer(retailerID).send({ from: this.account });
      // await addConsumer(consumerID).send({ from: this.account });
      const upc = document.getElementById("upc").value;

      await addRoles(upc, farmerID, distributorID, retailerID, consumerID).send({ from: this.account });

      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Added roles</li>"
    }
    catch (error) {
      console.log("Could not add farmer: " + error);
      // console.error("Could not add farmer: " + error);
    }
  },


  hasRole: async function () {

    const { isFarmer, isDistributor, isRetailer, isConsumer } = this.meta.methods;
    const userId = document.getElementById("userID").value;
    const role = document.getElementById("roleID").value;

    try {
      var result = false;
      switch (role) {
        case "farmer":
          result = await isFarmer(userId).call();
          break;
        case "distributor":
          result = await isDistributor(userId).call();
          break;
        case "retailer":
          result = await isRetailer(userId).call();
          break;
        case "consumer":
          result = await isConsumer(userId).call();
          break;
      }

      document.getElementById("check-role-item").innerHTML = userId + " is a " + role + " = " + result;
    }
    catch (error) {
      console.log("HasRole error: " + error);
    }

    return false;
  },

  harvest: async function () {
    const { harvestItem } = this.meta.methods;

    const upc = document.getElementById("upc").value;
    const originFarmerID = document.getElementById("addFarmerID").value;
    const originFarmName = document.getElementById("originFarmName").value;
    const originFarmInformation = document.getElementById("originFarmInformation").value;
    const originFarmLatitude = document.getElementById("originFarmLatitude").value;
    const originFarmLongitude = document.getElementById("originFarmLongitude").value;
    const productNotes = document.getElementById("productNotes").value;

    try {
      const originFarmerID = document.getElementById("addFarmerID").value;
      await harvestItem(upc, originFarmerID, originFarmName,
        originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes).send({ from: originFarmerID });

      this.fetchData1();
      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Harvest successful</li>"
    }
    catch (error) {
      console.error("Could not harvest: " + error);
    }

  },

  processItem: async function () {
    const { processItem } = this.meta.methods;

    const upc = document.getElementById("upc").value;

    try {
      const originFarmerID = document.getElementById("addFarmerID").value;
      await processItem(upc).send({ from: originFarmerID });

      this.fetchData1();
      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Item processed</li>"
    }
    catch (error) {
      console.error("Could not process: " + error);
    }

  },

  packItem: async function () {
    const { packItem } = this.meta.methods;

    try {
      const upc = document.getElementById("upc").value;
      const originFarmerID = document.getElementById("addFarmerID").value;
      await packItem(upc).send({ from: originFarmerID });

      this.fetchData1();
      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Item packed</li>"
    }
    catch (error) {
      console.error("Could not pack: " + error);
    }

  },

  sellItem: async function () {
    const { sellItem } = this.meta.methods;

    try {
      const upc = document.getElementById("upc").value;
      const originFarmerID = document.getElementById("addFarmerID").value;
      const price = document.getElementById("price").value;

      await sellItem(upc, 42).send({ from: originFarmerID });

      this.fetchData1();
      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Item put for sale</li>"
    }
    catch (error) {
      console.error("Could not sell: " + error);
    }

  },

  buyItem: async function () {
    const { buyItem } = this.meta.methods;

    try {
      const upc = document.getElementById("upc").value;
      const distributorID = document.getElementById("addDistributorID").value;
      const payment = document.getElementById("payment").value;

      await buyItem(upc).send({ from: distributorID, value:  payment});

      this.fetchData1();
      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Item bought</li>"
    }
    catch (error) {
      console.error("Could not buy: " + error);
    }

  },

  shipItem: async function () {
    const { shipItem } = this.meta.methods;

    try {
      const upc = document.getElementById("upc").value;
      const distributorID = document.getElementById("addDistributorID").value;
      
      await shipItem(upc).send({ from: distributorID});

      this.fetchData1();
      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Item shipped</li>"
    }
    catch (error) {
      console.error("Could not ship: " + error);
    }

  },

  receiveItem: async function () {
    const { receiveItem } = this.meta.methods;

    try {
      const upc = document.getElementById("upc").value;
      const retailerID = document.getElementById("addRetailerID").value;
      
      await receiveItem(upc).send({ from: retailerID});

      this.fetchData1();
      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Item received</li>"
    }
    catch (error) {
      console.error("Could not receive: " + error);
    }

  },

  purchaseItem: async function () {
    const { purchaseItem } = this.meta.methods;

    try {
      const upc = document.getElementById("upc").value;
      const consumerID = document.getElementById("addConsumerID").value;
      
      await purchaseItem(upc).send({ from: consumerID});

      this.fetchData1();
      this.fetchData2();

      document.getElementById("ftc-events").innerHTML += "<li>Item purchased</li>"
    }
    catch (error) {
      console.error("Could not purchase: " + error);
    }

  },

  fetchData1: async function () {
    const { fetchItemBufferOne } = this.meta.methods;
    const upc = document.getElementById("upc").value;
    console.log("Upc: " + upc);

    const itemInfo = await fetchItemBufferOne(upc).call();
    console.log(JSON.stringify(itemInfo, null, 2));

    const status = document.getElementById("ftc-item");

    status.innerHTML = "SKU: " + itemInfo.itemSKU + "<br>UPC: " + itemInfo.itemUPC + "<br>ownerID: "
      + itemInfo.ownerID + "<br>FarmerID: " + itemInfo.originFarmerID + "<br>Farm Name: " + itemInfo.originFarmName +
      "<br>Farm Information: " + itemInfo.originFarmInformation + "<br>Farm Latitude: " +
      itemInfo.originFarmLatitude + "<br>Farm Longitude: " + itemInfo.originFarmLongitude

  },

  fetchData2: async function () {
    const { fetchItemBufferTwo } = this.meta.methods;
    const upc = document.getElementById("upc").value;

    const itemInfo = await fetchItemBufferTwo(upc).call();
    console.log(JSON.stringify(itemInfo, null, 2));

    const status = document.getElementById("ftc-item2");
    status.innerHTML = "productID: " + itemInfo.productID + "<br>Product Notes: " + itemInfo.productNotes + "<br>Price: "
      + itemInfo.productPrice + "<br>Item State: " + itemInfo.itemState + "<br>distributorID: " + itemInfo.distributorID +
      "<br>retailerID: " + itemInfo.retailerID + "<br>consumerID: " + itemInfo.consumerID
  },

  fetchEvents: async function () {
    const { fetchItemBufferTwo } = this.meta.methods;
  }
};

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
