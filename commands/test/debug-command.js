
const graf = require('discord-graf');

module.exports = class DebugCommand extends graf.Command
{
    constructor(bot)
    {
        super
        (
            bot,
            {
                name: 'debug',
                aliases: ['debug', 'check-bot', 'test'],
                module: 'debug',
                memberName: 'debug',
                description: 'A simple command to test bot flow',
                usage: 'debug-command'
            }
        );
    }

    run(message, args)
    {
        const output = "Dixe bot returning debug: " +
            "Message "+message+" - Arguments: "+args;
        return Promise.resolve(output);
    }
}
