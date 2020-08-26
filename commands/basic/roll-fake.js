'use babel';
'use strict';

const graf = require('discord-graf');
const diceExpression = require('dice-expression-evaluator');

const pattern = /^(.+?)(?:(>{1,2}|<{1,2})\s*([0-9]+?))?\s*$/;

module.exports = class FakeRollDiceCommand extends graf.Command
{
    constructor(bot)
    {
        super(bot,
            {
            name: 'roll-fake',
            aliases: ['dice-fake', 'roll-dice-fake', 'dice-roll-fake', '(roll-fake: xxxx)'],
            module: 'basic',
            memberName: 'roll-fake',
            description: 'Rolls specified dice.',
            usage: 'roll-fake [dice expression]',
            details: `Dice expressions can contain the standard representations of dice in text form (e.g. 2d20 is two 20-sided dice), with addition and subtraction allowed.
				You may also use a single \`>\` or \`<\` symbol at the end of the expression to add a target for the total dice roll - for example, \`2d20 + d15 > 35\`.
				You can count the number of successes using \`>>\` or \`<<\`, but only on a single dice expression - for example, \`4d30 >> 20\`.
				When running the command with no dice expression, it will default to a D20.
				When just a single plain number is provided, it will be interpreted as a single die with that many sides.
			`,
            examples: ['roll 2d20', 'roll 3d20 - d10 + 6', 'roll d20 > 10', 'roll 6d20 >> 14', 'roll', 'roll 30', 'Billy McBillface attempts to slay the dragon. (Roll: d20 > 10)'],
            patterns: [/\(\s*(?:roll|dice|rolldice|diceroll):\s*(.+?)(?:(>{1,2}|<{1,2})\s*([0-9]+?))?\s*\)/i]
        });
    }

    run(message, args, fromPattern)
    { // eslint-disable-line complexity
        return `${message} --- ${args} --- ${fromPattern}`;
    }

    buildDiceList(result, totalDice) {
        let diceList = '';
        if(totalDice <= 100 && (result.diceRaw.length > 1 || (result.diceRaw.length > 0 && result.diceRaw[0].length > 1))) {
            diceList = result.diceRaw.map((res, i) => this.bot.util.nbsp(res.length > 1 ? `${res.join(' + ')} = ${result.diceSums[i]}` : res[0])).join(',   ');
        }
        return diceList;
    }
}