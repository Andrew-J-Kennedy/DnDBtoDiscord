
Install Tampermonkey in Chrome:

https://www.tampermonkey.net/


Allow Tampermonkey to access your local files:

chrome://extensions/?id=dhdgffkkebhmkfjojejmpbldmpobfkfo
Switch: Allow access to file URLs

Install UserScript:

https://openuserjs.org/scripts/Andrew-J-Kennedy/DnDBtoDiscord

Create File on Disk:

C:\DnDBtoDiscordPrivate.js
==============================================================
'use strict';
// The Server Prefix annd Discord Bot Key for your games
const DiscordServerSettings = [
    {name: 'CampaignName', settings:  ['!','00--WEBHOOK-URL-00/QWERTY------------------------RANDOM-KEY----------------------XCVBNM']}
];
// The Discord Ids for your games (a DM may have multiple NPC users)
const DiscordIds = [
    {name: 'DiscordName', id: '000000000000000000'},
];
==============================================================

Replace: 00--WEBHOOK-URL-00... with Discord Server Bot WebHook
Replace: 000000000000000000... with Discord User Id


Open Chrome at:  
https://www.dndbeyond.com/

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
