const graf = require('discord-graf');

// Leaving for reference because this is some messy developmet, TIMOTHY!
//const pattern = /^(.+?)(?:(>{1,2}|<{1,2})\s*([0-9]+?))?\s*$/;

const diceUtility = require("dice-utility");

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
            details: 'one-line',
            examples: ['roll 2d20', 'roll 3d20 - d10 + 6', 'roll d20 > 10', 'roll 6d20 >> 14', 'roll', 'roll 30', 'Billy McBillface attempts to slay the dragon. (Roll: d20 > 10)'],
            patterns: [/\(\s*(?:roll|dice|rolldice|diceroll):\s*(.+?)(?:(>{1,2}|<{1,2})\s*([0-9]+?))?\s*\)/i]
        });
    }

    run(message, args)
    {
        // eslint-disable-line complexity
        const response = diceUtility.stat_dice("stat_dice "+message+" "+args);
        return Promise.resolve({ plain: response, editable: false });
    }
}