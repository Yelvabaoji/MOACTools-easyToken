
const EASY_ERC20_SERVER_PORT = 3030
const CHAIN3_URL = "http://localhost:8545"


const express = require('express'),
app = express()
app.use(express.json())

app.use(express.static("./public")) //静态页面

// basic crypto modules
const secp256k1 = require('secp256k1');   //npm install  -g secp256k1
const keccak = require('keccak');         //npm install  -g keccak

// here we need moac chain3 modules
const Chain3 = require('chain3');           //npm i -S chain3
const myTokenByteCode = require("./myTokenByteCode");

var chain3 = new Chain3();
chain3.setProvider(new Chain3.providers.HttpProvider(CHAIN3_URL));
if (!chain3.isConnected()){
  console.log("Chain3 RPC is not connected!");
  return;
} else {
  console.log("Chain3 connected")
}
var mc = chain3.mc;
var BigNumber = chain3.BigNumber;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})



//**************************************************************
// API to get the balance of moac in the wallet
// and to return ERC20 toekn SYMB and balance if required.
//**************************************************************
app.post('/easyErc20/getWalletInfo', (req, res, next) => {
  var privateKey = req.body.key

  // check whether private key is valid
  if (privateKey.length != 64 && privateKey.length != 66) {
    res.send({"result": "private key length is invalid."});  
    return;
  }
  // if key start from 0x, we remove it
  if (privateKey.substr(0,2) == "0x") privateKey = privateKey.substr(2, privateKey.length)

  // from private key to generate public key and wallet address
  var publicKey = secp256k1.publicKeyCreate(Buffer.from(privateKey, 'hex'), false).slice(1);
  var addrBuffer = keccak('keccak256').update(publicKey).digest().slice(-20);
  var address = '0x'+addrBuffer.toString('hex')

  // get moac balance in the wallet, convert to moac.
  var balBig = new BigNumber(mc.getBalance(address).toString(10));
  var balance = balBig.dividedBy(10**18);

  res.send({"result": "OK",
    "address": address,
    "balance": balance,
  })
})


//**************************************************************
// API to send ERC-20 according to address list
// 
//**************************************************************
app.post('/easyErc20/createErc20Token', (req, res, next) => {
  var privateKey = req.body.key
  var name = req.body.name
  var symbol = req.body.symbol
  var quantity = parseInt(req.body.quantity)
  var decimals = parseInt(req.body.decimals)
  var signedTx1 = req.body.signedTx

  console.log("name=", typeof(name), name)
  console.log("symbol=", typeof(symbol), symbol)
  console.log("quantity=", typeof(quantity), quantity)
  console.log("decimals=", typeof(decimals), decimals)
  console.log("signedTx=", typeof(signedTx1), signedTx1)
 
  // check whether private key is valid
  if (privateKey.length != 64 && privateKey.length != 66) {
    res.send({"result": "private key length is invalid."});  
    return;
  }
  // if key start from 0x, we remove it. Only for private
  if (privateKey.substr(0,2) == "0x") privateKey = privateKey.substr(2, privateKey.length)

  // from private key to generate public key and wallet address
  var publicKey = secp256k1.publicKeyCreate(Buffer.from(privateKey, 'hex'), false).slice(1);
  var addrBuffer = keccak('keccak256').update(publicKey).digest().slice(-20);
  var fromAddress = '0x'+addrBuffer.toString('hex')

  //estimage gas
  // var gasValue = chain3.mc.estimateGas({data: bytecode});
  // console.log("gas estimate on contract:", gasValue);

  // get moac balance in the wallet, convert to moac.
  var balBig = new BigNumber(mc.getBalance(fromAddress).toString(10));
  var balance = balBig.dividedBy(1000000000000000000);

  if (balance <= 0.025) {
    res.send({"result": "账户里墨客不够."});
    return;
  }

  var types = ['address', 'string', 'string', 'uint', 'uint256']
  var args = [fromAddress, name, symbol, decimals, quantity]
  var parameter = chain3.encodeParams(types, args)
  console.log(parameter)
  
  var rawTx = {
    "from": fromAddress,
    "nonce": chain3.intToHex(mc.getTransactionCount(fromAddress)),
    "gasPrice": chain3.intToHex(50000000000),
    "gasLimit": chain3.intToHex(4000000),
    "data": '0x' + myTokenByteCode.objectCompress + parameter,
    "chainId": chain3.version.network
  };
  var signedTx = chain3.signTransaction(rawTx, privateKey);
  console.log("signedTx=", typeof(signedTx), signedTx)
  
  mc.sendRawTransaction(signedTx, function(error, txHash) {
    if (error){
      console.log(error)
      res.send({"result": "发币错误\n"+error});
      return;
    }
    console.log('txHash', txHash)
    var counts = 0;
    var intervalObjset = setInterval(function(){
      counts++;
      console.log('wait:',counts,'s')
      if (counts == 100) {
        clearInterval(intervalObjset)
        res.send({"result": "OK", "hash": txHash});
        return;
      }
      mc.getTransaction(txHash, function(err, result) {
        if (!err){
          if (result.blockNumber != null) {
            clearInterval(intervalObjset)
            res.send({"result": "OK", "hash": txHash});
            return;
          } else {
          }
        }else{
          clearInterval(intervalObjset)
          console.log(err)
          res.send({"result": "发币错误\n"+err});
          return;
        }
      });
    }, 1000)
  });
})

app.listen(EASY_ERC20_SERVER_PORT);
console.log('Listening on port',EASY_ERC20_SERVER_PORT,'...');
