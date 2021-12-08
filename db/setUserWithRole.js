const Client = require("@replit/database");
const client = new Client();

async function setUserWithRole(user, roles, messageId, channelId, author){
  const savedUser = {
    roles: roles,
    author: author,
    messageId: messageId,
    channelId: channelId,
    accountId: user.accountId,
    balance: user.balance,
  }
  await client.set("user_" + savedUser.accountId, savedUser);
  console.log('user set')
  console.log(savedUser)
}
module.exports = setUserWithRole

