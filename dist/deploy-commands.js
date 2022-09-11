"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const rest_1 = require("@discordjs/rest");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
let token, clientId, guildId;
dotenv_1.default.config();
if (process.env.DISCORD_TOKEN) {
    token = process.env.DISCORD_TOKEN;
}
else {
    throw new Error("DISCORD_TOKEN environment variable is not set");
}
if (process.env.CLIENT_ID) {
    clientId = process.env.CLIENT_ID;
}
else {
    throw new Error("CLIENT_ID environment variable is not set");
}
if (process.env.GUILD_ID) {
    guildId = process.env.GUILD_ID;
}
else {
    throw new Error("GUILD_ID environment variable is not set");
}
const commands = [];
const commandsPath = node_path_1.default.join(__dirname, 'commands');
const commandFiles = node_fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = node_path_1.default.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}
const rest = new rest_1.REST({ version: '10' }).setToken(token);
rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);
