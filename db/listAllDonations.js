const Client = require("@replit/database");
const client = new Client();

async function listAllDonations(){
  await client.list("donation_")
  .then(matches => {console.log(matches)});
  console.log('end donation list')
}
module.export = listAllDonations