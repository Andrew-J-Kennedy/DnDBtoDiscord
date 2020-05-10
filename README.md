This script is designed to allow users to communicate with a modified Avrae bot on Discord.

You need to have a WebHook setup on your Discord server:

You need to have an instance of the modified Avrae bot running on your Discord server:

https://github.com/Andrew-J-Kennedy/avrae

The functional difference from Avrae is that you can setup a whitelist for a bot and Avrae will respond.


To install the client-side script:

Install Tampermonkey in Chrome:

https://www.tampermonkey.net/

Install the UserScript:

https://openuserjs.org/scripts/Andrew-J-Kennedy/DnDBtoDiscord


Open Chrome at:  
https://www.dndbeyond.com/

Navigate to a character sheet.

You will be prompted to set the Default Config settings.

Replace: 00--WEBHOOK-URL-00... with Discord Server Bot WebHook
Replace: 000000000000000000... with Discord User Id

The other Options are: if you have changed the server prefix you Avrea bot is listening for; and to indicate if you are using the Avrae init sub-system.

Each character you open with this browser will use these defults, but you can overide these settings for each character (for example: you are in multiple campaigns)

