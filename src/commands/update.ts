import { SlashCommandBuilder } from 'discord.js';
import { db } from '../connection';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
let apiKey: string;
dotenv.config({path: '../.env'});

/*
*
*
*	Returny nie działają i jest tylko jedna odpowiedź, NAPRAW
*
*/


if(process.env.API_KEY){
	apiKey = process.env.API_KEY;	
}
else{
	throw new Error("API_KEY environment variable is not set");
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('updatuje gry')
		.addIntegerOption(option =>
			option.setName('input')
				.setDescription('Od której gry zacząć')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('nazwa')
				.setDescription('Nazwa przywoływacza')
				.setRequired(true)),
	async execute(interaction: any) {
		async function updateSumm(){
			let start: number = interaction.options.getInteger('input');
			let name: string = interaction.options.getString('nazwa');
			//sql na puuid po nazwie here
			const puuid: string = /*body.puuid*/ 'C0-LIp-9TePA4qQBN7S6sIyn7lknQpYWkiJlKoLpafP_CQCZHqPrjivNoGtBgWjqVK4INtCXq3uySA';
			const getMatchHistory: string = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/'+puuid+'/ids?queue=450&start='+start+'&count=15&api_key='+apiKey);
			const fetchResHistory = await fetch(getMatchHistory);
			const bodyHistory = await fetchResHistory.json();
			if(fetchResHistory.status === 200){
				for(let i = 0; i < bodyHistory.length; i++){
					const matchID = bodyHistory[i];
					const checkSql: string = 'SELECT riot_match_id FROM general_match_info WHERE riot_match_id LIKE "'+matchID+'";';
					let checkQuery = db.query(checkSql, async (err, results) => {
						if((results[0] && matchID !== results[0].riot_match_id) || !results[0]){
							const getMatchInfo = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/'+matchID+'/?api_key='+apiKey);
							console.log('zapytanie nr '+i);
							const fetchMatchInfo = await fetch(getMatchInfo);
							const bodyMatchInfo = await fetchMatchInfo.json();
							if(fetchMatchInfo.status === 200){
								let match = {riot_match_id:bodyMatchInfo.metadata.matchId,match_duration:bodyMatchInfo.info.gameDuration,team_won:bodyMatchInfo.info.teams[0].win ? 1 : 2}
								let sql = 'INSERT INTO general_match_info SET ?';
								let query = db.query(sql, match, (err, result) => {
									if(err) throw err;
									const findMatchSql = 'SELECT match_main_id FROM general_match_info WHERE riot_match_id LIKE "'+matchID+'";';
									let findMatchQuery = db.query(findMatchSql, (err, results) => {
										let match_id = results[0].match_main_id;
										let participants = bodyMatchInfo.info.participants;
										for(let i=0;i<participants.length;i++){
											let kda: number = (participants[i].kills + participants[i]. assists) / participants[i].deaths;
											let participant = {riot_puuid:participants[i].puuid,summoner_name:participants[i].summonerName,champion_name:participants[i].championName, match_main_id:match_id,kills:participants[i].kills,deaths:participants[i].deaths,assists:participants[i].assists,kda: kda, win: participants[i].win};
											let participantsSql = 'INSERT INTO participants SET ?';
											let participantsQuery = db.query(participantsSql, participant, () => {
												if(err) throw err;
											});
										}
										return 'Pomyślnie zaktualizowano dane';
									});								
								});
							}
							else{
								throw new Error('Status code:' + fetchMatchInfo.status);
								return 'Błąd przy pobieraniu danych meczu: ' + fetchMatchInfo.status;
							}							
						}
					});
				}
	/*			//get last game info about your summoner
				let wins :boolean[] = [];
				for(let i = 0; i < bodyHistory.length; i++){
					const matchID = bodyHistory[i];
					const getMatchInfo = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/'+matchID+'/?api_key='+apiKey);
					const fetchMatchInfo = await fetch(getMatchInfo);
					const bodyMatchInfo = await fetchMatchInfo.json();
					if(fetchMatchInfo.status === 200){
						for(let i=0; i < bodyMatchInfo.info.participants.length; i++){
							if(bodyMatchInfo.info.participants[i].puuid == puuid){
								wins.push(bodyMatchInfo.info.participants[i].win);
							}
						}
					}
					else{
						throw new Error("Status code:"+fetchMatchInfo.status);
					}				
				}
				let sum :number = 0;
				for(let i=0; i < wins.length; i++){
					if(wins[i])
						sum++;
				}
				console.log(sum/wins.length);*/
			}
			else{
				throw new Error("Status code:"+fetchResHistory.status);
				return 'Błąd przy pobieraniu danych historii: ' + fetchResHistory.status;
			}
		return 'Nie wiem jak to się stanęło?';		
		}

		await interaction.reply( await updateSumm());
	},
};
