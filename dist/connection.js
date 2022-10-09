"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const mysql_1 = __importDefault(require("mysql"));
const dotenv_1 = __importDefault(require("dotenv"));
let host, user, password, database;
dotenv_1.default.config();
if (process.env.HOST) {
    host = process.env.HOST;
}
else {
    throw new Error("HOST environment variable is not set");
}
if (process.env.USER) {
    user = process.env.USER;
}
else {
    throw new Error("USER environment variable is not set");
}
if (process.env.PASSWORD) {
    password = process.env.PASSWORD;
}
else {
    throw new Error("PASSWORD environment variable is not set");
}
if (process.env.DATABASE) {
    database = process.env.DATABASE;
}
else {
    throw new Error("DATABASE environment variable is not set");
}
exports.db = mysql_1.default.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
    port: 3306
});
exports.db.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected to database!");
});
//module.exports = db;
