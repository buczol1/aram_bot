"use strict";
//Niech sprawdza czy ten przywoływacz jest w bazie
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const connection_1 = require("../connection");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('wr')
        .setDescription('Pokazuje wr na aramach')
        .addStringOption(option => option.setName('nazwa')
        .setDescription('Nazwa przywoływacza')
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = '';
            var winRatio = 0;
            let wins = 0;
            const summonerName = interaction.options.getString('nazwa');
            const sql = "SELECT win FROM participants WHERE summoner_name LIKE '" + summonerName + "';";
            let query = connection_1.db.query(sql, (err, results) => __awaiter(this, void 0, void 0, function* () {
                console.log(results);
                if (err) {
                    yield interaction.reply('Przywoływacz nie jest zarejestrowany, użyj /register **nazwa przywoływacza**');
                    console.log(err);
                }
                else if (results[0].length !== 0) {
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].win) {
                            wins++;
                        }
                    }
                    winRatio = (wins / results.length) * 100;
                    answer = 'Winratio ' + summonerName + ' na Aramach z ostatnich ' + results.length + ' gier to: ' + winRatio.toFixed(2) + '%';
                    yield interaction.reply(answer);
                }
                else {
                    yield interaction.reply('Brak gier dla danego przywoływacza');
                }
            }));
        });
    },
};
