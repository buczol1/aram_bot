import { SlashCommandBuilder } from 'discord.js';
import { db } from '../connection';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
let apiKey: string;
dotenv.config({path: '../.env'});

if(process.env.API_KEY){
	apiKey = process.env.API_KEY;	
}
else{
	throw new Error("API_KEY environment variable is not set");
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Zarejestruj przywoływacza')
		.addStringOption(option =>
			option.setName('summoner')
				.setDescription('Nazwa przywoływacza')
				.setRequired(true)),
	async execute(interaction: any) {
		let sumName: string = interaction.options.getString('summoner');
		let sql = 'SELECT summoner_name FROM users WHERE summoner_name LIKE "' + sumName + '";';
		let query = db.query(sql, async (err, result) => {
			if((result[0] && sumName !== result[0].summoner_name) || !result[0]){
			const getSummonerByName: string = encodeURI('https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+sumName+'?api_key='+apiKey);
				const fetch_repsonse = await fetch(getSummonerByName);
				const body = await fetch_repsonse.json();
				if(fetch_repsonse.status === 200){
					let summBody = {summoner_name: body.name, summoner_id: body.id, puuid: body.puuid};
					let summsql = 'INSERT INTO users SET ?';
					let summquery = db.query(summsql, summBody, async (err, result) => {
						if(err) throw err;
						await interaction.reply('Zarejestrowano '+sumName);
					});
				}
				else{
					await interaction.reply('Błąd z rito api, wołaj buczola');
					throw new Error('Status code: '+fetch_repsonse.status);
				}
			}
			else{
				await interaction.reply('Przywoływacz jest już zarejestrowany');
			}
		});
	},
};