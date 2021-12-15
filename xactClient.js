const Database = require("@replit/database")
const {Client: xactClient} = require('@xact-wallet-sdk/client');
const Client = require("@replit/database");
const dbClient = new Client();
const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const hgpHolder = require('./hgpHolder');
const hgpTokenIds = require('./hgpTokenIds');
const fs = require("fs");
const setDonationNFT = require("./db/setDonationNFT");
const generateSaleCode = require("./generateSaleCode");
const listAllDonations = require("./db/listAllDonations");


module.exports = async (message, bot, price, sellerAccountId, buyerAccountId) => {
  await dbClient.list("sellers_")
  .then(matches => {
    console.log(matches)
    matches.map(match => {
      dbClient.get("match").then(value => {
        console.log(value)
      });
    })
  });
  console.log('end seller list')
  //get your api key from your .env file
  const apiKey = process.env.XACT_PRIVATE_KEY
  // If we weren't able to find it, we should throw a new error
  if (apiKey == null) {
      throw new Error("Environment variables API_KEY must be present");
  }
  /* Create a new instance of Client */
  let xactClient = new xactClient({apiKey});
  
  /* Init the connection */
  await xactClient.initConnexion();
  
  const obj = {
    fromAccountId: accountId,
    hbarAmount: price,
    quantity: '1',
    tokenId: '0.0.495216',
  };
  obj.hbarAmount = parseInt(obj.hbarAmount);
  obj.quantity = parseInt(obj.quantity);

  const saleResponse = await xactClient.sellNFT(obj);
  console.log(saleResponse)

  /* Subscribe to new sale NFT Validation */
  xactClient.sellNFTValidation().subscribe(async nftObj => {
    console.log('NFT successfully set in sale', nftObj);
    const nftIds = nftObj.nftIds
    buyCoinEyes(xactClient, buyerAccountId, nftIds, message)
    message.author.send("Coin Eyes is now up for sale, waiting for buyer to accept")
  });
   

}

async function buyCoinEyes(xactClient, buyerAccountId, nftIds, message){
   await xactClient.buyNFT("0.0.495216", {fromAccountId: buyerAccountId, nftIds});
    /* Listen for Creation's success */
    xactClient.buyNFTValidation().subscribe(nftObj => {
        console.log('NFT successfully bought', nftObj);
        
        let data = JSON.stringify(nftObj, null, 2);

        fs.writeFile(`purchases/${nftObj.accountId}_${nftObj.nftIds[0]}.json`, data, (err) => {
            if (err) throw err;
            console.log('Coin Eyes Data written to file');
        });
        message.author.send("Sale Complete")
 
    });
}