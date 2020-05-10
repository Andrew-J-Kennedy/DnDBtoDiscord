// ==UserScript==
// @namespace     https://openuserjs.org/users/Andrew-J-Kennedy
// @name          DnDBtoDiscord-Dev
// @description   DnD Beyond to Discord Integration
// @author        Andrew-J-Kennedy
// @copyright     2020, Andrew-J-Kennedy (https://openuserjs.org/users/Andrew-J-Kennedy)
// @license       MIT
// @version       0.3.5
// @match         https://www.dndbeyond.com/encounters/*
// @match         https://www.dndbeyond.com/profile/*/characters/*
// @match         https://www.dndbeyond.com/characters/*
// @require       https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant         GM_getValue
// @grant         GM_setValue
// @require       file:///opt/DnDBtoDiscord/DnDBtoDiscordPrivate.js

// @grant none
// ==/UserScript==

// ==OpenUserJS==
// @author Andrew-J-Kennedy
// ==/OpenUserJS==
/*
    Comments are important

/**/
(function() {
'use strict';
////////////////////////////////////////////////////////////////////////////////
function sendMessage(content, DiscordIdOverride = null) {
    if (! content) {return;}
    var DiscordIdCurrent = DiscordIdDefault;
    if (DiscordIdOverride) {DiscordIdCurrent = DiscordIdOverride;}

    // Only embed alias DiscordId when sending to Avrae Bot and different from DiscordIdBot
    var embed = ((content.substr(0,1) === pre) && (DiscordIdCurrent != DiscordIdBot));
//    console.log(content.substr(0,1) + ' === ' + pre);
//    console.log(DiscordIdCurrent + ' != ' + DiscordIdBot);

    var request = new XMLHttpRequest();
    request.open("POST", uri);
    request.setRequestHeader('Content-type', 'application/json');
    var params = {
        username: username,
        avatar_url: avatar_url,
        content: content,
        embeds: ( (embed) ? [{fields: [{name: 'alias',value: DiscordIdCurrent}]}] : null)
    }
    console.log(JSON.stringify(params))
    request.send(JSON.stringify(params));
}
////////////////////////////////////////////////////////////////////////////////
function addNewEventListenerFinal(e,logMsg,func) {
    if (logMsg) {console.log(logMsg);}
    if (func) {func(e);}
}
////////////////////////////////////////////////////////////////////////////////
function sleep(ms,cb) {
    var sleepms = setInterval(function() {
        cb();
        clearInterval(sleepms);
    },ms);
}
////////////////////////////////////////////////////////////////////////////////
function addNewEventListener(e,logMsg,override,func) {
    if (window.event.ctrlKey || ! override) {
        if (override) {
            event.stopImmediatePropagation();
            addNewEventListenerFinal(e,logMsg,func);
        } else {
            // Wait for others to complete
            sleep(100,function(){addNewEventListenerFinal(e,logMsg,func)});
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
function addNewEventListenerDelegate(logMsg,override,func) {
    return function(e){
        addNewEventListener(e,logMsg,override,func)
    }
}
////////////////////////////////////////////////////////////////////////////////
function selectMobs (e) {
    console.log('selectMobs(e)')
    var p = e.target.parentNode.parentNode;
    var classname = 'is-selected';
    if (p.classList.contains(classname)) {
        p.classList.remove('is-selected');
    } else {
        p.classList.add('is-selected');
    }
}
////////////////////////////////////////////////////////////////////////////////
function addMobs (e) {
    console.log('addMobs(e)')
    var elem = document.getElementsByClassName('encounter-details-monster is-selected');
    for (var j = 0; j < elem.length; j++) {
        var monster_name = elem[j].getElementsByClassName('encounter-details-monster__name')[0].innerText;
        var monster_abrv = monster_name.replace(/[^A-Z]/g,'');
        monster_abrv += monster_name.replace(/.*[A-Z]/,'');
        monster_abrv = monster_abrv.substring(0,3).toUpperCase() + '#';
        var sendMsgFinal = pre + 'init madd "' + monster_name + '" -name ' + monster_abrv;
        console.log(monster_name + ':' + monster_abrv);
//            sendToAvrea(e,sendMsgFinal);
        sendToAvrea(e,sendMsgFinal,null,DiscordIdBot);

    }    
}
////////////////////////////////////////////////////////////////////////////////
function findRelevantParent (el,classname) {
    
    while ( el.parentNode && el.parentNode.classList && ! el.classList.contains(classname)) {
        el = el.parentNode;
    }
    el = (el.classList.contains(classname)) ? el : null;
    return el;
}
////////////////////////////////////////////////////////////////////////////////
function rollSkill (e) {
    console.log('rollSkill(e)')

    var skill = e.target.innerText;
    var sendMsg = '!check ' + skill;

    if (window.event.shiftKey) {
        sendMsg = sendMsg + ' ' + prompt("Please enter additional args:" );
    }
    sendToAvrea(e,sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function getSignedNumber (el) {
    if (! el) {return '+0';}
    if (el.getElementsByClassName(md.cp + '-signed-number').length != 1) {return '+0';}
    var sign =  el.getElementsByClassName(md.cp + '-signed-number__sign')[0].innerText;
    var number = el.getElementsByClassName(md.cp + '-signed-number__number')[0].innerText;
    return sign + number;
}
////////////////////////////////////////////////////////////////////////////////
// Casts Attack Spell as a pre-configured Attack.  Use [ctrl]+[alt]+click to configure
function rollAttackSpell(e,classname) {
    console.log('rollAttackSpell(e,classname)')
    classname = classname.replace(/^\?\?/,md.cp);
    var p = findRelevantParent(e.target,classname);
    if (! p) {console.log('Classname not found: ' + classname);return}
    var spell_name = p.getElementsByClassName(md.cp + '-spell-name')[0].innerText;
    console.log('spell_name: ' + spell_name);
    var sendMsg;
    if (window.event.altKey) { // Configure Attack Spell as an attack
        var to_hit = getSignedNumber(p.getElementsByClassName(md.cp + '-combat-attack__tohit')[0]);
        console.log('to_hit: ' + to_hit);
        var damage = p.getElementsByClassName(md.cp + '-damage__value')[0].innerText;
        console.log('damage: ' + damage);
        var dmg_type = p.getElementsByClassName(md.cp + '-damage__icon')[0].getElementsByClassName(md.cp + '-tooltip ')[0].getAttribute('data-original-title');
        console.log('dmg_type: ' + dmg_type);
        sendMsg = pre + 'attack add "' + spell_name + '" -b ' + to_hit + ' -d ' + damage + '[' + dmg_type + ']';
    } else {
        sendMsg = pre + 'attack "' + spell_name + '"';
        if (init) {
            var target = prompt("Enter target and additional args:" );
            if (target){
                sendMsg = sendMsg + ' -t ' + target;
            } else {
                sendMsg = null;
            }
        } else {
            if (window.event.shiftKey) {
                var args = prompt("Enter additional args:" );
                sendMsg = sendMsg + ' ' + args;
            }
        }        
    }

    console.log(sendMsg);
    sendMessage(sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function rollAbility (e,classname) {
    console.log('rollTool(e)')
    classname = classname.replace(/^\?\?/,md.cp);

    var p = findRelevantParent(e.target,classname);
    if (! p) {console.log('Classname not found: ' + classname);return}
    var stat_name = p.getElementsByClassName(md.cp + '-ability-summary__label')[0].innerText;
    var stat = p.getElementsByClassName(md.cp + '-ability-summary__abbr')[0].innerText;
    console.log(stat_name + ' ' + stat);

    var common = {
        command: 'check',
        options: 'adv/dis -b [conditional bonus] -dc [dc] -mc [minimum roll] -rr [iterations]'
    };
    
    var sendMsg = pre + common.command + ' ' + stat_name;

    if (window.event.shiftKey) {
        var args = prompt("Enter options: " + common.options);
        sendMsg = sendMsg + ' ' + args;
    }
    var prep = ( /^[AEIOU]/.test(stat_name)) ? 'an ' : 'a ';
    sendMsg = sendMsg + ' -title "' + username + ' makes ' + prep + stat_name + ' check!"';
    console.log(sendMsg);
    sendMessage(sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function rollTool (e,classname) {
    console.log('rollTool(e)')
    classname = classname.replace(/^\?\?/,md.cp);

    var p = findRelevantParent(e.target,classname);
    if (! p) {console.log('Classname not found: ' + classname);return}
    var tool_name = p.innerText.replace(/, $/,'');
    console.log(tool_name);

    var common = {
        command: 'check',
        options: 'adv/dis -b [conditional bonus] -dc [dc] -mc [minimum roll] -rr [iterations]'
    };
    var tools = [
        {stat: 'dex',name: "Thieves' Tools"}
    ];
    var tool;
    for (let t of tools) {
        if (t.name === tool_name) {
            tool = t;
            break;
        }
    }
    if (! tool) {console.log('Tool not found: ' + tool_name);return}
    
    var sendMsg = pre + common.command + ' ' + tool.stat;

    if (window.event.shiftKey) {
        var args = prompt("Enter options: " + common.options);
        sendMsg = sendMsg + ' ' + args;
    }
    sendMsg = sendMsg + ' -b ' + prof_bonus + ' -title "' + username + ' uses ' +tool_name + '"';
    console.log(sendMsg);
    sendMessage(sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function rollSnippet (e,classname) {
    console.log('rollSnippet(e)')
    classname = classname.replace(/^\?\?/,md.cp);

    var p = findRelevantParent(e.target,classname);
    if (! p) {console.log('Classname not found: ' + classname);return}
    var snippet_name = p.innerText;
    var snippets = [
        {name: 'Divine Smite (Special)',
        command: 'smite',
        options: '[-l #] [-i] [-t target] [crit] [fiend|undead]'
     }
    ];
    var snippet;
    for (let s of snippets) {
        if (s.name === snippet_name) {
            snippet = s;
            break;
        }
    }
    if (! snippet) {console.log('Snippet not found: ' + snippet_name);return}

    var sendMsg = pre + snippet.command;

    if (window.event.shiftKey) {
        var args = prompt("Enter options: " + snippet.options);
        sendMsg = sendMsg + ' ' + args;
    }
    console.log(sendMsg);
    sendMessage(sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function rollAttack (e,classname) {
    console.log('rollAttack(e)')
    classname = classname.replace(/^\?\?/,md.cp);

    var p = findRelevantParent(e.target,classname);
    if (! p) {console.log('Classname not found: ' + classname);return}

    var attack_label = p.getElementsByClassName(md.cp + '-combat-attack__label')[0].innerText;
    var sendMsg = (init) ? pre + 'init attack ' : pre + 'attack ';

    if (window.event.altKey && p.getElementsByClassName(md.cp + '-damage--versatile').length > 0) {
        attack_label = '2-Handed ' + attack_label
    }
    sendMsg = sendMsg + attack_label;
    if (init) {
        var target = prompt("Enter target and additional args:" );
        if (target){
            sendMsg = sendMsg + ' -t ' + target;
        } else {
            sendMsg = null;
        }
    } else {
        if (window.event.shiftKey) {
            var args = prompt("Enter additional args:" );
            sendMsg = sendMsg + ' ' + args;
        }
    }        
    console.log(sendMsg);
    sendMessage(sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function rollSave (e,classname) {
    console.log('rollSave(e)')
    classname = classname.replace(/^\?\?/,md.cp);

    var p = findRelevantParent(e.target,classname);
    if (! p) {console.log('Classname not found: ' + classname);return}
    var save;
    for (let cn of p.classList) {
        if (cn.includes(classname + '--')) {
            save = cn.replace(classname + '--','');
        }
    }
    var sendMsg = '!save ' + save;
    if (window.event.shiftKey) {
        sendMsg = sendMsg + ' ' + prompt("Please enter additional args:" );
    }
    sendToAvrea(e,sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function rollInitative (e) {
    var sendMsg = (init) ? '!init join' : '!check initiative';
    sendToAvrea(e,sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function turnOver (e) {

    var msg = (window.event.shiftKey) ? prompt("Please enter message:" ) : 'Done';

    var sendMsg = (init) ? '!init next' : `!embed -thumb ${avatar_url} -desc '${msg}'`;
    sendToAvrea(e,sendMsg);
}
////////////////////////////////////////////////////////////////////////////////
function freeText (e,DiscordIdOverride = null) {
    var sendMsg = prompt("Please enter your message:" );
    if (sendMsg) {sendMessage(sendMsg,DiscordIdOverride);}
}
////////////////////////////////////////////////////////////////////////////////
function sendToAvrea (e,sendMsg,Arg1_innerText = null,DiscordIdOverride = null) {

    if (! sendMsg) {
        sendMsg = prompt("Please enter your message:");
    }

    var sendMsgFinal = sendMsg;
    // Replace first char (if non alphanumeric) with server Prefix
    sendMsgFinal = sendMsgFinal.replace(/^[^"a-zA-Z0-9 ]/,pre);

    if (Arg1_innerText) {
//        console.log(Arg1_innerText);
//        console.log(e.target);
        var Arg1;
        if (Arg1_innerText === 'self') {
            Arg1 = e.target.innerText.replace(/\.$/,'')
        } else {
            Arg1 = e.target.getElementsByClassName(Arg1_innerText)[0].innerText;
        }
        sendMsgFinal = sendMsgFinal.replace('$1',Arg1);
    }
    if (sendMsg.includes('-t $2')) {  // Target Required
        if (init) {
            var target = prompt("Please enter your target:" );
            if (target){
                sendMsgFinal = sendMsgFinal.replace('$2',target);
            } else {
                sendMsgFinal = null;
            }
        } else { // Remove targeting parameter if init system off
            sendMsgFinal = sendMsgFinal.replace('-t $2','');
            var args = prompt("Please enter any extra args:" );
            if (target){
                sendMsgFinal = sendMsgFinal + ' ' + args;
            }
        }
    }
    if (sendMsg.includes('init ') && ! init) { // Remove init argument if init system off
        sendMsgFinal = sendMsgFinal.replace('init ','');
    }
    console.log(sendMsgFinal);
    sendMessage(sendMsgFinal,DiscordIdOverride);
}
////////////////////////////////////////////////////////////////////////////////
function openConfig() {
    if (window.event.altKey) {
        GM_config.open();
    } else {
        gmcuid.open();
    }
}
////////////////////////////////////////////////////////////////////////////////
function addNewEventListeners(start = 0) {
    console.log('addNewEventListeners');
    const data = {
        encounters: [
        //classname                         ,type     ,logMessage      ,override  ,function
        ['qa-init_begin'                    ,'click'  ,'start'         ,true      ,function(e){sendToAvrea(e,'!init begin',null,DiscordIdBot);}],
        ['qa-init_madd'                     ,'click'  ,'add mob'       ,true      ,function(e){addMobs(e);}],
        ['qa-init_next'                     ,'click'  ,'next'          ,true      ,function(e){sendToAvrea(e,'!init next',null,DiscordIdBot);}],
        ['qa-init_list'                     ,'click'  ,'list'          ,true      ,function(e){sendToAvrea(e,'!init list',null,DiscordIdBot);}],
        ['qa-init_end'                      ,'click'  ,'end'           ,true      ,function(e){sendToAvrea(e,'!init end -yes',null,DiscordIdBot);}],
        ['qa-chat'                          ,'click'  ,'chat'          ,true      ,function(e){freeText(e,DiscordIdBot);}],
        ['qa-chat_bot'                      ,'click'  ,'chat bot'      ,true      ,function(e){sendToAvrea(e,null,null,DiscordIdBot);}],
        ['encounter-details-monster'        ,'click'  ,'monster'       ,true      ,function(e){selectMobs(e);}]
    ]
    ,characters: [
        //classname                         ,type     ,logMessage      ,override  ,function
        ['??-tab-list__nav-item'            ,'click'  ,'refresh lstnr' ,false     ,function(){addNewEventListeners(1)}],
        ['??-tab-options__header-heading'   ,'click'  ,'refresh lstnr' ,false     ,function(){addNewEventListeners(2)}],
        ['ct-free_text'                     ,'click'  ,'free text'     ,true      ,function(e){freeText(e);}],
        ['ct-config'                        ,'click'  ,'config'        ,true      ,function(e){openConfig();}],
        ['??-character-tidbits__avatar'     ,'click'  ,'next'          ,true      ,function(e){turnOver(e);}],
        ['ct-quick-info__ability'           ,'click'  ,'check(ability)',true      ,function(e){rollAbility(e,'ct-quick-info__ability');}],
        ['??-saving-throws-summary__ability','click'  ,'save'          ,true      ,function(e){rollSave(e,'??-saving-throws-summary__ability');}],
        ['ct-initiative-box'                ,'click'  ,'initiative'    ,true      ,function(e){rollInitative(e);}],
        ['??-combat-attack--item'           ,'click'  ,'attack'        ,true      ,function(e){rollAttack(e,'??-combat-attack--item');}],
        ['??-combat-action-attack-weapon'   ,'click'  ,'attack'        ,true      ,function(e){rollAttack(e,'??-combat-action-attack-weapon');}],
        ['??-combat-attack--spell'          ,'click'  ,'cast'          ,true      ,function(e){rollAttackSpell(e,'??-combat-attack--spell');}],
        ['ct-skills__item'                  ,'click'  ,'check(skill)'  ,true      ,function(e){rollSkill(e);}],
        ['??-tooltip'                       ,'click'  ,'check(tool)'   ,true      ,function(e){rollTool(e,'??-tooltip');}],
        ['ct-feature-snippet__heading'      ,'click'  ,'snippet'       ,true      ,function(e){rollSnippet(e,'ct-feature-snippet__heading');}]
    ]
    };
    for (var i = start; i < data[page].length; i++) {
        console.log(data[page][i]);
        var classname = data[page][i][0];
        var etype = data[page][i][1];
        var logMsg = data[page][i][2];
        var override = data[page][i][3];
        var func = data[page][i][4];
        classname = classname.replace(/^\?\?/,md.cp);
        var els = document.getElementsByClassName(classname);

        console.log(logMsg + ': ' + els.length);
        for (var j = 0; j < els.length; j++) {
            console.log(j + ':' + logMsg);
            els[j].addEventListener(etype, addNewEventListenerDelegate(logMsg,override,func), false);
        }
    }
} // addNewEventListeners
////////////////////////////////////////////////////////////////////////////////
function containsObject(obj, list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}    
////////////////////////////////////////////////////////////////////////////////
function addNewMutationObservers () {

    console.log('addNewMutationObservers');
    const data = {
        encounters: [
            {
                classname: 'encounter-details__content',
                type: 'click',
                logMessage: 'attack',
                override: true,
                func: function(e){sendToAvrea(e,'!init attack $1 -t $2','self');},
                cbn_cn0: 'encounter-details__content-section--monster-stat-block', // Mutation Node
                cbn_cn1: 'mon-stat-block__description-block-content', // Relevent Node
                cbn_tst_sib: {cn:'mon-stat-block__description-block-heading',text:'Actions'}, // Test sibling node
                find_target: {type: 'tag', name: 'strong'}
            }
        ],
        characters: [
        ]
    };
    for (var i = 0; i < data[page].length; i++) {
        console.log(data[page][i]);
        var jd = data[page][i]; // Job Details

        var targetNode = document.getElementsByClassName(jd.classname)[0];
        var config = { attributes: false, childList: true, subtree: true };
        var callback = function(mutationsList, observer) {
            for(let mutation of mutationsList) {
                if (mutation.addedNodes.length > 0) {
                    var node_f = []; // node found
                    for(let node_m of mutation.addedNodes) { 
                        if (node_m instanceof HTMLElement) {
                            if (node_m.classList.contains(jd.cbn_cn0)) { //Top Down (Relevant Node is below the Added Node)
                                for(let node_r of node_m.getElementsByClassName(jd.cbn_cn1)) {
                                    var tst_sib = (jd.cbn_tst_sib) ? node_r.parentNode.getElementsByClassName(jd.cbn_tst_sib.cn)[0] : null;
                                    if (tst_sib && tst_sib.innerText === jd.cbn_tst_sib.text ) {
                                        node_f.push(node_r);
                                    }
                                }
                            } else { // Bottom up (Added Nodes are inside the Relevant Node)
                                var tst_sib = (jd.cbn_tst_sib) ? node_m.parentNode.parentNode.getElementsByClassName(jd.cbn_tst_sib.cn)[0] : null;
                                if (tst_sib && tst_sib.parentNode === node_m.parentNode.parentNode && tst_sib.innerText === jd.cbn_tst_sib.text ) {
                                    if ( ! containsObject(node_m.parentNode, node_f)) {
                                        node_f.push(node_m.parentNode);
                                    }
                                }
                            }
                        }
                    }
                    for(let nf of node_f) {
//                            console.log('nf.classList: ' + nf.classList);
                        for(let e of nf.getElementsByTagName(jd.find_target.name)) {
//                                console.log('e.innerText: ' + e.innerText);
                            e.addEventListener(jd.type, addNewEventListenerDelegate(jd.logMessage,jd.override,jd.func), false);
                        }
                    }
                }
            }
        };
        var observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }
}
////////////////////////////////////////////////////////////////////////////////
function addNewMutationObserverTest (searchTerm,e,cb) {
    if (! e) {return;}
    const config = { attributes: false, childList: true, subtree: true };
    const callback = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.addedNodes.length > 0) {
                for(let node of mutation.addedNodes) {
                    if (node instanceof HTMLDivElement && node.classList.contains('encounter-details__body')) {
                        console.log(searchTerm + ': ' + node.classList);
                    }
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(e, config);
}
////////////////////////////////////////////////////////////////////////////////
// Main Mutation Observer - waiting for the page to fully load
function addNewMutationObserver (e,classname,cb) {
    if (! e) {console.log('undefined');return;}
    console.log('classname: ' + classname);
    const config = { attributes: false, childList: true, subtree: true };
    const callback = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.addedNodes.length > 0) {
                for(let node of mutation.addedNodes) {
//                      console.log(node);
                    if (node instanceof HTMLDivElement && (node.classList.contains(classname)||node.childNodes[0].classList.contains(classname))) {
//                          console.log('node: ' + node);
                        cb();
                    }
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(e, config);
}
////////////////////////////////////////////////////////////////////////////////
function configToGlobals () {
    WebHook = gmcuid.get('WebHook');
    DiscordId = gmcuid.get('DiscordId');
    DiscordIdBot = WebHook.split('/')[0];
    pre = gmcuid.get('ServerPrefix');
    uri = 'https://discordapp.com/api/webhooks/' + WebHook;
    init = (gmcuid.get('InitSystem')|| pg === 'enc') ? true : false;
}        
////////////////////////////////////////////////////////////////////////////////
function main(dt) {
    md = dt;  // main data

    console.log('main: ' + md.cp);
    configToGlobals();
    console.log('uri: ' + uri);

    // Username and Avatar details
    switch (page) {
        case 'characters':
            DiscordIdDefault = DiscordId;
            username = document.getElementsByClassName(md.cp + '-character-tidbits__name')[0].innerText;
            avatar_url = document.getElementsByClassName(md.cp + '-character-tidbits__avatar')[0].style.backgroundImage.replace(/url\("([^?"]*).*/, '$1') ;
            prof_bonus = parseInt(getSignedNumber(document.getElementsByClassName('ct-proficiency-bonus-box__value')[0]));
            break;
        case 'encounters':
            DiscordIdDefault = DiscordIdBot;
            username = 'DM';
            avatar_url = 'https://i.imgur.com/kLfuisi.png';
            break;
    }
    console.log('username: ' + username);
    console.log('DiscordId: ' + DiscordId);
    // Add any additional buttons
    const data = {
        encounters: {
            parentNode: 'ddb-page-header__controls',
            template: '<a class="ddbeb-button dndb2d_text-here"></a>',
            buttons: [
                //classname                      ,text
                ['qa-init_begin'                 ,'Start Fight'],
                ['qa-init_madd'                  ,'Add Mobs'],
                ['qa-init_next'                  ,'Next'],
                ['qa-init_list'                  ,'List'],
                ['qa-init_end'                   ,'End Fight'],
                ['qa-chat'                       ,'Chat'],
                ['qa-chat_bot'                   ,'Chat Bot']
            ]
        },
        characters: {
            parentNode: 'ct-character-header-desktop',
            template: '<div class="ct-character-header-desktop__group"><div class="ct-character-header-desktop__button"><span class="ct-character-header-desktop__button-label dndb2d_text-here"></span></div></div>',
            buttons: [
                //classname                      ,text
                ['ct-free_text'                  ,'Free Text'],
                ['ct-config'                     ,'Config']
            ]
        }
    };
    if (data[page].buttons.length > 0) {
        const parentNode = document.getElementsByClassName(data[page].parentNode)[0];
        if (parentNode) {
            var tpn = document.createElement('div');
            tpn.innerHTML = data[page].template;
            for (var i = 0; i < data[page].buttons.length; i++) {
                var classname = data[page].buttons[i][0];
                if (document.getElementsByClassName(classname).length == 0) {
                    console.log(data[page].buttons[i]);
                    var text = data[page].buttons[i][1];
                    var pn = tpn.cloneNode(true);
                    pn.childNodes[0].classList.add(classname);
                    pn.getElementsByClassName('dndb2d_text-here')[0].innerText = text
                    parentNode.appendChild(pn.childNodes[0]);
                }
            }
        }
    }
    // Add EventListeners and MutationObservers
    addNewEventListeners();
    addNewMutationObservers();
    return;  
} // main

// Script-wide variables
var DiscordId;
var WebHook;
var DiscordIdBot;
var DiscordIdDefault;
var username;
var avatar_url;
var pre;
var uri;
var init;
var md; // main data
var prof_bonus;

const page = (window.location.href.match(/characters/)) ? 'characters' : 'encounters';
const pg = (page === 'characters') ? 'chr' : 'enc';  //Abbreviated form
console.log("DnD Beyond to Discord Integration: " + page);

// Setup Configuration: Location to place the Config div and Unique Identifier
const cfg = {
    enc: {
        cn:  'mm-navbar__container',
        uid: window.location.href.replace(/[\s\S]*encounters\/([\s\S]*)$/,'$1')
    },
    chr: {
        cn: 'site-bar__container',
        uid: window.location.href.replace(/[\s\S]*characters\/([0-9]{8}[0-9]*)[\s\S]*$/,'$1')
    }
};

console.log(cfg[pg].uid);

var site_bar = document.getElementsByClassName(cfg[pg].cn)[0];
var frame0 = document.createElement('div');
var frame1 = document.createElement('div');
site_bar.appendChild(frame0);
site_bar.appendChild(frame1);

var GMconfigId0 = 'DnDBeyond2DiscordDefaults-0.0.1';
var GMconfig0 = {
    'id': GMconfigId0,
    'title': 'DnD Beyond to Discord Default Config Settings',
    'fields': {
        'ServerPrefix': {
            'label': 'Server Prefix',
            'type': 'text',
            'size': 1,
            'default': '!'
        },
        'InitSystem': {
            'label': 'Init System',
            'type': 'checkbox',
            'default': false
        },
        'WebHook': {
            'label': 'Discord Server WebHook',
            'type': 'text',
            'size': 87,
            'default': '00--WEBHOOK-URL-00/QWERTY------------------------RANDOM-KEY----------------------XCVBNM'
        },
        'DiscordId': {
            'label': 'Discord User Id',
            'type': 'text',
            'size': 18,
            'default': '000000000000000000'
        }
    },
    'events': {
        'init': function() {checkConfigDefaults();},
        'open': function() {
            var e = document.getElementById(GMconfigId0);
            e.classList.add('mm-mega-menu');
            e.classList.add('mm-nav-item__label');
        },
        'save': function() { setConfigDefaults(); },
    },
    'frame': frame0
};

function checkConfigDefaults () {
    if (GMconfig0.fields.WebHook.default === GM_config.get('WebHook') || GMconfig0.fields.DiscordId.default === GM_config.get('DiscordId') ) {
        GM_config.open();
    } else {
        setConfigDefaults();
    }
}
function setConfigDefaults () {
    GMconfig1 = {
        'id': GMconfigId1,
        'title': 'DnD Beyond to Discord Config Settings',
        'fields': {
            'ServerPrefix': {
                'label': 'Server Prefix',
                'type': 'text',
                'size': 1,
                'default': GM_config.get('ServerPrefix')
            },
            'InitSystem': {
                'label': 'Init System',
                'type': 'checkbox',
                'default': GM_config.get('InitSystem')
            },
            'WebHook': {
                'label': 'Discord Server WebHook',
                'type': 'text',
                'size': 87,
                'default': GM_config.get('WebHook')
            },
            'DiscordId': {
                'label': 'Discord User Id',
                'type': 'text',
                'size': 18,
                'default': GM_config.get('DiscordId')
            }
        },
        'events': {
            'save': function() { configToGlobals(); },
        },
        'frame': frame1
    };

    gmcuid = new GM_configStruct(GMconfig1);
    console.log('gmcuid DiscordId: ' + gmcuid.get('DiscordId'));

}

var GMconfigId1 = 'DnDBeyond2Discord-' + cfg[pg].uid;
var GMconfig1;
var gmcuid;
    
GM_config.init(GMconfig0);

// Wait for the Encounter/Character Sheet to load
const dt = {
    enc: [{
        pn: 'encounter-builder-root',  
        cn: 'encounter-details__body',
        cp: 'enc' //placeholder
    }],
    chr: [{
        pn: 'character-sheet-target',
        cn: 'ct-character-sheet-desktop',
        cp: 'ct' //classname prefix for some elements
    },{
        pn: 'character-tools-target',
        cn: 'ct-character-sheet-desktop',
        cp: 'ddbc' //classname prefix for some elements
    }]
};
console.log('launch with MutationObserver')
for (let d of dt[pg]) {
    addNewMutationObserver(document.getElementById(d.pn),d.cn,function(){main(d);});
}
})();
/*
/**/


