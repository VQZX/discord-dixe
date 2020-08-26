'use babel';
'use strict';

//import {Command, CommandFormatError} from 'discord-graf/lib/index.js';
//import DiceExpression from 'dice-expression-evaluator'

const graf = require('discord-graf');
const diceExpression = require('dice-expression-evaluator');

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
            throw new diceExpression.CommandFormatError(this, message.guild);
        }
        try
        {
            const maxRoll = new DiceExpression(args[0].max());
            return 'The maximum possible roll is **'
        }
        catch (error)
        {
            return "Invalid dice expression";
        }
    }
}