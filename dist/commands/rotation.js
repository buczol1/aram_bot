"use strict";
//DZIAŁA
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
        .setName('rotation')
        .setDescription('Pokaż aktualną rotacje'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const getRotationList = encodeURI('https://eun1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=' + apiKey);
            const fetchRotation = yield (0, node_fetch_1.default)(getRotationList);
            const bodyRotation = yield fetchRotation.json();
            if (fetchRotation.status !== 200) {
                yield interaction.reply('Error, zobacz konsole');
                throw new Error("Status code: " + fetchRotation.status);
                return 0;
            }
            else {
                let answer = 'Bohaterowie w rotacji to: ';
                for (let i = 0; i < bodyRotation.freeChampionIds.length; i++) {
                    let sql = 'SELECT * FROM champions WHERE champ_key LIKE ' + bodyRotation.freeChampionIds[i] + ';';
                    let query = connection_1.db.query(sql, (err, result) => __awaiter(this, void 0, void 0, function* () {
                        if (err)
                            throw err;
                        if (i !== bodyRotation.freeChampionIds.length - 1) {
                            answer += result[0].champ_name + ', ';
                        }
                        else {
                            answer += result[0].champ_name;
                            yield interaction.reply(answer);
                        }
                    }));
                }
            }
        });
    },
};
