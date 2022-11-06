
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
				let puuid: string = results[0].puuid;
				const getLastGameID: string = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/'+puuid+'/ids?queue=450&start=0&count=1&api_key='+apiKey);
				const fetchGameID = await fetch(getLastGameID);
				const bodyHistory = await fetchGameID.json();
				let answer: string = '';
				if(fetchGameID.status === 200){
					const matchID: string = bodyHistory[0];
					const getMatchInfo = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/'+matchID+'/?api_key='+apiKey);
					const fetchMatchInfo = await fetch(getMatchInfo);
					const bodyMatchInfo = await fetchMatchInfo.json();
					if(fetchMatchInfo.status === 200){
						let gameDuration: number = bodyMatchInfo.info.gameDuration;
						let minutes: number = 0, seconds: number = 0;
						while(gameDuration > 0){
							if(gameDuration > 59){
								minutes += 1;
								gameDuration -= 60;
							}
							else{
								seconds = gameDuration;
								gameDuration -= gameDuration;
							}
						}
						answer += 'Czas gry wynosi '+minutes+':'+ seconds+'\n';
						for(let i = 0; i < bodyMatchInfo.info.participants.length; i++){
							if(bodyMatchInfo.info.participants[i].puuid == puuid){

								answer += 'K/D/A \n';
								answer += bodyMatchInfo.info.participants[i].kills+'/'+bodyMatchInfo.info.participants[i].deaths+'/'+bodyMatchInfo.info.participants[i].assists+'\n';
								answer += 'Bohater: '+bodyMatchInfo.info.participants[i].championName+'\n';
								answer += 'Największy killing spree: '+bodyMatchInfo.info.participants[i].largestKillingSpree+'\n';
								if(bodyMatchInfo.info.participants[i].largestMultiKill == 5){
									answer += 'Była penta, kozacko mordo! \n';
								}
								answer += 'Ilość użyć spelli q/w/e/r/d/f\n';
								answer += bodyMatchInfo.info.participants[i].spell1Casts+'/'+bodyMatchInfo.info.participants[i].spell2Casts+'/'+bodyMatchInfo.info.participants[i].spell3Casts+'/'+bodyMatchInfo.info.participants[i].spell4Casts+'/'+bodyMatchInfo.info.participants[i].summoner1Casts+'/'+bodyMatchInfo.info.participants[i].summoner2Casts+'\n';
								answer += 'Czas, w którym CCkowałeś wrogów: '+bodyMatchInfo.info.participants[i].timeCCingOthers+' sekund \n';
								answer += 'DMG do championów: '+bodyMatchInfo.info.participants[i].totalDamageDealtToChampions+'\n';
								answer += 'Leczonko: '+bodyMatchInfo.info.participants[i].totalHeal+'\n';
								answer += 'Farma, farma: '+bodyMatchInfo.info.participants[i].totalMinionsKilled+'\n';
								let deadMinutes: number = 0, deadSeconds: number = 0;
								let deadTime: number = bodyMatchInfo.info.participants[i].totalTimeSpentDead;
								while(deadTime > 0){
									if(deadTime > 59){
										deadMinutes += 1;
										deadTime -= 60;
									}
									else{
										deadSeconds = deadTime;
										deadTime -= deadTime;
									}
								}
								answer += 'Byłeś martwy przez ';
								if(deadMinutes > 0 && deadSeconds == 0){
									if(deadMinutes == 1)
										answer += '1 minutę \n';
									else if(deadMinutes > 1 && deadMinutes < 5){
										answer += deadMinutes + ' minuty \n';
									}
									else{
										answer += deadMinutes + ' minut \n';
									}
								}
								else if( deadMinutes > 0 && deadSeconds > 0){
									if(deadMinutes == 1){
										answer += '1 minutę i ';
										if(deadSeconds == 1){
											answer += '1 sekundę \n';
										}
										else if(deadSeconds > 1 && deadSeconds < 5){
											answer += deadSeconds+' sekundy \n';
										}
										else{
											answer += deadSeconds+' sekund \n';
										}
									}
									else if(deadMinutes > 1 && deadMinutes < 5){
										answer += deadMinutes + ' minuty i ';
										if(deadSeconds == 1){
											answer += '1 sekundę \n';
										}
										else if(deadSeconds > 1 && deadSeconds < 5){
											answer += deadSeconds+' sekundy \n';
										}
										else{
											answer += deadSeconds+' sekund \n';
										}
									}
									else{
										answer += deadMinutes + ' minut i ';
										if(deadSeconds == 1){
											answer += '1 sekundę \n';
										}
										else if(deadSeconds > 1 && deadSeconds < 5){
											answer += deadSeconds+' sekundy \n';
										}
										else{
											answer += deadSeconds+' sekund \n';
										}
									}
								}
								if(bodyMatchInfo.info.participants[i].win){
									answer += 'Wygrałeś, gj.';
								}
								else{
									answer += 'Zjebałeś spok, zjebałeś kurwa';
								}
								await interaction.reply(answer);
							}
							continue;
						}
					}
				}
				else{
					await interaction.reply('Wołaj buczol, bot się wyjebał');
					throw new Error("Status code:"+fetchGameID.status);
					return 'Błąd przy pobieraniu danych historii: ' + fetchGameID.status;
				}
			}
		});
	},
};