'use babel';
'use strict';

const graf = require('discord-graf');
const DiceExpression = require('dice-expression-evaluator');
const diceUtility = require('dice-utility');
const oneLine = require('common-tags/lib/oneLine');

const pattern = /^(.+?)(?:(>{1,2}|<{1,2})\s*([0-9]+?))?\s*$/;

module.exports = class RollDiceCommand extends graf.Command
{
    constructor(bot)
    {
        super(bot,
            {
            name: 'roll',
            aliases: ['dice', 'roll-dice', 'dice-roll', '(roll: xxxx)'],
            module: 'basic',
            memberName: 'roll',
            description: 'Rolls specified dice.',
            usage: 'roll [dice expression]',
            details: oneLine
                `Dice expressions can contain the standard representations of dice in text form (e.g. 2d20 is two 20-sided dice), with addition and subtraction allowed.
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
        const firstArgIndex = fromPattern ? 1 : 0;

        // blank roll maps to d20
        if(!args[firstArgIndex])
        {
            // cute defaulting
            args[firstArgIndex] = 'd20';
        }
        else
        {
            const rawNumber = parseInt(args[firstArgIndex]);
            if(!isNaN(rawNumber) && String(rawNumber) === args[firstArgIndex])
            {
                args[firstArgIndex] = `d${rawNumber}`;
            }
        }
        try
        {
            const matches = fromPattern ? args : pattern.exec(args[0]);
            const dice = new DiceExpression(matches[1]);

            // Restrict the maximum dice count
            const totalDice = dice.dice.reduce((prev, die) => prev + (die.diceCount || 1), 0);
            if(totalDice > 1000) return { plain: `${message.author} might hurt themselves by rolling that many dice at once!` };

            // Roll the dice
            const rollResult = dice.roll();
            this.bot.logger.debug('Dice rolled.', { dice: dice.dice, result: rollResult, totalDice: totalDice });

            if(matches[2])
            {
                // Deal with target operations
                const target = parseInt(matches[3]);
                let response;

                // Target for total roll
                // Checking for greater-than, and less-than a value
                if(matches[2] === '>' || matches[2] === '<')
                {
                    response = this.inequalityCheck(matches, rollResult, target, totalDice, message);
                }
                // Target for individual dice (success counting)
                else if(matches[2] === '>>' || matches[2] === '<<')
                {
                    // Count the amount successful throw
                    if(rollResult.diceRaw.length !== 1)
                    {
                       return { plain: `${message.author} tried to count successes with multiple dice expressions.` };
                    }
                    response = this.countSuccesses(rollResult, matches, target, message);
                }
                else
                {
                    response = diceUtility.parse(args);

                    ////////////////////////////////////////////////////////////////////////////////////////////////

                    // Tim: Keeping this error around if there is anyway we can use it
                    // Oh dear.
                    //throw new Error('Unknown target operator. This should not ever happen.');
                }
                return Promise.resolve({ plain: response, editable: false });
            }
            else
            {
                const diceList = this.buildDiceList(rollResult, totalDice);
                return Promise.resolve({
                    plain: `${message.author} rolled **${rollResult.roll}**.${diceList ? ` (${diceList})` : ''}`,
                    editable: false
                });
            }
        }
        catch(error)
        {
            return Promise.resolve({ plain: `${message.author} specified an invalid dice expression. ${error}` });
        }
    }

    countSuccesses(rollResult, matches, target, message)
    {
        const successes =
            rollResult.diceRaw[0].reduce((prev, die) => prev + (matches[2] === '>>' ? die > target : die < target), 0);
        return oneLine`
						${message.author} has **${successes > 0 ? `succeeded ${successes} time${successes !== 1 ? 's' : ''}` : `failed`}**.
						${rollResult.diceRaw[0].length > 1 && rollResult.diceRaw[0].length <= 100 ? `(${rollResult.diceRaw[0].join(',   ')})` : ''}
					`;
    }

    inequalityCheck(matches, rollResult, target, totalDice, message)
    {
        const success = matches[2] === '>' ? rollResult.roll > target : rollResult.roll < target;
        const diceList = this.buildDiceList(rollResult, totalDice);
        return oneLine`
						${message.author} has **${success ? 'succeeded' : 'failed'}**.
						(Rolled ${rollResult.roll}, ${!success ? 'not' : ''} ${matches[2] === '>' ? 'greater' : 'less'} than ${target}${diceList ? `;   ${diceList}` : ''})`;
    }

    buildDiceList(result, totalDice)
    {
        let diceList = '';
        if(totalDice <= 100 && (result.diceRaw.length > 1 || (result.diceRaw.length > 0 && result.diceRaw[0].length > 1)))
        {
            diceList = result.diceRaw.map((res, i) => this.bot.util.nbsp(res.length > 1 ? `${res.join(' + ')} = ${result.diceSums[i]}` : res[0])).join(',   ');
        }
        return diceList;
    }
}