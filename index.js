const { Client, MessageEmbed } = require('discord.js');
const cron = require('node-cron');
const generateLogin = require('./xactClient')
const config = require('./config');
const commands = require('./help');
const fs = require("fs");
const userCron = require("./cron");

let bot = new Client({
  fetchAllMembers: true, // Remove this if the bot is in large guilds.
  presence: {
    status: 'online',
    activity: {
      name: `${config.prefix}validate`,
      type: 'LISTENING'
    }
  }
});

userCron.start(bot)

bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}.`));

bot.on('message', async message => {
 
  // Check for command
  if (message.content.startsWith(config.prefix)) {
    let args = message.content.slice(config.prefix.length).split(' ');
    let command = args.shift().toLowerCase();

    switch (command) {

      case 'validate':
        // Only allow #bouncer bot channel
        if (message.channel.id !== '918265350276128768') {
          message.author.send("Bzzzzz* Error: Please use #🤖┃bouncer-bot to post _validate the Punks you hold")
            .catch((error) => {console.log(error);});;
          return
        }

        let msg = await message.author.send('Generating QR Code...')
          .catch((error) => {console.log(error);});;
        const qrCode = await generateLogin(message, bot);
        
        let base64Image = qrCode.split(';base64,').pop();
        
        fs.writeFile('./qrcodes/login_.jpg', base64Image, {encoding: 'base64'}, (err) => {
            console.log('File created');
            message.author.send("Scan with Xact Wallet.", { files: ["./qrcodes/login_.jpg"] })
              .catch((error) => {console.log(error);});;
        });
        break;

      /* Unless you know what you're doing, don't change this command. */
      case 'help':
        let embed =  new MessageEmbed()
          .setTitle('HELP MENU')
          .setColor('GREEN')
          .setFooter(`Requested by: ${message.member ? message.member.displayName : message.author.username}`, message.author.displayAvatarURL())
          .setThumbnail(bot.user.displayAvatarURL());
        if (!args[0])
          embed
            .setDescription(Object.keys(commands).map(command => `\`${command.padEnd(Object.keys(commands).reduce((a, b) => b.length > a.length ? b : a, '').length)}\` :: ${commands[command].description}`).join('\n'));
        else {
          if (Object.keys(commands).includes(args[0].toLowerCase()) || Object.keys(commands).map(c => commands[c].aliases || []).flat().includes(args[0].toLowerCase())) {
            let command = Object.keys(commands).includes(args[0].toLowerCase())? args[0].toLowerCase() : Object.keys(commands).find(c => commands[c].aliases && commands[c].aliases.includes(args[0].toLowerCase()));
            embed
              .setTitle(`COMMAND - ${command}`)

            if (commands[command].aliases)
              embed.addField('Command aliases', `\`${commands[command].aliases.join('`, `')}\``);
            embed
              .addField('DESCRIPTION', commands[command].description)
              .addField('FORMAT', `\`\`\`${config.prefix}${commands[command].format}\`\`\``);
          } else {
            embed
              .setColor('RED')
              .setDescription('This command does not exist. Please use the help command without specifying any commands to list them all.');
          }
        }
        message.channel.send(embed);
        break;
    }
  }
});

require('./server')();
bot.login(config.token);