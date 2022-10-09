import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mysql from 'mysql';
import fs from 'node:fs';
import path from 'node:path';
import { db } from './connection';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
let port: number, apiKey: string, discordToken: string;
var alreadyInDatabase: boolean = false;

dotenv.config();

if(process.env.PORT){
	port = parseInt(process.env.PORT);	
}
else{
	throw new Error("PORT environment variable is not set");
}

if(process.env.API_KEY){
	apiKey = process.env.API_KEY;	
}
else{
	throw new Error("API_KEY environment variable is not set");
}



if(process.env.DISCORD_TOKEN){
	discordToken = process.env.DISCORD_TOKEN;
}
else{
	throw new Error("DISCORD_TOKEN environment variable is not set");
}
//create client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds]});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


client.once('ready', () => {
	console.log('Bot ready');
});

client.on('interactionCreate', async (interaction: any) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(discordToken);


const app: Express = express();

