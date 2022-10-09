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
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('register')
        .setDescription('Zarejestruj przywoływacza')
        .addStringOption(option => option.setName('summoner')
        .setDescription('Nazwa przywoływacza')
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let sumName = interaction.options.getString('summoner');
            let sql = 'SELECT summoner_name FROM users WHERE summoner_name LIKE "' + sumName + '";';
            let query = connection_1.db.query(sql, (err, result) => __awaiter(this, void 0, void 0, function* () {
                if ((result[0] && sumName !== result[0].summoner_name) || !result[0]) {
                    const getSummonerByName = encodeURI('https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + sumName + '?api_key=' + apiKey);
                    const fetch_repsonse = yield (0, node_fetch_1.default)(getSummonerByName);
                    const body = yield fetch_repsonse.json();
                    if (fetch_repsonse.status === 200) {
                        let summBody = { summoner_name: body.name, summoner_id: body.id, puuid: body.puuid };
                        let summsql = 'INSERT INTO users SET ?';
                        let summquery = connection_1.db.query(summsql, summBody, (err, result) => __awaiter(this, void 0, void 0, function* () {
                            if (err)
                                throw err;
                            yield interaction.reply('Zarejestrowano ' + sumName);
                        }));
                    }
                    else {
                        yield interaction.reply('Błąd z rito api, wołaj buczola');
                        throw new Error('Status code: ' + fetch_repsonse.status);
                    }
                }
                else {
                    yield interaction.reply('Przywoływacz jest już zarejestrowany');
                }
            }));
        });
    },
};
