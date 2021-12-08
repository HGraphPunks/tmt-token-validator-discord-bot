const Client = require("@replit/database");
const client = new Client();

async function deleteUser(accountId){
  await client.delete("user_" + accountId);
  console.log('user deleted')
  console.log(accountId)
}
module.export = deleteUser