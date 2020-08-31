'use babel'
'use strict';

// We are using this as a means of trying to get this bullshit to work
// We will be moving this to its own file eventually
const config = require('./config.json');
const graf = require('discord-graf');
const debugCommand = require('./commands/test/debug-command');
const rollCommand = require('./commands/basic/roll');
const rollfakeCommand = require('./commands/basic/roll-fake');
const maxCommand = require('./commands/basic/max');
const minCommand = require('./commands/basic/min');
const troikaCommand = require('./commands/troika/troika-weapon');

// Alright alright, the above compiles
const version = '0.0.1';

const dixeBot = new graf.Bot
(
    {
        name: 'Dixe-Bot',
        version: version,
        token: config.token,
        email: config.email,
        password: config.password,
        clientOptions:
            {
                disable_everyone: true
            },
        about: 'To help with some wiggle TTTRPGs',
        updateURL: 'https://raw.githubusercontent.com/VQZX/discord-dixe/master/package.json?token=AA3JSQIHEROA4PAJTAISPAK7IXIS4'
    }
);

// Add some commands
const modules = [
    ['basic', 'Basic'],
    ['test', 'Test'],
    ['troika', 'Troika']
];

const commands = [rollfakeCommand, debugCommand, minCommand, maxCommand, rollCommand, troikaCommand];
const client = dixeBot.
    registerDefaults().
    registerModules(modules).
    registerCommands(commands).
    createClient();
