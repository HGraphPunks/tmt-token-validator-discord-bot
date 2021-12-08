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

module.exports = cron.schedule('* */12 * * *', function() {
  console.log('---------------------');
  console.log('Running Cron Job');
  if (!cronBot) {
    console.log('bot not ready');
    return
  }
  
  client.list("user_", { raw: false }).then((users) => {
    console.log(users);
    // Add in fetching user from discord API, not saving to DB
    users.forEach(async (userKeyFromDB) => {
      const user = await client.get(userKeyFromDB);
      const channel = cronBot.channels.cache.get(user.channelId);
      console.log(channel);

      const message = await channel.messages.fetch(user.messageId);
      console.log(message);

      let member = await message.channel.guild.members.fetch(user.author.id)
      console.log(member);

      axios
        .get('https://mainnet-public.mirrornode.hedera.com/api/v1/tokens?account.id=' + user.accountId)
        .then((response) => {
            const tokenIds = response.data.tokens.map(token => token.token_id)
            hgpHolder.coinEyesPunk = tokenIds.some(r => hgpTokenIds.coinEyesPunk.includes(r))
            hgpHolder.glitchPunk = tokenIds.some(r => hgpTokenIds.glitchPunk.includes(r))
            hgpHolder.glitchPunkGif = tokenIds.some(r => hgpTokenIds.glitchPunk.includes(r))
            hgpHolder.lazySuperPunk = tokenIds.some(r => hgpTokenIds.lazySuperPunk.includes(r))
            hgpHolder.classicPunk = tokenIds.some(r => hgpTokenIds.classicPunk.includes(r))
            
            var role = message.guild.roles.cache.find(role => role.name === "Glitch Punk Holder");
            hgpHolder.glitchPunk ? member.roles.add(role) : member.roles.remove(role);

            var role1 = message.guild.roles.cache.find(role => role.name === "Coin Eyes Holder");
            hgpHolder.coinEyesPunk ? message.member.roles.add(role1) : message.member.roles.remove(role1);

            var role2 = message.guild.roles.cache.find(role => role.name === "Lazy Super Punk Holder");
            hgpHolder.lazySuperPunk ? message.member.roles.add(role2) : message.member.roles.remove(role2);
            
            var role3 = message.guild.roles.cache.find(role => role.name === "HGP Holder");
            hgpHolder.classicPunk ? message.member.roles.add(role3) : message.member.roles.remove(role3);

            // Sense if no change, if no change do nothing
            if (!hgpHolder.glitchPunk && !hgpHolder.coinEyesPunk && !hgpHolder.lazySuperPunk && !hgpHolder.classicPunk){
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