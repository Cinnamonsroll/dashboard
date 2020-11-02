const Xeno = require("./dash");

const client = new Xeno({
  disableMentions: "everyone"
});

client.load().then(() => client.connect());
