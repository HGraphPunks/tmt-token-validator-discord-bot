const cron = require('node-cron');
const { Client: discordClient,MessageEmbed } = require('discord.js');
const Client = require("@replit/database");
const client = new Client();
const hgpHolder = require('./hgpHolder');
const hgpTokenIds = require('./hgpTokenIds');
const axios = require('axios');
const setUserWithRole = require("./db/setUserWithRole");
const deleteUser = require("./db/deleteUser");
const config = require('./config');

let cronBot = new discordClient({
  fetchAllMembers: true, // Remove this if the bot is in large guilds.
  presence: {
    status: 'online',
    activity: {
      name: `${config.prefix}validate tokens`,
      type: 'LISTENING'
    }
  }
});

cronBot.on('ready', () => console.log(`Logged in as ${cronBot.user.tag}.`));
cronBot.login(config.token);

module.exports = cron.schedule('1 */12 * * *', function() {
  console.log('---------------------');
  console.log('Running Cron Job');
  if (!cronBot) {
    console.log('bot not ready');
    return
  }
  
  client.list("user_", { raw: false }).then((users) => {
    // Add in fetching user from discord API, not saving to DB
    users.forEach(async (userKeyFromDB) => {
      console.log(userKeyFromDB)
      const user = await client.get(userKeyFromDB).catch((error) => {console.log(error);});
      console.log(user)
      const channel = cronBot.channels.cache.get(user.channelId);
      const message = await channel.messages.fetch(user.messageId).catch((error) => {console.log(error);});
      const member = await message.channel.guild.members.fetch(user.author.id).catch((error) => {console.log(error);});

      axios
        .get('https://mainnet-public.mirrornode.hedera.com/api/v1/tokens?account.id=' + user.accountId)
        .then((response) => {
           const tokenIds = response.data.tokens.map(token => token.token_id)
            hgpHolder.coinEyesPunk = tokenIds.some(r => hgpTokenIds.coinEyesPunk.includes(r))
            hgpHolder.glitchPunk = tokenIds.some(r => hgpTokenIds.glitchPunk.includes(r))
            hgpHolder.glitchPunkGif = tokenIds.some(r => hgpTokenIds.glitchPunkGif.includes(r))
            hgpHolder.lazySuperPunk = tokenIds.some(r => hgpTokenIds.lazySuperPunk.includes(r))
            hgpHolder.lazySuperDogPunk = tokenIds.some(r => hgpTokenIds.lazySuperDogPunk.includes(r))
            hgpHolder.classicPunk = tokenIds.some(r => hgpTokenIds.classicPunk.includes(r))
            
            var role = message.guild.roles.cache.find(role => role.id === "918269553472073801");
            hgpHolder.glitchPunk ? message.member.roles.add(role).catch((error) => {console.log(error);}) : message.member.roles.remove(role).catch((error) => {console.log(error);});

            var role1 = message.guild.roles.cache.find(role => role.id === "918246850811813909");
            hgpHolder.coinEyesPunk ? message.member.roles.add(role1).catch((error) => {console.log(error);}) : message.member.roles.remove(role1).catch((error) => {console.log(error);});

            var role2 = message.guild.roles.cache.find(role => role.id === "918270822861402112");
            hgpHolder.lazySuperPunk ? message.member.roles.add(role2).catch((error) => {console.log(error);}) : message.member.roles.remove(role2).catch((error) => {console.log(error);});
            
            var role3 = message.guild.roles.cache.find(role => role.id === "918270456639926362");
            hgpHolder.classicPunk ? message.member.roles.add(role3).catch((error) => {console.log(error);}) : message.member.roles.remove(role3).catch((error) => {console.log(error);});

            var role4 = message.guild.roles.cache.find(role => role.id === "918271642310946826");
            hgpHolder.lazySuperDogPunk ? message.member.roles.add(role4).catch((error) => {console.log(error);}) : message.member.roles.remove(role4).catch((error) => {console.log(error);});;

            var role5 = message.guild.roles.cache.find(role => role.id === "918273097050771457");
            hgpHolder.glitchPunkGif ? message.member.roles.add(role5).catch((error) => {console.log(error);}) : message.member.roles.remove(role5).catch((error) => {console.log(error);});

            
            // Sense if no change, if no change do nothing
            if (!hgpHolder.glitchPunk && !hgpHolder.coinEyesPunk && !hgpHolder.lazySuperPunk && !hgpHolder.classicPunk && !hgpHolder.lazySuperDogPunk && !hgpHolder.glitchPunkGif){
              deleteUser("user_" + user.accountId)
            } else {
              setUserWithRole(user, hgpHolder, message.id, message.channel.id, message.author)
            }
        })
        .catch((error) => {
            console.log(error);
        })
    });
  }
  );
});