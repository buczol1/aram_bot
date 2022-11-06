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
if (process.env.API_KEY) {
    apiKey = process.env.API_KEY;
}
else {
    throw new Error("API_KEY environment variable is not set");
}
var answer = '';
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('lastgame')
        .setDescription('Statystyki z ostatniej gry Aram.')
        .addStringOption(option => option.setName('nazwa')
        .setDescription('Nazwa przywoływacza')
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let name = interaction.options.getString('nazwa');
            const sql = 'SELECT puuid FROM users WHERE summoner_name LIKE "' + name + '";';
            let query = connection_1.db.query(sql, (err, results) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    yield interaction.reply('Przywoływacz nie jest zarejestrowany, użyj /register **nazwa przywoływacza**');
                    console.log(err);
                }
                else if (results[0].length !== 0) {
                    let puuid = results[0].puuid;
                    const getLastGameID = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids?queue=450&start=0&count=1&api_key=' + apiKey);
                    const fetchGameID = yield (0, node_fetch_1.default)(getLastGameID);
                    const bodyHistory = yield fetchGameID.json();
                    let answer = '';
                    if (fetchGameID.status === 200) {
                        const matchID = bodyHistory[0];
                        const getMatchInfo = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/' + matchID + '/?api_key=' + apiKey);
                        const fetchMatchInfo = yield (0, node_fetch_1.default)(getMatchInfo);
                        const bodyMatchInfo = yield fetchMatchInfo.json();
                        if (fetchMatchInfo.status === 200) {
                            let gameDuration = bodyMatchInfo.info.gameDuration;
                            let minutes = 0, seconds = 0;
                            while (gameDuration > 0) {
                                if (gameDuration > 59) {
                                    minutes += 1;
                                    gameDuration -= 60;
                                }
                                else {
                                    seconds = gameDuration;
                                    gameDuration -= gameDuration;
                                }
                            }
                            answer += 'Czas gry wynosi ' + minutes + ':' + seconds + '\n';
                            for (let i = 0; i < bodyMatchInfo.info.participants.length; i++) {
                                if (bodyMatchInfo.info.participants[i].puuid == puuid) {
                                    answer += 'K/D/A \n';
                                    answer += bodyMatchInfo.info.participants[i].kills + '/' + bodyMatchInfo.info.participants[i].deaths + '/' + bodyMatchInfo.info.participants[i].assists + '\n';
                                    answer += 'Bohater: ' + bodyMatchInfo.info.participants[i].championName + '\n';
                                    answer += 'Największy killing spree: ' + bodyMatchInfo.info.participants[i].largestKillingSpree + '\n';
                                    if (bodyMatchInfo.info.participants[i].largestMultiKill == 5) {
                                        answer += 'Była penta, kozacko mordo! \n';
                                    }
                                    answer += 'Ilość użyć spelli q/w/e/r/d/f\n';
                                    answer += bodyMatchInfo.info.participants[i].spell1Casts + '/' + bodyMatchInfo.info.participants[i].spell2Casts + '/' + bodyMatchInfo.info.participants[i].spell3Casts + '/' + bodyMatchInfo.info.participants[i].spell4Casts + '/' + bodyMatchInfo.info.participants[i].summoner1Casts + '/' + bodyMatchInfo.info.participants[i].summoner2Casts + '\n';
                                    answer += 'Czas, w którym CCkowałeś wrogów: ' + bodyMatchInfo.info.participants[i].timeCCingOthers + ' sekund \n';
                                    answer += 'DMG do championów: ' + bodyMatchInfo.info.participants[i].totalDamageDealtToChampions + '\n';
                                    answer += 'Leczonko: ' + bodyMatchInfo.info.participants[i].totalHeal + '\n';
                                    answer += 'Farma, farma: ' + bodyMatchInfo.info.participants[i].totalMinionsKilled + '\n';
                                    let deadMinutes = 0, deadSeconds = 0;
                                    let deadTime = bodyMatchInfo.info.participants[i].totalTimeSpentDead;
                                    while (deadTime > 0) {
                                        if (deadTime > 59) {
                                            deadMinutes += 1;
                                            deadTime -= 60;
                                        }
                                        else {
                                            deadSeconds = deadTime;
                                            deadTime -= deadTime;
                                        }
                                    }
                                    answer += 'Byłeś martwy przez ';
                                    if (deadMinutes > 0 && deadSeconds == 0) {
                                        if (deadMinutes == 1)
                                            answer += '1 minutę \n';
                                        else if (deadMinutes > 1 && deadMinutes < 5) {
                                            answer += deadMinutes + ' minuty \n';
                                        }
                                        else {
                                            answer += deadMinutes + ' minut \n';
                                        }
                                    }
                                    else if (deadMinutes > 0 && deadSeconds > 0) {
                                        if (deadMinutes == 1) {
                                            answer += '1 minutę i ';
                                            if (deadSeconds == 1) {
                                                answer += '1 sekundę \n';
                                            }
                                            else if (deadSeconds > 1 && deadSeconds < 5) {
                                                answer += deadSeconds + ' sekundy \n';
                                            }
                                            else {
                                                answer += deadSeconds + ' sekund \n';
                                            }
                                        }
                                        else if (deadMinutes > 1 && deadMinutes < 5) {
                                            answer += deadMinutes + ' minuty i ';
                                            if (deadSeconds == 1) {
                                                answer += '1 sekundę \n';
                                            }
                                            else if (deadSeconds > 1 && deadSeconds < 5) {
                                                answer += deadSeconds + ' sekundy \n';
                                            }
                                            else {
                                                answer += deadSeconds + ' sekund \n';
                                            }
                                        }
                                        else {
                                            answer += deadMinutes + ' minut i ';
                                            if (deadSeconds == 1) {
                                                answer += '1 sekundę \n';
                                            }
                                            else if (deadSeconds > 1 && deadSeconds < 5) {
                                                answer += deadSeconds + ' sekundy \n';
                                            }
                                            else {
                                                answer += deadSeconds + ' sekund \n';
                                            }
                                        }
                                    }
                                    if (bodyMatchInfo.info.participants[i].win) {
                                        answer += 'Wygrałeś, gj.';
                                    }
                                    else {
                                        answer += 'Zjebałeś spok, zjebałeś kurwa';
                                    }
                                    yield interaction.reply(answer);
                                }
                                continue;
                            }
                        }
                    }
                    else {
                        yield interaction.reply('Wołaj buczol, bot się wyjebał');
                        throw new Error("Status code:" + fetchGameID.status);
                        return 'Błąd przy pobieraniu danych historii: ' + fetchGameID.status;
                    }
                }
            }));
        });
    },
};
