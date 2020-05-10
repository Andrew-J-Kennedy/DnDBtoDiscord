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




For Players: Open a character previously imported in your server's Avrae Bot.

Click on the PROFICENCIES & LANGUAGES manage icon (gears) at the bottom left of page.

In the sidebar that pops up on the right-hand side select:
ADD NEW PROFICIENCIES
 Custom
   Tool

Replace: "Custom Tool 1" with "Discord"
In the Enter Source Note textbox paste in: "CampaignName,DiscordName"
(whatever you configured in the file above)

SecondSundering,Dworic



You don't need to save.

Refresh you browser Window.

You shoudl see a [FREE TEXT] button appear to the right of the Charactger Builder Icon.
To test [ctrl]+click on the [FREE TEXT] button and type something in.


==============================================================

Dev

ln -s /opt/DnDBtoDiscord/DnDBtoDiscordPrivate.js ./DnDBtoDiscordPrivate.js

Critter DB
!bestiary import https://critterdb.com/#/publishedbestiary/view/5ea4b8b463a0580dfd76d379

https://critterdb.com/#/publishedbestiary/view/5ea4b8b463a0580dfd76d379


==============================================================

Beyond Darkmode v2.0

Stylus Chrome Extension
https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne/related?hl=en


https://userstyles.org/styles/183035/dnd-beyond-dark-character-sheets

https://pastebin.com/ABaj0RyJ
