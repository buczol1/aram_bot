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
            const sql = 'SELECT puuid FROM users WHERE summoner_name IS "' + name + '";';
            let query = connection_1.db.query(sql, (err, results) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    yield interaction.reply('Przywoływacz nie jest zarejestrowany, użyj /register **nazwa przywoływacza**');
                    console.log(err);
                }
                else if (results[0].length !== 0) {
                    console.log(results);
                    //const getLastGameID: string = encodeURI('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/'+puuid+'/ids?queue=450&start='+start+'&count=15&api_key='+apiKey);
                }
            }));
        });
    },
};
