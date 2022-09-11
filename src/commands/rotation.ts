//DZIAŁA

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
		.setName('rotation')
		.setDescription('Pokaż aktualną rotacje'),
	async execute(interaction: any) {
		const getRotationList: string = encodeURI('https://eun1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key='+apiKey);
		const fetchRotation = await fetch (getRotationList);
		const bodyRotation = await fetchRotation.json();
		if(fetchRotation.status !== 200){ 
			await interaction.reply('Error, zobacz konsole');
			throw new Error("Status code: " + fetchRotation.status);
			return 0;
		}
		else{
			let answer:string = 'Bohaterowie w rotacji to: ';
			for(let i = 0; i < bodyRotation.freeChampionIds.length; i++){
				let sql = 'SELECT * FROM champions WHERE champ_key LIKE '+bodyRotation.freeChampionIds[i]+';';
				let query = db.query(sql, async (err, result)=>{
					if(err) throw err;
					if(i !== bodyRotation.freeChampionIds.length - 1){
						answer += result[0].champ_name+', ';						
					}
					else{
						answer += result[0].champ_name;
						await interaction.reply(answer);
					}
				});
			}
		}
	},
};