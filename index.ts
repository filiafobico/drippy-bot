import dotenv from 'dotenv'
dotenv.config();

import { Client } from 'discord.js'
const client = new Client();

import commands from './commands'

const prefix = '$';

client.on('ready', () => {
    console.log('Bot is active');

    client.on('message', message => {
        if (message.channel.type === 'text' && message.content.startsWith(prefix)) {
            const command = message.content.substr(1);
            const args = command.split(/\s+/g)
                .filter(e => e.length);

            args[0] = args[0].toLowerCase();

            if (args[0] in commands) {
                commands[args[0]].executor(client, message, args);
            }
        }
    });
});

client.login(process.env['TOKEN']);