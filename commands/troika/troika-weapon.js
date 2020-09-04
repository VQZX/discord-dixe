
const graf = require('discord-graf');
const diceUtility = require('dice-utility')

module.exports = class TroikaWeaponRoll extends graf.Command
{
    constructor(bot)
    {
        super
        (
            bot,
            {
                name: 'troika-weapon',
                aliases: ['troika-table', 'troika-weapon'],
                module: 'troika',
                memberName: 'troika-weapon',
                description: 'A bot for handling the mapping of weapon tables of the TTRPG Troika',
                usage: 'troika-table <table> <roll>',
                pattern: ''
            }
        );
    }

    run(message, args)
    {
        const result = diceUtility.rollAttackTable(args[0], null);
        const output = `threw a ***${result.weapon}*** with ***${result.result}*** dmg`;
        return Promise.resolve(output);
    }
}
