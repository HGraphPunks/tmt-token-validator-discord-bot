
const fs = require("fs");
const {Client} = require('@xact-wallet-sdk/client');

module.exports = async (accountId, tokenId) => {
  const apiKey = process.env.XACT_PRIVATE_KEY
  // If we weren't able to grab it, we should throw a new error
  if (apiKey == null) {
      throw new Error("Environment variables API_KEY must be present");
  }

  /* Create a new instance of Client */
  const client = new Client({apiKey});
  
  /* Init the connexion */
  await client.initConnexion();
  const qrCodeObj = await client.getNFTForSaleByTokenId({tokenId: tokenId});
  console.log(qrCodeObj)

  let base64Image = qrCodeObj.qrCode.split(';base64,').pop();
      
  fs.writeFile(`./donation_codes/donation_${accountId}_${tokenId}.jpg`, base64Image, {encoding: 'base64'}, (err) => {
      console.log('Donation File created');
  });
};