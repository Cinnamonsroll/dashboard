module.exports = async (client) => {
    client.user.setPresence({ activity: { name: "with my new dashboard", type: "playing" }, status: 'DND' });
    client.logger.log(`Logged in as ${client.user.tag}`);
}