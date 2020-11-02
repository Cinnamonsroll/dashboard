const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const express = require("express");
const passport = require("passport");
const { Strategy } = require("passport-discord").Strategy;
const _ = require("lodash");
const axios = require("axios");

module.exports = client =>
  new Promise(resolve => {
    const server = client.server,
      app = client.express;

    app.use(require("helmet")());
    app.disable("x-powered-by");
    var bodyParser = require("body-parser");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "pages"));
    app.use("/static", express.static(path.join(__dirname, "css")));
    app.use("/assets", express.static(path.join(__dirname, "assets")));

    /* Authentication */
    bindAuth(app, client);
    app.get("/404", async (req, res) => {
      res.redirect("/");
    });
    app.get("/add", async (req,res) => {
        res.redirect("https://discord.com/api/oauth2/authorize?client_id=750510054129532928&permissions=8&redirect_uri=https%3A%2F%2Fdashboard.sve.one%2Fauth%2Fcallback&scope=bot")
})
    const dashRoutes = require("./routers/dashboard")(client);
    app.use("/dash", dashRoutes);

    app.get("/", async (req, res) => {
      res.render("index.ejs", { bot: req.bot, user: req.user || null });
    });
    app.get("/commands", async (req, res) => {
      let commands = [];
      client.commands.forEach(command => {
        let object = {
          name: command.name,
          desc: command.description,
          aliases: command.aliases
        };
        commands.push(object);
      });

      res.render("commands.ejs", {
        bot: req.bot,
        user: req.user || null,
        commands: commands
      });
    });
    server.listen(client.config.port);
    resolve();
  });

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports.checkAuth = checkAuth;

function bindAuth(app, client) {
  app.use(
    session({
      store: new SQLiteStore(),
      secret: "idekanymore",
      resave: false,
      saveUninitialized: false
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(
    new Strategy(
      {
        clientID: client.config.bot.id,
        clientSecret: client.config.bot.secret,
        callbackURL: client.config.bot.redirect,
        scope: client.config.bot.scopes
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
          profile.tokens = { accessToken };
          return done(null, profile);
        });
      }
    )
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/login", (req, res) => {
    res.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${
        client.config.bot.id
      }&redirect_uri=${encodeURIComponent(
        client.config.bot.redirect
      )}&response_type=code&scope=${encodeURIComponent(
        client.config.bot.scopes.join(" ")
      )}`
    );
  });

  app.get(
    "/auth/callback",
    passport.authenticate("discord", {
      failureRedirect: "/"
    }),
    (req, res) => res.redirect("/dash")
  );

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.use(async (req, res, next) => {
    req.bot = client;
    next();
  });
}
