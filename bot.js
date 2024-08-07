const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType,ModalBuilder,TextInputBuilder,TextInputStyle } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const TOKEN = '<YOUR BOT TOKEN>';
const API_URL = 'https://wizz.chat/swipes?version=3';
const BEARER_TOKEN = '<YOUR BEARER TOKEN>';
let users = [];
let userIndex = 0;
let currentUserId = null;
const badWordsList = ['<YOUR BLACKLISTED WORDS ARRAY>']; 
let currentimage = null
let previousMessageId = null;
try{
    async function fetchData() {
        const headers = {
            "Accept-Encoding": "gzip",
            "appconfiguration": "playStore",
            "appVersion": "5.7.1",
            "Authorization": `Bearer ${BEARER_TOKEN}`,
            "Connection": "Keep-Alive",
            "device_model": "SM-S908E",
            "Host": "wizz.chat",
            "keychain_udid": "secure_4ae7fcece007812f",
            "location": "US",
            "mixpanelUserID": "8a970751-b25f-4db7-b291-6fa201cfb408",
            "os_name": "Android",
            "os_version": "28",
            "preferredlanguage": "en-US",
            "timezone": "America/New_York",
            "User-Agent": "Wizz/5.7.1 (info.wizzapp; build:539; Android 28) okhttp/4.11.0",
            "Cache-Control": "no-cache"
        };

        const response = await fetch(API_URL, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        return await response.json();
    }

    client.on('messageCreate', async message => {
        if (message.content.toLowerCase() === '!start' && !message.author.bot) {
            try {
                if (previousMessageId) {
                    const previousMessage = await message.channel.messages.fetch(previousMessageId);
                    await previousMessage.delete();
                }
                const data = await fetchData();
                users = data.data.map(item => item.user);
                userIndex = 0;

                const user = users[userIndex];
                currentUserId = user._id; 
                currentimage = user.bios[0].screenshotUrl
                console.log(currentUserId);

                const embed = new EmbedBuilder()
                    .setTitle(`Name: ${user.name}\nAge: ${user.age}\nState: ${user.state}\nGender: ${user.gender}`)
                    .setColor('#3498db')
                    .setImage(user.bios[0].screenshotUrl);

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary);

                const blockButton = new ButtonBuilder()
                    .setCustomId('block')
                    .setLabel('Block')
                    .setStyle(ButtonStyle.Danger);

                const settings = new ButtonBuilder()
                    .setCustomId('settings')
                    .setLabel('🔧')
                    .setStyle(ButtonStyle.Secondary);
                const reloadButton = new ButtonBuilder()
                    .setCustomId('reload')
                    .setLabel('🔄')
                    .setStyle(ButtonStyle.Secondary);
                const Messagebutton = new ButtonBuilder()
                    .setCustomId('message')
                    .setLabel('📨 Message')
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder()
                    .addComponents(nextButton, Messagebutton, blockButton, settings,reloadButton);

                const msg = await message.channel.send({ embeds: [embed], components: [row] });
                previousMessageId = msg.id; 
                const sentMessages = new Set();
                client.on('interactionCreate', async interaction => {
                    try {
                
                        if (!interaction.isModalSubmit()) return;
                        if (interaction.isModalSubmit() && interaction.customId === 'message') {
                            const message = interaction.fields.getTextInputValue('usermessage');
                            const interactionGuildMember = await interaction.guild.members.fetch(interaction.user.id);
                            const containsBadWords = badWordsList.some(badWord => message.toLowerCase().includes(badWord.toLowerCase()));
                            const userName = interactionGuildMember.user.username;
                            console.log(`${message} sent by ${userName}`);
                
                            if (sentMessages.has(interaction.user.id)) {
                                await interaction.reply({ content: 'You have already sent a message.', ephemeral: true });
                                return;
                            }
                
                            let bannedusers = ["<BANNED USERS ARRAY>"];
                            if (bannedusers.includes(userName)) {
                                await interaction.reply({ content: 'You are banned from using this bot.', ephemeral: true });
                            } else if (containsBadWords) {
                                await interaction.reply({ content: 'Your message contains inappropriate content and cannot be sent.', ephemeral: true });
                            } else {
                                const headers = {
                                    "Accept-Encoding": "gzip",
                                    "appconfiguration": "playStore",
                                    "appVersion": "5.7.1",
                                    "Authorization": `Bearer ${BEARER_TOKEN}`,
                                    "Connection": "Keep-Alive",
                                    "device_model": "SM-S908E",
                                    "Host": "wizz.chat",
                                    "keychain_udid": "secure_4ae7fcece007812f",
                                    "location": "US",
                                    "mixpanelUserID": "8a970751-b25f-4db7-b291-6fa201cfb408",
                                    "os_name": "Android",
                                    "os_version": "28",
                                    "preferredlanguage": "en-US",
                                    "timezone": "America/New_York",
                                    "User-Agent": "Wizz/5.7.1 (info.wizzapp; build:539; Android 28) okhttp/4.11.0",
                                    "Cache-Control": "no-cache",
                                    "Content-Type": "application/json"
                                };
                
                                const userId = `${currentUserId}`;
                                const body = JSON.stringify({
                                    "swipes": {
                                        [userId]: {
                                            "from": "swipe",
                                            "text": `${message}`,
                                            "screenshotUrl": `${currentimage}`,
                                            "analyticsSecretAdmirer": {}
                                        }
                                    }
                                });
                
                                const response = await fetch(`https://wizz.chat/swipes`, {
                                    method: "POST",
                                    headers: headers,
                                    body: body
                                });
                
                                const status = await response.status;
                                console.log(status);
                                if (status == 204) {
                                    await interaction.reply({ content: `Message sent! ${message}`, ephemeral: true });
                                    sentMessages.add(interaction.user.id);
                
                                    setTimeout(() => sentMessages.delete(interaction.user.id), 500);
                                }
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                });
                

            client.on('interactionCreate', async interaction => {
                    if (interaction.type !== InteractionType.MessageComponent) return;
                    if (interaction.message.id === msg.id) {
                        if (interaction.customId === 'next') {
                            userIndex = (userIndex + 1) % users.length;
                            const user = await users[userIndex];
                            currentUserId = await user._id; 
                            currentimage = user.bios[0].screenshotUrl
                            await console.log('Current USERID:', currentUserId);
                            embed.setTitle(`Name: ${user.name}\nAge: ${user.age}\nState: ${user.state}\nGender: ${user.gender}`)
                                .setImage(user.bios[0].screenshotUrl);

                            await interaction.update({ embeds: [embed] });
                        } else if (interaction.customId === 'block') {
                            const headers = {
                                "Accept-Encoding": "gzip",
                                "appconfiguration": "playStore",
                                "appVersion": "5.7.1",
                                "Authorization": `Bearer ${BEARER_TOKEN}`,
                                "Connection": "Keep-Alive",
                                "device_model": "SM-S908E",
                                "Host": "wizz.chat",
                                "keychain_udid": "secure_4ae7fcece007812f",
                                "location": "US",
                                "mixpanelUserID": "8a970751-b25f-4db7-b291-6fa201cfb408",
                                "os_name": "Android",
                                "os_version": "28",
                                "preferredlanguage": "en-US",
                                "timezone": "America/New_York",
                                "User-Agent": "Wizz/5.7.1 (info.wizzapp; build:539; Android 28) okhttp/4.11.0",
                                "Cache-Control": "no-cache",
                                "Content-Type": "application/json" 
                            };
                            
                            const jsonData = {
                                "userID": currentUserId,
                                "blocking": true,
                                "from": "swipe"
                            };
                            await fetch("https://wizz.chat/users/block", {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify(jsonData) 
                            });
                            await interaction.reply({ content: `User ${currentUserId} blocked!`, ephemeral: true });
                        }else if(interaction.customId === 'message'){
                            const modal = new ModalBuilder()
                            .setCustomId('message')
                            .setTitle('Message to ' + user.name);

                        const usermessage = new TextInputBuilder()
                            .setCustomId('usermessage')
                            .setLabel("Message")
                            .setStyle(TextInputStyle.Short);


                        const Message = new ActionRowBuilder().addComponents(usermessage);
                        modal.addComponents(Message);
                        interaction.showModal(modal);
                        }
                        else if (interaction.customId === 'reload') {
                            try {
                                // Fetch fresh data
                                const data = await fetchData();
                                users = data.data.map(item => item.user);
                                userIndex = 0;

                                const user = users[userIndex];
                                currentUserId = user._id;

                                embed.setTitle(`Name: ${user.name}\nAge: ${user.age}\nState: ${user.state}\nGender: ${user.gender}`)
                                    .setImage(user.bios[0].screenshotUrl);

                                await interaction.update({ embeds: [embed] });
                            } catch (error) {
                                console.error('Error refetching data:', error);
                                await interaction.reply({ content: 'An error occurred while fetching new data.', ephemeral: true });
                            }
                            }else if (interaction.customId === 'settings') {
                            const headers = {
                                "Accept-Encoding": "gzip",
                                "appconfiguration": "playStore",
                                "appVersion": "5.7.1",
                                "Authorization": `Bearer ${BEARER_TOKEN}`,
                                "Connection": "Keep-Alive",
                                "device_model": "SM-S908E",
                                "Host": "wizz.chat",
                                "keychain_udid": "secure_4ae7fcece007812f",
                                "location": "US",
                                "mixpanelUserID": "8a970751-b25f-4db7-b291-6fa201cfb408",
                                "os_name": "Android",
                                "os_version": "28",
                                "preferredlanguage": "en-US",
                                "timezone": "America/New_York",
                                "User-Agent": "Wizz/5.7.1 (info.wizzapp; build:539; Android 28) okhttp/4.11.0",
                                "Cache-Control": "no-cache",
                                "Content-Type": "application/json" 
                            };
                            
                            const body = JSON.stringify({});
                            
                            const response = await fetch(`https://wizz.chat/users/<YOUR USER ID>?version=2`, {
                                method: "PUT", 
                                headers: headers,
                                body: body 
                            });
                            
                            const data = await response.json();
                            
                            const name = data.name;
                            const age = data.age;
                            const gender = data.gender;
                            const swipeGhostModeEnabled = data.swipeGhostMode;
                            
                            console.log(`Name: ${name}`);
                            console.log(`Age: ${age}`);
                            console.log(`Gender: ${gender}`);
                            console.log(`Swipe Ghost Mode Enabled: ${swipeGhostModeEnabled}`);
                            
                            embed.setTitle(`Name: ${name}\n🔞Age: ${age}\n🗽State: ${data.state}\n🧬Gender: ${gender}\n👻Ghost Mode: ${swipeGhostModeEnabled}\n👓Showing State: ${data.showState}\n\n**Preference**\nGender: ${data.swipePreference.gender}`)
                                .setImage(null);
                            
                            const backButton = new ButtonBuilder()
                                .setCustomId('back')
                                .setLabel('Back')
                                .setStyle(ButtonStyle.Secondary);

                            const ghostModeButton = new ButtonBuilder()
                                .setCustomId('toggleGhostMode')
                                .setLabel('Toggle Ghost Mode')
                                .setStyle(ButtonStyle.Primary);

                            const stateButton = new ButtonBuilder()
                                .setCustomId('toggleState')
                                .setLabel('Toggle State')
                                .setStyle(ButtonStyle.Primary);

                            const settingsRow = new ActionRowBuilder()
                                .addComponents(backButton, ghostModeButton, stateButton);

                            await interaction.update({ embeds: [embed], components: [settingsRow] });
                        } else if (interaction.customId === 'back') {
                            const originalRow = new ActionRowBuilder()
                                .addComponents(nextButton, Messagebutton, blockButton, settings,reloadButton);

                            await interaction.update({ embeds: [embed], components: [originalRow] });
                        } else if (interaction.customId === 'toggleGhostMode') {
                                const headers = {
                                    "Accept-Encoding": "gzip",
                                    "appconfiguration": "playStore",
                                    "appVersion": "5.7.1",
                                    "Authorization": `Bearer ${BEARER_TOKEN}`,
                                    "Connection": "Keep-Alive",
                                    "device_model": "SM-S908E",
                                    "Host": "wizz.chat",
                                    "keychain_udid": "secure_4ae7fcece007812f",
                                    "location": "US",
                                    "mixpanelUserID": "8a970751-b25f-4db7-b291-6fa201cfb408",
                                    "os_name": "Android",
                                    "os_version": "28",
                                    "preferredlanguage": "en-US",
                                    "timezone": "America/New_York",
                                    "User-Agent": "Wizz/5.7.1 (info.wizzapp; build:539; Android 28) okhttp/4.11.0",
                                    "Cache-Control": "no-cache",
                                    "Content-Type": "application/json"
                                };

                                const body = JSON.stringify({});

                                try {
                                    const response = await fetch(`https://wizz.chat/users/<YOUR USER ID>?version=2`, {
                                        method: "PUT",
                                        headers: headers,
                                        body: body
                                    });
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                    }

                                    const data = await response.json();
                                    const newghostmode = !data.swipeGhostMode;
                                    const updateBody = JSON.stringify({
                                        "swipeGhostMode": newghostmode
                                    });

                                    const updateResponse = await fetch(`https://wizz.chat/users/<YOUR USER ID>?version=2`, {
                                        method: "PUT",
                                        headers: headers,
                                        body: updateBody
                                    });
                                    if (!updateResponse.ok) {
                                        throw new Error(`HTTP error! status: ${updateResponse.status}`);
                                    }
                                    const updatedData = await updateResponse.json();
                                    const ghostModeEnabled = updatedData.swipeGhostMode;
                                    await interaction.reply({ content: `Ghost Mode is now ${ghostModeEnabled ? 'enabled' : 'disabled'}.`, ephemeral: true });

                                } catch (error) {
                                    console.error('Error:', error);
                                    await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
                                }

                        } else if (interaction.customId === 'toggleState') {
                            const headers = {
                                "Accept-Encoding": "gzip",
                                "appconfiguration": "playStore",
                                "appVersion": "5.7.1",
                                "Authorization": `Bearer ${BEARER_TOKEN}`,
                                "Connection": "Keep-Alive",
                                "device_model": "SM-S908E",
                                "Host": "wizz.chat",
                                "keychain_udid": "secure_4ae7fcece007812f",
                                "location": "US",
                                "mixpanelUserID": "8a970751-b25f-4db7-b291-6fa201cfb408",
                                "os_name": "Android",
                                "os_version": "28",
                                "preferredlanguage": "en-US",
                                "timezone": "America/New_York",
                                "User-Agent": "Wizz/5.7.1 (info.wizzapp; build:539; Android 28) okhttp/4.11.0",
                                "Cache-Control": "no-cache",
                                "Content-Type": "application/json"
                            };

                            const body = JSON.stringify({});

                            try {
                                const response = await fetch(`https://wizz.chat/users/<YOUR USER ID>?version=2`, {
                                    method: "PUT",
                                    headers: headers,
                                    body: body
                                });
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }

                                const data = await response.json();
                                const newstatemode = !data.showState;
                                const updateBody = JSON.stringify({
                                    "showState": newstatemode
                                });

                                const updateResponse = await fetch(`https://wizz.chat/users/<YOUR USER ID>?version=2`, {
                                    method: "PUT",
                                    headers: headers,
                                    body: updateBody
                                });
                                if (!updateResponse.ok) {
                                    throw new Error(`HTTP error! status: ${updateResponse.status}`);
                                }
                                const updatedData = await updateResponse.json();
                                const StateEnabled = updatedData.showState;
                                await interaction.reply({ content: `Sate Visibility is now ${StateEnabled ? 'enabled' : 'disabled'}.`, ephemeral: true });

                            } catch (error) {
                                console.error('Error:', error);
                                await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
                            }

                        }
                    }
                });
            } catch (error) {
                console.error('Error handling !start command:', error);
            }
        }
    });
}
catch {
    console.error('Error handling');
}
try{    
client.login(TOKEN);
}catch (error) {
    console.error('Error logging in:', error);
}
