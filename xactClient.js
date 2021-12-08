const Database = require("@replit/database")
const {Client} = require('@xact-wallet-sdk/client');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const hgpHolder = require('./hgpHolder');
const hgpTokenIds = require('./hgpTokenIds');
const fs = require("fs");
const setUserWithRole = require("./db/setUserWithRole");
const deleteUser = require("./db/deleteUser");

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
        
        var role = message.guild.roles.cache.find(role => role.name === "Glitch Punk Holder");
        hgpHolder.glitchPunk ? message.member.roles.add(role) : message.member.roles.remove(role);

        var role1 = message.guild.roles.cache.find(role => role.name === "Coin Eyes Holder");
        hgpHolder.coinEyesPunk ? message.member.roles.add(role1) : message.member.roles.remove(role1);

        var role2 = message.guild.roles.cache.find(role => role.name === "Lazy Super Punk Holder");
        hgpHolder.lazySuperPunk ? message.member.roles.add(role2) : message.member.roles.remove(role2);
        
        var role3 = message.guild.roles.cache.find(role => role.name === "HGP Holder");
        hgpHolder.classicPunk ? message.member.roles.add(role3) : message.member.roles.remove(role3);

        let embed =  new MessageEmbed()
            .setTitle(`Holder Roles for: ${message.member ? message.member.displayName : message.author.username}`)
            .setColor('GREEN')
	          .setTimestamp()
	          .setDescription(`Below are the holder roles and a readout of which you have unlocked!`)
            .setFooter(`Requested by: ${message.member ? message.member.displayName : message.author.username}`, message.author.displayAvatarURL())
            .setThumbnail(bot.user.displayAvatarURL())
            .addFields(
              { name: 'Glitch Punk Holder', value: hgpHolder.glitchPunk, inline: true },
              { name: 'Coin Eyes Holder', value: hgpHolder.coinEyesPunk, inline: true },
              { name: 'Lazy Super Punk Holder', value: hgpHolder.lazySuperPunk, inline: true },
              { name: 'HGP Holder', value: hgpHolder.classicPunk, inline: true },
            )
        message.author.send(embed);
        console.log(message)
        if (hgpHolder.glitchPunk || hgpHolder.coinEyesPunk || hgpHolder.lazySuperPunk || hgpHolder.classicPunk) {
          setUserWithRole(user, hgpHolder, message.id, message.channel.id, message.author)
        }
    })
    .catch((error) => {
        console.log(error);
    });
  });

  return qrCode
}