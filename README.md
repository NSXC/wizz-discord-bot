# wizz-discord-bot
A discord bot that lets you use the wizz app with your friends on discord


## How to get your info

1) Root your Bluestacks VM
2) Install ADB here https://developer.android.com/tools/releases/platform-tools
3) Install HTTP Toolkit
4) Start HTTP Toolkit
5) In the Bluestacks VM click settings and turn on ADB
6) Using ADB connect to the VM using `./adb connect 127.0.0.1:<PORT>`
7) In HTTP Toolkit click connect using ADB
8) Then click Wizz
9) Now in the HTTP request monitor get the bearer token and your user ID
10) Put it in the bot
11) Run the bot 
