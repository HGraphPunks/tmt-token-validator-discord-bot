const Client = require("@replit/database");
const client = new Client();

async function setDonationNFT(author, accountId, tokenId){
  const savedDonation = {
    author: JSON.stringify(author),
    accountId: accountId,
    tokenId: tokenId
  }
  await client.set("donation_"+accountId+"_tokenId_"+tokenId, savedDonation);
  console.log('donation set')
}
module.exports = setDonationNFT

