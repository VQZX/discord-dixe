'use babel';
'use strict';

const graf = require('discord-graf');
const DiceExpression = require('dice-expression-evaluator');

module.exports = class MaxRollCommand extends  graf.Command
{
    constructor(bot)
    {
        super(
            bot,
            {
                name: 'max-roll',
                module: 'basic',
                memberName: 'max',
                description: 'Calculate max roll',
                usage: 'max-roll <dice-expression>',
                details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
                examples: ['max-roll 2d20', 'max-roll 3d20 - d10 + 6']
            }
        );
    }

    run(message, args)
    {
        if ( !args[0] )
        {
            throw new DiceExpression.CommandFormatError(this, message.guild);
        }
        try
        {
            const maxRoll = new DiceExpression(args[0]).max();
            let response = `The maximum possible roll is **${maxRoll}**`;
            return Promise.resolve(response);
        }
        catch (error)
        {
            return Promise.resolve("Invalid dice expression: "+error);
        }
    }
}
