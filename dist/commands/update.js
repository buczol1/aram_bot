"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const connection_1 = require("../connection");
const dotenv_1 = __importDefault(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
let apiKey;
dotenv_1.default.config({ path: '../.env' });
/*
*
*
*	Returny nie działają i jest tylko jedna odpowiedź, NAPRAW
*
*/
if (process.env.API_KEY) {
    apiKey = process.env.API_KEY;
}
else {
    throw new Error("API_KEY environment variable is not set");
}
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('update')
        .setDescription('updatuje gry')
        .addIntegerOption(option => option.setName('input')
        .setDescription('Od której gry zacząć')
        .setRequired(true))
        .addStringOption(option => option.setName('nazwa')
        .setDescription('Nazwa przywoływacza')
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            function updateSumm() {
                return __awaiter(this, void 0, void 0, function* () {
                    let start = interaction.options.getInteger('input');
                    let name = interaction.options.getString('nazwa');
                    //sql na puuid po nazwie here
                    const puuid = 'C0-LIp-9TePA4qQBN7S6sIyn7lknQpYWkiJlKoLpafP_CQCZHqPrjivNoGtBgWjqVK4INtCXq3uySA';
                    const getMatchHistory = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids?queue=450&start=' + start + '&count=15&api_key=' + apiKey);
                    const fetchResHistory = yield (0, node_fetch_1.default)(getMatchHistory);
                    const bodyHistory = yield fetchResHistory.json();
                    if (fetchResHistory.status === 200) {
                        for (let i = 0; i < bodyHistory.length; i++) {
                            const matchID = bodyHistory[i];
                            const checkSql = 'SELECT riot_match_id FROM general_match_info WHERE riot_match_id LIKE "' + matchID + '";';
                            let checkQuery = connection_1.db.query(checkSql, (err, results) => __awaiter(this, void 0, void 0, function* () {
                                if ((results[0] && matchID !== results[0].riot_match_id) || !results[0]) {
                                    const getMatchInfo = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/' + matchID + '/?api_key=' + apiKey);
                                    console.log('zapytanie nr ' + i);
                                    const fetchMatchInfo = yield (0, node_fetch_1.default)(getMatchInfo);
                                    const bodyMatchInfo = yield fetchMatchInfo.json();
                                    if (fetchMatchInfo.status === 200) {
                                        let match = { riot_match_id: bodyMatchInfo.metadata.matchId, match_duration: bodyMatchInfo.info.gameDuration, team_won: bodyMatchInfo.info.teams[0].win ? 1 : 2 };
                                        let sql = 'INSERT INTO general_match_info SET ?';
                                        let query = connection_1.db.query(sql, match, (err, result) => {
                                            if (err)
                                                throw err;
                                            const findMatchSql = 'SELECT match_main_id FROM general_match_info WHERE riot_match_id LIKE "' + matchID + '";';
                                            let findMatchQuery = connection_1.db.query(findMatchSql, (err, results) => {
                                                let match_id = results[0].match_main_id;
                                                let participants = bodyMatchInfo.info.participants;
                                                for (let i = 0; i < participants.length; i++) {
                                                    let kda = (participants[i].kills + participants[i].assists) / participants[i].deaths;
                                                    let participant = { riot_puuid: participants[i].puuid, summoner_name: participants[i].summonerName, champion_name: participants[i].championName, match_main_id: match_id, kills: participants[i].kills, deaths: participants[i].deaths, assists: participants[i].assists, kda: kda, win: participants[i].win };
                                                    let participantsSql = 'INSERT INTO participants SET ?';
                                                    let participantsQuery = connection_1.db.query(participantsSql, participant, () => {
                                                        if (err)
                                                            throw err;
                                                    });
                                                }
                                                return 'Pomyślnie zaktualizowano dane';
                                            });
                                        });
                                    }
                                    else {
                                        throw new Error('Status code:' + fetchMatchInfo.status);
                                        return 'Błąd przy pobieraniu danych meczu: ' + fetchMatchInfo.status;
                                    }
                                }
                            }));
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
                    else {
                        throw new Error("Status code:" + fetchResHistory.status);
                        return 'Błąd przy pobieraniu danych historii: ' + fetchResHistory.status;
                    }
                    return 'Nie wiem jak to się stanęło?';
                });
            }
            yield interaction.reply(yield updateSumm());
        });
    },
};
