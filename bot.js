'use babel';
'use strict';

import { Bot } from 'discord-graf';

export default new Bot({
    name: 'RPBot',
    version: version,
    about: 'To help with some wiggle TTTRPS',
    updateURL: '...',
    clientOptions: {
        disableEveryone: true,
        messageCacheLifetime: 120,
        messageSweepInterval: 60
    }
});
