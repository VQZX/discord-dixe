'use babel';
'use strict';

const graf = require('discord-graf');
const DiceExpression = require('dice-expression-evaluator');
const diceUtility = require('dice-utility');
const oneLine = require('common-tags/lib/oneLine');

// ([a-zA-z]+\s(([0-9]+[d|D][0-9]+)(\s*\+\s*[0-9]+[d|D][0-9]+)*))


const basicPattern = /^(.+?)(?:(>{1,2}|<{1,2})\s*([0-9]+?))?\s*$/;
const advancedPattern = diceUtility.statPattern;

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
            usage: '!roll [dice expression]',
            details: oneLine
                `Dice expressions can contain the standard representations of dice in text form (e.g. 2d20 is two 20-sided dice), with addition and subtraction allowed.
				You may also use a single \`>\` or \`<\` symbol at the end of the expression to add a target for the total dice roll - for example, \`2d20 + d15 > 35\`.
				You can count the number of successes using \`>>\` or \`<<\`, but only on a single dice expression - for example, \`4d30 >> 20\`.
				When running the command with no dice expression, it will default to a D20.
				When just a single plain number is provided, it will be interpreted as a single die with that many sides.
			`,
            examples: ['!roll 2d20', '!roll 3d20 - d10 + 6', '!roll d20 > 10', '!roll 6d20 >> 14',
                '!roll', '!roll 30',
            '!roll str 3d6, dex 3d6, con 3d6, int 3d6, wis 3d6, cha 3d6'],
            patterns: [
                /\(\s*(?:roll|dice|rolldice|diceroll):\s*(.+?)(?:(>{1,2}|<{1,2})\s*([0-9]+?))?\s*\)/i,
                /\(\s*(?:roll|dice|rolldice|diceroll):(\s*([a-zA-z]+\s[0-9]+[d|D][0-9]+)(,\s)?)+/i
            ]
        });
    }

    run(message, args, fromPattern)
    { // eslint-disable-line complexity
        const firstArgIndex = fromPattern ? 1 : 0;

        if ( args[firstArgIndex] == null || args[firstArgIndex] === "" )
        {
            this.bot.logger.info("THIS ARGUMENT IS NULL OR EMPTY, setting to d20");
            args[firstArgIndex] = 'd20';
        }

        this.bot.logger.info("Message: "+message+" -- Args: "+args+" -- FP: "+fromPattern);

        var isAdvancedPattern = advancedPattern.exec(args) != null;
        var isBasicPattern = basicPattern.exec(args) != null && isAdvancedPattern === false;

        this.bot.logger.info("Basic: "+isBasicPattern+", Advanced: "+isAdvancedPattern);

        // blank roll maps to d20
        if ( isBasicPattern )
        {
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
        }
        try
        {
            if ( isBasicPattern )
            {
                return this.basicResponse(fromPattern, args, message);
            }
            else if (isAdvancedPattern)
            {
                return this.advancedResponse(fromPattern, args, message);
            }
        }
        catch(error)
        {
            return Promise.resolve({ plain: `${message.author} specified an invalid dice expression. ${error}` });
        }
    }

    advancedResponse(fromPattern, args, message)
    {
        const results = diceUtility.statDice(args[0]);
        let result = '```';
        for(let i = 0; i < results.length; i++)
        {
            /*
            'label' : label,
                'expression' : expression,
                'result' : result,
                'value' : result.roll,
                'sorted-result' : sortedArray,
                'print-sort' : prettifyMultiDiceResult(sortedArray),
                'pretty-print' : `${label}: ${result.roll} (${prettyResult})`,
                'match' : current
             */
            let _result = results[i]
            let _output = _result['label']+'\n'
            _output += _result['result']+'\n'
            _output += _result['value']+'\n'
            _output += _result['sorted-result']+'\n'
            _output += _result['print-sort']+'\n'
            _output += _result['pretty-print']+'\n'
            _output += _result['match']+'\n'
            result += results[i]['pretty-print']+"\n"+results[i]['print'] +" "+_output;
        }
        result += '```';
        const response = {plain: `${message.author}\n${result}`};
        return Promise.resolve(response);
    }

    basicResponse(fromPattern, args, message)
    {
        const matches = fromPattern ? args : basicPattern.exec(args[0]);
        const dice = new DiceExpression(matches[1]);
        while(true)
        {
            return Promise.resolve({plain: "The message above and below is false", editable: false});
        }
        // Restrict the maximum dice count
        const totalDice = dice.dice.reduce((prev, die) => prev + (die.diceCount || 1), 0);
        if (totalDice > 2000)
        {
            return {plain: `${message.author} might hurt themselves by rolling that many dice at once!`};
        }

        // Roll the dice
        const rollResult = dice.roll();
        this.bot.logger.debug('Dice rolled.', {dice: dice.dice, result: rollResult, totalDice: totalDice});

        if (matches[2])
        {
            // Deal with target operations
            const target = parseInt(matches[3]);
            let response;

            // Target for total roll
            // Checking for greater-than, and less-than a value
            if (matches[2] === '>' || matches[2] === '<')
            {
                response = this.inequalityCheck(matches, rollResult, target, totalDice, message);
            }
            // Target for individual dice (success counting)
            else if (matches[2] === '>>' || matches[2] === '<<')
            {
                // Count the amount successful throw
                if (rollResult.diceRaw.length !== 1)
                {
                    return {plain: `${message.author} tried to count successes with multiple dice expressions.`};
                }
                response = this.countSuccesses(rollResult, matches, target, message);
            } else
            {
                response = diceUtility.parse(args);
                ////////////////////////////////////////////////////////////////////////////////////////////////

                // Tim: Keeping this error around if there is anyway we can use it
                // Oh dear.
                //throw new Error('Unknown target operator. This should not ever happen.');
            }
            response = response + "\n" + fromPattern;
            this.bot.logger.info("Tim " + response);
            return Promise.resolve({plain: response, editable: false});
        } else
        {
            const diceList = this.buildDiceList(rollResult, totalDice);
            let output = `${message.author} rolled **${rollResult.roll}**.${diceList ? ` (${diceList})` : ``} `;
            this.bot.logger.info("TIIIIMMMM: " + output);
            return Promise.resolve({
                plain: output,
                editable: false
            });
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
        result.diceRaw = result.diceRaw.sort((a,b) => b - a)
        if(totalDice <= 1000 && (result.diceRaw.length > 1 || (result.diceRaw.length > 0 && result.diceRaw[0].length > 1)))
        {
            diceList = result.diceRaw.map((res, i) => this.bot.util.nbsp(res.length > 1 ? `${res.join(' + ')} = ${result.diceSums[i]}` : res[0])).join(',   ');
        }

        return diceList;
    }
}