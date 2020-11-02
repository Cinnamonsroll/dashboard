const {
  Router
} = require("express");
const {
  checkAuth
} = require("../");
const _ = require("lodash");
let Discord = require("discord.js");
let db = require("quick.db");
module.exports = client => {
  const router = Router();
  router.use(checkAuth);
  Array.prototype.limit = function(amount) {
    let array = this;
    let array2 = [];
    for (let i = 0; i < amount; i++) {
      array2.push(array[i]);
    }
    return array2;
  };

  function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }

  router.get("/", async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    res.render("dashboard.ejs", {
      bot: req.bot,
      user: req.user || null,
      guilds: getGuilds()
    })
  });

  router.get("/:id/manage/general", async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    let id = req.params.id;
    let guild = client.guilds.cache.get(id);
    if (!client.guilds.cache.get(id)) return res.redirect("/404")
    let manage = false
    let test = guild.members.cache.get(req.user.id);
    if (!test) test = ""
    if (test && test.permissions.has("MANAGE_GUILD")) manage = true
    let prefix = db.fetch(`prefix_${id}`);
    if (!prefix) prefix = client.config.prefix;
    guild.prefix = prefix;
    guild.nickname = guild.members.cache.get(client.config.bot.id).displayName;
    let perm = false;
    if (
      guild.members.cache
      .get(client.config.bot.id)
      .hasPermission("MANAGE_NICKNAMES")
    )
      perm = true;
    guild.perm = perm;

    let changeLogs = db.fetch(`generalLogs1_${id}`);
    if (changeLogs) {
      changeLogs = changeLogs.sort(function(a, b) {
        return b.time - a.time
      })
      for (let i = 0; i < changeLogs.length; i++) {
        changeLogs[i].user = changeLogs[i].user
        changeLogs[i].time = timeSince(changeLogs[i].time)
      }
    }
    if (changeLogs && changeLogs.length > 3) changeLogs = changeLogs.limit(3)
    guild.active = "general"
    res.render("general.ejs", {
      bot: req.bot,
      user: req.user,
      guild: guild,
      changeLogs: changeLogs,
      guilds: getGuilds()
    });
  });
  router.get("/:id/manage", checkAuth, async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    let id = req.params.id;
    let guild = client.guilds.cache.get(id);
    if (!client.guilds.cache.get(id)) return res.redirect("/404")
    let manage = false
    let test = guild.members.cache.get(req.user.id);
    if (!test) test = ""
    if (test && test.permissions.has("MANAGE_GUILD")) manage = true


    let prefix = db.fetch(`prefix_${id}`);
    if (!prefix) prefix = client.config.prefix;
    guild.prefix = prefix;
    guild.nickname = guild.members.cache.get(client.config.bot.id).displayName;
    let perm = false;
    if (
      guild.members.cache
      .get(client.config.bot.id)
      .hasPermission("MANAGE_NICKNAMES")
    )
      perm = true;
    guild.perm = perm;

    let changeLogs = db.fetch(`generalLogs1_${id}`);

    if (changeLogs) {
      changeLogs = changeLogs.sort(function(a, b) {
        return b.time - a.time
      })
    for (let i = 0; i < changeLogs.length; i++) {
        changeLogs[i].user = changeLogs[i].user
        changeLogs[i].time = timeSince(changeLogs[i].time)
      }
    }
    if (changeLogs && changeLogs.length > 3) changeLogs = changeLogs.limit(3)
    guild.active = "home"
    res.render("manage.ejs", {
      bot: req.bot,
      user: req.user,
      guild: guild,
      changeLogs: changeLogs,
      guilds: getGuilds()
    });
  });
  router.post("/:id/manage/general", checkAuth, async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    let id = req.params.id;
    let guild = client.guilds.cache.get(id);
    if (!client.guilds.cache.get(id)) return res.redirect("/404")
    let manage = false
    let test = guild.members.cache.get(req.user.id);
    if (!test) test = ""
    if (test && test.permissions.has("MANAGE_GUILD")) manage = true


    if (db.fetch(`prefix_${id}`) === req.body.prefix) {

    } else {
      let object = {
        user: req.user.id,
        type: "prefix",
        change: req.body.prefix,
        time: Date.now()
      };

      db.fetch(`generalLogs1_${id}`);
      db.push(`generalLogs1_${id}`, object);
    }
    if (guild.members.cache.get(client.config.bot.id).displayName === req.body.nickname) {

    } else {
      let object = {
        user: req.user.id,
        type: "nickname",
        change: `${guild.members.cache.get(client.config.bot.id).displayName} --> ${req.body.nickname}`,
        time: Date.now()
      };

      db.fetch(`generalLogs1_${id}`);
      db.push(`generalLogs1_${id}`, object);
    }
    db.set(`prefix_${id}`, req.body.prefix);

    let prefix = db.fetch(`prefix_${id}`);
    if (!prefix) prefix = client.config.prefix;
    if (
      guild.members.cache
      .get(client.config.bot.id)
      .hasPermission("MANAGE_NICKNAMES")
    ) {
      guild.members.cache
        .get(client.config.bot.id)
        .setNickname(req.body.nickname);
    }
    guild.prefix = prefix;
    guild.nickname = guild.members.cache.get(client.config.bot.id).displayName;

    let changeLogs = db.fetch(`generalLogs1_${id}`);

    if (changeLogs) {
      changeLogs = changeLogs.sort(function(a, b) {
        return b.time - a.time
      })
   for (let i = 0; i < changeLogs.length; i++) {
        changeLogs[i].user = changeLogs[i].user
        changeLogs[i].time = timeSince(changeLogs[i].time)
      }
    }
    if (changeLogs && changeLogs.length > 3) changeLogs = changeLogs.limit(3)
    guild.active = "general"
    res.render("general.ejs", {
      bot: req.bot,
      user: req.user,
      guild: guild,
      changeLogs: changeLogs,
      guilds: getGuilds()
    });
  });
  router.get("/:id/manage/tags", checkAuth, async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    let id = req.params.id;
    let guild = client.guilds.cache.get(id);
    if (!client.guilds.cache.get(id)) return res.redirect("/404")
    let manage = false
    let test = guild.members.cache.get(req.user.id);
    if (!test) test = ""
    if (test && test.permissions.has("MANAGE_GUILD")) manage = true


    let commandsc = db.all().filter(data => data.ID.startsWith(`customcommand3_${id}`)).sort((a, b) => b.data - a.data);

    let prefix = db.fetch(`prefix_${id}`);
    if (!prefix) prefix = client.config.prefix;
    guild.active = "tags"
    guild.prefix = prefix

    res.render("customcommands.ejs", {
      bot: req.bot,
      user: req.user,
      guild: guild,
      customc: commandsc
    });
  });
  router.post("/:id/manage/commands", checkAuth, async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    let id = req.params.id;
    let guild = client.guilds.cache.get(id);
    if (!client.guilds.cache.get(id)) return res.redirect("/404")

    let manage = false
    let test = guild.members.cache.get(req.user.id);
    if (!test) test = ""
    if (test && test.permissions.has("MANAGE_GUILD")) manage = true




    let prefix = db.fetch(`prefix_${id}`);
    if (!prefix) prefix = client.config.prefix;
    guild.active = "commands"
    client.commands.forEach(command => {
      let thing = req.body[command.name]
      if (!thing) thing = true
      if (thing === "t") thing = false
      if (thing === "f") thing = true
      let change;
      if (thing === false) change = `Command ${command.name} has been enabled`
      else change = `Command ${command.name} has been disabled`
      let object2 = {
        user: req.user.id,
        type: "toggle",
        change: change,
        time: Date.now()
      };
      db.fetch(`generalLogs1_${id}`);

      db.push(`generalLogs1_${id}`, object2);

      db.set(`disabled_${id}_${command.name}`, thing)



    })
    let commands = [];
    client.commands.forEach(command => {
      let checked = db.fetch(`disabled_${id}_${command.name}`)
      if (!checked) checked = false;

      let object = {
        name: command.name,
        desc: command.description,
        aliases: command.aliases,
        checked: checked
      };
      commands.push(object);
    });
    res.render("toggles.ejs", {
      bot: req.bot,
      user: req.user,
      guild: guild,
      commands: commands
    });
  });
  router.get("/:id/manage/commands", checkAuth, async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    let id = req.params.id;
    let guild = client.guilds.cache.get(id);
    if (!client.guilds.cache.get(id)) return res.redirect("/404")
    let manage = false
    let test = guild.members.cache.get(req.user.id);
    if (!test) test = ""
    if (test && test.permissions.has("MANAGE_GUILD")) manage = true


    let prefix = db.fetch(`prefix_${id}`);
    if (!prefix) prefix = client.config.prefix;
    guild.active = "commands"

    let commands = [];
    client.commands.forEach(command => {
      let checked = db.fetch(`disabled_${id}_${command.name}`)
      if (!checked) checked = false;

      let object = {
        name: command.name,
        desc: command.description,
        aliases: command.aliases,
        checked: checked
      };
      commands.push(object);
    });
    res.render("toggles.ejs", {
      bot: req.bot,
      user: req.user,
      guild: guild,
      commands: commands
    });
  });
  router.post("/:id/manage/tags", checkAuth, async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    let id = req.params.id;
    let guild = client.guilds.cache.get(id);
    if (!client.guilds.cache.get(id)) return res.redirect("/404")
    let manage = false
    let test = guild.members.cache.get(req.user.id);
    if (!test) test = ""
    if (test && test.permissions.has("MANAGE_GUILD")) manage = true

    let name = req.body.tagname
    if (name) name = name.replace(/ /g, '-')
    let delet = req.body.delete ? true : false
   
       let nsfw = req.body.nsfw ? true : false
    
 let args = req.body.args ? req.body.args : ""
 let mentions = req.body.mention ? req.body.mention : ""
    
      let object = {
        name: name,
        content: req.body.tagcontent,
        delete: delet,
        args: args,
          nsfw: nsfw,
          mentions: mentions

      }
   

    let object2
    if (db.fetch(`customcommand3_${id}_${name}`)) {
      object2 = {
        user: req.user.id,
        type: "tag edit",
        change: `Named ${name}`,
        time: Date.now()
      };
    } else {
      object2 = {
        user: req.user.id,
        type: "tag creation",
        change: `Named ${name}`,
        time: Date.now()
      }
    }

    db.fetch(`generalLogs1_${id}`);
    db.push(`generalLogs1_${id}`, object2);
    db.set(`customcommand3_${id}_${name}`, object)


    let commandsc = db.all().filter(data => data.ID.startsWith(`customcommand3_${id}`)).sort((a, b) => b.data - a.data);


    let prefix = db.fetch(`prefix_${id}`);
    if (!prefix) prefix = client.config.prefix;
    guild.active = "tags"
    guild.prefix = prefix

    res.render("customcommands.ejs", {
      bot: req.bot,
      user: req.user,
      guild: guild,
      customc: commandsc
    });
  });
  router.post("/:id/manage/tags/:tag/delete", checkAuth, async (req, res) => {
    function getGuilds() {
      let array = [];
      req.user.guilds.forEach(guild => {
        const permsOnGuild = new Discord.Permissions(guild.permissions);
        if (!permsOnGuild.has("MANAGE_GUILD")) return;
        if (!client.guilds.cache.has(guild.id)) return;
        array.push(guild);
      });
      return array;
    }
    let id = req.params.id;
    let guild = client.guilds.cache.get(id);
    if (!client.guilds.cache.get(id)) return res.redirect("/404")
    let manage = false
    let test = guild.members.cache.get(req.user.id);
    if (!test) test = ""
    if (test && test.permissions.has("MANAGE_GUILD")) manage = true

    let name = req.params.tag

    let object2 = {
      user: req.user.id,
      type: "tag deletion",
      change: `Named ${name}`,
      time: Date.now()
    };

    db.fetch(`generalLogs1_${id}`);
    db.push(`generalLogs1_${id}`, object2);
    if (!db.fetch(`customcommand3_${id}_${name}`)) return res.redirect("/404")
    db.delete(`customcommand3_${id}_${name}`)
    let commandsc = db.all().filter(data => data.ID.startsWith(`customcommand3_${id}`)).sort((a, b) => b.data - a.data);

    let prefix = db.fetch(`prefix_${id}`);
    if (!prefix) prefix = client.config.prefix;
    guild.active = "tags"
    guild.prefix = prefix

    res.redirect("/dash");
  });
  return router;
};
