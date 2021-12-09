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


        let embed =  new MessageEmbed()
            .setTitle(`Holder Roles for: ${message.member ? message.member.displayName : message.author.username}`)
            .setColor('GREEN')
	          .setTimestamp()
	          .setDescription(`Below are the holder roles and a readout of which you have unlocked!`)
            .setFooter(`Requested by: ${message.member ? message.member.displayName : message.author.username}`, message.author.displayAvatarURL())
            .setThumbnail(bot.user.displayAvatarURL())
            .addFields(
              { name: 'Glitch Punk', value: hgpHolder.glitchPunk, inline: true},
              { name: 'Glitch Punk Gif', value: hgpHolder.glitchPunkGif, inline: true},
              { name: 'Coin Eyes', value: hgpHolder.coinEyesPunk, inline: true},
              { name: 'Lazy Super Punk', value: hgpHolder.lazySuperPunk, inline: true},
              { name: 'HGraph Punk', value: hgpHolder.classicPunk, inline: true},
              { name: 'Lazy Super Dog Punk', value: hgpHolder.lazySuperDogPunk, inline: true},
            )
        message.author.send(embed).catch((error) => {console.log(error);});
        
        if (hgpHolder.glitchPunk || hgpHolder.coinEyesPunk || hgpHolder.lazySuperPunk || hgpHolder.classicPunk || hgpHolder.lazySuperDogPunk || hgpHolder.glitchPunkGif) {
          setUserWithRole(user, hgpHolder, message.id, message.channel.id, message.author)
        }
    })
    .catch((error) => {
        console.log(error);
    });
  });

  return qrCode
}