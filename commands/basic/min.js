'use babel';
'use strict';

const graf = require('discord-graf');
const diceExpression = require('dice-expression-evaluator');

module.exports = class MinRollCommand extends graf.Command {
    constructor(bot)
    {
        super(
        bot,
        {
            name: 'min-roll',
            module: 'basic',
            memberName: 'min',
            description: 'Calculates the minimum possible roll for a dice expression.',
            usage: 'min-roll <dice expression>',
            details: 'The dice expression follows the same rules as !roll, but targets (< or >) cannot be used.',
            examples: ['min-roll 2d20', 'min-roll 3d20 - d10 + 6']
        }
        );
    }

    run(message, args)
    {
        if(!args[0])
        {
            throw new diceExpression.CommandFormatError(this, message.guild);
        }
        try
        {
            const minRoll = new DiceExpression(args[0]).min();
            return `The minimum possible roll is **${minRoll}**.`;
        }
        catch(error)
        {
            return 'Invalid dice expression specified.';
        }
    }
}
