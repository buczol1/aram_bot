"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const championList = require('../champions.json');
const connection_1 = require("./connection");
const champions = championList.data;
var championParsed = [];
var text = "";
var x;
let resetSQL = "TRUNCATE TABLE champions";
let resetQuery = connection_1.db.query(resetSQL, (err, result) => {
    if (err)
        throw err;
});
for (x in champions) {
    let championSET = { champ_key: champions[x].key, champ_name: x };
    let championSQL = 'INSERT INTO champions SET ?';
    let participantsQuery = connection_1.db.query(championSQL, championSET, (err, result) => {
        if (err)
            throw err;
    });
}
connection_1.db.end();
