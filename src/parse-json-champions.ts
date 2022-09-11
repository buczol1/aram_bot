const championList = require('../champions.json');
import { db } from './connection';
const champions = championList.data;


var championParsed = [];
var text: string = "";
var x: any;
let resetSQL = "TRUNCATE TABLE champions";
let resetQuery = db.query(resetSQL, (err, result) => {
	if(err) throw err;
});
for(x in champions){
	let championSET = {champ_key: champions[x].key, champ_name: x};
	let championSQL = 'INSERT INTO champions SET ?';
	let participantsQuery = db.query(championSQL, championSET, (err, result) => {
		if(err) throw err;
	});
}
db.end();
