module.exports = async (client, message) => {
  if (message.author.bot) return;
  let db = require("quick.db");
  let prefix = db.fetch(`prefix_${message.guild.id}`);
  if (!prefix) prefix = client.config.prefix;
  const prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${prefix.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    )})\\s*`
  );
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content
    .slice(matchedPrefix.length)
    .trim()
    .split(/ +/);
  const command = args.shift().toLowerCase();

  const cmd =
    client.commands.get(command) ||
    client.commands.get(client.aliases.get(command));

  if (cmd) {
    if (db.fetch(`disabled_${message.guild.id}_${cmd.name}`) === true) {
      return message.channel.send(
        `⚠️ The command \`${cmd.name}\` has been disabled`
      );
    } else {
      cmd.run(client, message, args);
    }
  }
  let cc = db.fetch(`customcommand3_${message.guild.id}_${command}`);
  if (cc) {
    String.prototype.replaceAll = function(replace, replace2) {
      return this.replace(new RegExp(replace, "g"), replace2);
    };
    if (cc.nsfw === true && message.channel.nsfw !== true)
      return message.reply(":warning: NSFW command only");
    let content = cc.content;
    //user stuff
    content = content.replaceAll("//user.id", message.author.id);
    content = content.replaceAll("//user.tag", message.author.discriminator);
    content = content.replaceAll("//user.nick", message.author.username);
    content = content.replaceAll("//user.name", message.author.tag);

    content = content.replaceAll("//user", message.author);

    //server stuff
    content = content.replaceAll("//server.id", message.guild.id);
    content = content.replaceAll("//server.name", message.guild.name);

    //other
    content = content.replaceAll("//prefix", prefix);
    //args
    console.log(cc.mentions);
    if (cc.mentions && parseInt(cc.mentions) > message.mentions.users.size)
      return message.reply(
        `⚠️ You need to provide \`${cc.mentions}\` mention(s) you only provided \`${message.mentions.users.size}\` mention(s)`
      );
    if (
      cc.args &&
      parseInt(cc.args) !== 10 &&
      !content.includes("//args{join}") &&
      args.length < parseInt(cc.args)
    )
      return message.reply(
        `⚠️ You need to provide \`${cc.args}\` arg(s) you only provided \`${args.length}\` arg(s)`
      );

    if (parseInt(cc.args) === 10) {
      if (content.includes("//args{join}") && !args.join(" "))
        return message.reply(`⚠️ You need to provide a sentence`);
      if (/\{choice\s?((.+)\;)+\s?\}/.test(content) === true) {
        let randomStrings = content
          .match(/\{choice\s?((.+)\;)+\s?\}/)[1]
          .split(";")
          .slice(0, -1);
        content = content
          .replaceAll(/\{choice\s?((.+)\;)+\s\}/, "")
          .replaceAll(
            /\{choice\}/,
            randomStrings[Math.floor(Math.random() * randomStrings.length)]
          );
      }
      content = content.replace("//args{join}", args.join(" "));
    } else {
      for (let i = 0; i < args.length; i++) {
        content = content.replaceAll(
          /\/\/args\{\d\}/g,
          arg => args[parseInt(arg.match(/\/\/args\{(\d)\}/)[1]) - 1]
        );
      }
      for (let i = 0; i < message.mentions.users.size; i++) {
        let mentions = [];
        message.mentions.users.forEach(u => {
          mentions.push(u);
        });

        content = content.replace(
          /\/\/mention\{\d\}/g,
          mention =>
            mentions[parseInt(mention.match(/\/\/mention\{(\d)\}/)[1]) - 1]
        );
      }

      if (/\{choice\s?((.+)\;)+\s?\}/.test(content) === true) {
        let randomStrings = content
          .match(/\{choice\s?((.+)\;)+\s?\}/)[1]
          .split(";")
          .slice(0, -1);
        content = content
          .replaceAll(/\{choice\s?((.+)\;)+\s\}/, "")
          .replaceAll(
            /\{choice\}/,
            randomStrings[Math.floor(Math.random() * randomStrings.length)]
          );
      }
    }

    function clean(text) {
      if (typeof text === "string")
        return text
          .replace(/`​​/g, "`​​" + String.fromCharCode(8203))
          .replace(/@​​​/g, "@​​​" + String.fromCharCode(8203));
      else return text;
    }
    message.channel.send(clean(content)).then(msg => {
      if (cc.delete && cc.delete === true) {
        if (message.guild.me.hasPermission("MANAGE_MESSAGES")) {
          message.delete();
        }
      }
    });
  }
};
