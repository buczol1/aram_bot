//Niech sprawdza czy ten przywoływacz jest w bazie

import { SlashCommandBuilder } from 'discord.js';
import { db } from '../connection';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wr')
		.setDescription('Pokazuje wr na aramach')
		.addStringOption(option =>
			option.setName('nazwa')
				.setDescription('Nazwa przywoływacza')
				.setRequired(true)),
	async execute(interaction: any) {
		let answer: string = '';
		var winRatio: number = 0;
		let wins: number = 0;
		const summonerName: string = interaction.options.getString('nazwa');
		const sql = "SELECT win FROM participants WHERE summoner_name LIKE '" + summonerName + "';";
		let query = db.query(sql, async (err,results) => {
			console.log(results);
			if(err){
				await interaction.reply('Przywoływacz nie jest zarejestrowany, użyj /register **nazwa przywoływacza**');
				console.log(err);
			}
			else if(results[0] !== []){
				for(let i = 0; i < results.length; i++) {
					if(results[i].win){
						wins++;
					}
				}
				winRatio = (wins/results.length)*100;
				answer = 'Winratio '+summonerName+' na Aramach z ostatnich '+results.length+' gier to: '+winRatio.toFixed(2)+'%';
				await interaction.reply(answer);				
			}
			else{
				await interaction.reply('Brak gier dla danego przywoływacza');
			}
		});
	},
};