const { log } = require('@profilepensions/logger');
const EventEmitter = require('events');
const mongoose = require('mongoose');
const dbConfig = require('config').database;

class Database extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.url = `${dbConfig.uri}/${dbConfig.name}${dbConfig.urlOpts}`;
    this.options = {
      user: dbConfig.user,
      pass: dbConfig.password,
      authSource: 'admin',
      serverSelectionTimeoutMS: 15000,
      replicaSet: dbConfig.replicaSet,
    };

    this.addListeners();
  }

  getStatus() {
    return this.connected;
  }

  connect() {
    if (dbConfig.env === 'ci-test') {
      // ci test database is a default mongo with no auth
      mongoose.connect(this.url);
    } else {
      mongoose.connect(this.url, this.options);
    }
  }

  addListeners() {
    mongoose.connection.on('connected', () => {
      this.connected = true;
      log.info(`Mongoose default connection open ${this.url}`);
    });

    mongoose.connection.on('error', (err) => {
      this.connected = false;
      log.error(`Mongoose default connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      this.connected = false;
      log.info('Mongoose default connection disconnected');
      process.exit(1);
    });

    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        log.info('Mongoose default connection disconnected through app termination');
        process.exit(0);
      });
    });
  }
}

module.exports = new Database();
