
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

var answer:string = '';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lastgame')
		.setDescription('Statystyki z ostatniej gry Aram.')
		.addStringOption(option =>
			option.setName('nazwa')
				.setDescription('Nazwa przywoływacza')
				.setRequired(true)),
	async execute(interaction: any) {
		let name: string = interaction.options.getString('nazwa');
		const sql = 'SELECT puuid FROM users WHERE summoner_name LIKE "'+name+'";';
		let query = db.query(sql, async (err, results) => {
			if(err){
				await interaction.reply('Przywoływacz nie jest zarejestrowany, użyj /register **nazwa przywoływacza**');
				console.log(err);
			}
			else if(results[0].length !== 0){
				console.log(results);
				//const getLastGameID: string = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/'+puuid+'/ids?queue=450&start='+start+'&count=15&api_key='+apiKey);
			}
		});
	},
};