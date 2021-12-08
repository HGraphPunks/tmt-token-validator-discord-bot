const Database = require("@replit/database")
const {Client} = require('@xact-wallet-sdk/client');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const hgpHolder = require('./hgpHolder');
const hgpTokenIds = require('./hgpTokenIds');
const fs = require("fs");

module.exports = async (message, bot) => {
  //get your api key from your .env file
  const apiKey = process.env.XACT_PRIVATE_KEY
  // If we weren't able to find it, we should throw a new error
  if (apiKey == null) {
      throw new Error("Environment variables API_KEY must be present");
  }
  /* Create a new instance of Client */
  let client = new Client({apiKey});
  
  /* Init the connection */
  await client.initConnexion();
  
  /* Generate a QR Code */
  const qrCode = await client.generateQRCode();

  
  /* Subscribe to new Connections */
  client.connect().subscribe(user => {
        // Check to see if user is a punk holder
    axios
    .get('https://mainnet-public.mirrornode.hedera.com/api/v1/tokens?account.id=' + user.accountId)
    .then((response) => {
        console.log(message)
        const tokenIds = response.data.tokens.map(token => token.token_id)
        hgpHolder.coinEyesPunk = tokenIds.some(r => hgpTokenIds.coinEyesPunk.includes(r))
        hgpHolder.glitchPunk = tokenIds.some(r => hgpTokenIds.glitchPunk.includes(r))
        hgpHolder.glitchPunkGif = tokenIds.some(r => hgpTokenIds.glitchPunk.includes(r))
        hgpHolder.lazySuperPunk = tokenIds.some(r => hgpTokenIds.lazySuperPunk.includes(r))
        hgpHolder.classicPunk = tokenIds.some(r => hgpTokenIds.classicPunk.includes(r))
        
        if (hgpHolder.glitchPunk) {
          var role = message.guild.roles.cache.find(role => role.name === "Glitch Punk Holder");
message.member.roles.add(role);
        }
        if (hgpHolder.coinEyesPunk) {
          var role1 = message.guild.roles.cache.find(role => role.name === "Coin Eyes Holder");
message.member.roles.add(role1);
        }
        if (hgpHolder.lazySuperPunk) {
          var role2 = message.guild.roles.cache.find(role => role.name === "Lazy Super Punk Holder");
message.member.roles.add(role2);
        }
        if (hgpHolder.classicPunk) {
          var role3 = message.guild.roles.cache.find(role => role.name === "HGP Holder");
message.member.roles.add(role3);
        }

        let embed =  new MessageEmbed()
            .setTitle(`Holder Roles for: ${message.member ? message.member.displayName : message.author.username}`)
            .setColor('GREEN')
	          .setTimestamp()
	          .setDescription(`Below are the holder roles and a redaout of which you have unlocked!`)
            .setFooter(`Requested by: ${message.member ? message.member.displayName : message.author.username}`, message.author.displayAvatarURL())
            .setThumbnail(bot.user.displayAvatarURL())
            .addFields(
              { name: 'Glitch Punk Holder', value: hgpHolder.glitchPunk },
              { name: 'Coin Eyes Holder', value: hgpHolder.coinEyesPunk },
              { name: 'Lazy Super Punk Holder', value: hgpHolder.lazySuperPunk },
              { name: 'HGP Holder', value: hgpHolder.classicPunk },
            )
        message.channel.send(embed);
    })
    .catch((error) => {
        console.log(error);
    });
  });

  return qrCode
}