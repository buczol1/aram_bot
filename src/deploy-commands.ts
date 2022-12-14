import { SlashCommandBuilder, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { REST } from '@discordjs/rest';
import fs from 'node:fs';
import path from 'node:path'
let token: string, clientId: string, guildId: string;

dotenv.config();

if(process.env.DISCORD_TOKEN){
 	token = process.env.DISCORD_TOKEN;	
}
else{
	throw new Error("DISCORD_TOKEN environment variable is not set");
}

if(process.env.CLIENT_ID){
	clientId = process.env.CLIENT_ID;	
}
else{
	throw new Error("CLIENT_ID environment variable is not set");
}

if(process.env.GUILD_ID){
	guildId = process.env.GUILD_ID;	
}
else{
	throw new Error("GUILD_ID environment variable is not set");
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data: any) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);

