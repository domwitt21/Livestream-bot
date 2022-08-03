const Discord = require("discord.js");
const client = new Discord.Client({intents: ["Guilds", "GuildMessages", "MessageContent", "GuildEmojisAndStickers", "GuildMessageReactions", "GuildMembers", "GuildBans", "DirectMessages", "DirectMessageReactions", "GuildIntegrations", "GuildScheduledEvents", "GuildPresences", "GuildWebhooks", "GuildVoiceStates"]});
const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ThreadManager, ThreadMember, ThreadChannel, ThreadMemberManager, WebhookClient, Webhook, ChannelType, Embed, ButtonBuilder, MessageActivityType, TextInputAssertions, time } = require("discord.js");
const config = require("./auth.json");
const mongoose = require("mongoose");
const userModel = require("./Schemas/liveSchema");
const TimeAgo = require("javascript-time-ago");
const en = require("javascript-time-ago/locale/en");
const { verifyString } = require("discord.js");

client.on("unhandledRejection", error => {
    console.error("Unhandled promise rejections", error);
});
client.on("shardError", error => {
    console.error("A websocket connection has encountered an error", error);
});
mongoose.connect(config.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((m) => {
    console.log("Connected to database");
}).catch((err) => console.log(err));
client.on("ready", () => {
    console.log("Livestream bot is ready!");
});

client.login(config.token);

TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo('en-US');

client.on("voiceStateUpdate", async (oldState, newState) => {
    if(!oldState.streaming) {
        if(!newState.streaming) return;
        if(newState.streaming) {
            // replys if the user is streaming
            let testDate = new Date();
            const userDb = await userModel.findOne({ discordId: newState.member.user.id });
            if(userDb !== null) {
                //add code for user who exist in db
                const deleteDb = await userModel.findOneAndRemove({ discordId: newState.member.user.id }).then(async function createNew() {
                    const newRole = client.guilds.cache.find(g => g.id === "211441386673799178").roles.cache.find(r => r.id === "939989750222311504");
                    newState.member.roles.add(newRole);
                    const newStream = await userModel.create({
                        username: newState.member.user.username,
                        discordId: newState.member.user.id,
                        startLive: testDate.toLocaleDateString() + " " + testDate.toLocaleTimeString(),
                        endLive: undefined,
                        status: "Active"
                    });
                    return;
                });
                return;
            } else if(userDb == null) {
                //add code for if user isnt in the db
                const newRole = client.guilds.cache.find(g => g.id === "211441386673799178").roles.cache.find(r => r.id === "939989750222311504");
                newState.member.roles.add(newRole);
                const newStream = await userModel.create({
                    username: newState.member.user.username,
                    discordId: newState.member.user.id,
                    startLive: testDate.toLocaleDateString() + " " + testDate.toLocaleTimeString(),
                    endLive: undefined,
                    status: "Active"
                });
            }
            newState.guild.channels.cache.find(c => c.id === "939977894812352563").send("<@&939976983729803304> " + newState.member.user.username + " just went live!");
            return;
        };
    } else if(oldState.streaming) {
        // replys when the user has stopped streaming
        const newRole = client.guilds.cache.find(g => g.id === "211441386673799178").roles.cache.find(r => r.id === "939989750222311504");
        newState.member.roles.remove(newRole);
        let newDate = new Date();
        const updateStatusOne = await userModel.findOneAndUpdate({ discordId: newState.member.user.id }, { $set: { endLive: newDate.toLocaleDateString() + " " + newDate.toLocaleTimeString() } });
        const updateStatusTwo = await userModel.findOneAndUpdate({ discordId: newState.member.user.id }, { $unset: { status: "Active" } });
        const updateStatusThree = await userModel.findOneAndUpdate({ discordId: newState.member.user.id }, { $set: { status: "Inactive" } });
        const userUpdate = await userModel.findOne({ discordId: newState.member.user.id });
        const testEmbed = new EmbedBuilder()
            .setTitle(newState.member.user.username + " was just live!")
            .addFields([
                {name: "Start", value: `${userUpdate.startLive}`},
                {name: "Stop", value: `${userUpdate.endLive}`},
            ])
        newState.guild.channels.cache.find(c => c.id === "939977894812352563").send({embeds: [testEmbed]});
        return;
    } else {
        return;
    };
});