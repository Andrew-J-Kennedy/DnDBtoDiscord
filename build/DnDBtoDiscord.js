// ==UserScript==
// @namespace     https://openuserjs.org/users/Andrew-J-Kennedy
// @name          DnDBtoDiscord
// @description   DnD Beyond to Discord Integration
// @author        Andrew-J-Kennedy
// @copyright     2020, Andrew-J-Kennedy (https://openuserjs.org/users/Andrew-J-Kennedy)
// @license       MIT
// @version       0.2.9
// @match         https://www.dndbeyond.com/encounters/*
// @match         https://www.dndbeyond.com/profile/*/characters/*
// @match         https://www.dndbeyond.com/characters/*
// @require       file:///opt/DnDBtoDiscord/DnDBtoDiscordPrivate.js
// @require       file://C:/DnDBtoDiscordPrivate.js

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

        // Only embed alias DiscordId when sending to Avrae Bot or different from DiscordIdBot
        var embed = ((content.substr(0,1) === pre) || (DiscordIdCurrent != DiscordIdBot));

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
function statBlock (e) {
    console.log('statBlock(e)')
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
function rollSave (e) {
    console.log('rollSave(e)')
    var classname = 'ct-saving-throws-summary__ability';
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
function initToggle (e) {
    init = (init === 'On') ? 'Off' : 'On';
    e.target.innerText = 'Init ' + init;
}
////////////////////////////////////////////////////////////////////////////////
function rollInitative (e) {
    var sendMsg = (init === 'On') ? '!init join' : '!check initiative';
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
    sendMsgFinal = sendMsgFinal.replace(/^[^a-zA-Z0-9 ]/,pre);

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
        if (init === 'On') {
            var target = prompt("Please enter your target:" );
            if (target){
                sendMsgFinal = sendMsgFinal.replace('$2',target);
            } else {
                sendMsgFinal = null;
            }
        } else { // Remove targeting parameter if init system off
            sendMsgFinal = sendMsgFinal.replace('-t $2','');
            var args = prompt("Please enter and extra args:" );
            if (target){
                sendMsgFinal = sendMsgFinal + ' ' + args;
            }
        }
    }
    if (sendMsg.includes('init ') && init === 'Off') { // Remove init argument if init system off
        sendMsgFinal = sendMsgFinal.replace('init ','');
    }
    console.log(sendMsgFinal);
    sendMessage(sendMsgFinal,DiscordIdOverride);
}
////////////////////////////////////////////////////////////////////////////////
    function addNewEventListeners(start = 0) {
        console.log('addNewEventListeners');
        const data = {
         encounters: [
            //classname                         ,type     ,logMessage     ,override  ,function
            ['qa-init_begin'                    ,'click'  ,'start'        ,true      ,function(e){sendToAvrea(e,'!init begin',null,DiscordIdBot);}],
            ['qa-init_madd'                     ,'click'  ,'add mob'      ,true      ,function(e){addMobs(e);}],
            ['qa-init_next'                     ,'click'  ,'next'         ,true      ,function(e){sendToAvrea(e,'!init next',null,DiscordIdBot);}],
            ['qa-init_list'                     ,'click'  ,'list'         ,true      ,function(e){sendToAvrea(e,'!init list',null,DiscordIdBot);}],
            ['qa-init_end'                      ,'click'  ,'end'          ,true      ,function(e){sendToAvrea(e,'!init end -yes',null,DiscordIdBot);}],
            ['qa-chat'                          ,'click'  ,'chat'         ,true      ,function(e){freeText(e,DiscordIdBot);}],
            ['qa-chat_bot'                      ,'click'  ,'chat bot'     ,true      ,function(e){sendToAvrea(e,null,null,DiscordIdBot);}],
            ['encounter-details-monster'        ,'click'  ,'monster'      ,true      ,function(e){selectMobs(e);}]
        ]
        ,characters: [
            //classname                         ,type     ,logMessage     ,override  ,function
            ['ct-tab-list__nav-item'            ,'click'  ,'refresh lstnr',false     ,function(){addNewEventListeners(1)}],
            ['ct-tab-options__header-heading'   ,'click'  ,'refresh lstnr',false     ,function(){addNewEventListeners(2)}],
            ['ct-free_text'                     ,'click'  ,'free text'    ,true      ,function(e){freeText(e);}],
            ['ct-init_toggle'                   ,'click'  ,'init toggle'  ,true      ,function(e){initToggle(e);}],
            ['ct-character-tidbits__avatar'     ,'click'  ,'next'         ,true      ,function(e){sendToAvrea(e,'!init next',null);}],
            ['ct-saving-throws-summary__ability','click'  ,'save'         ,true      ,function(e){rollSave(e);}],
            ['ct-initiative-box'                ,'click'  ,'initiative'   ,true      ,function(e){rollInitative(e);}],
            ['ct-combat-attack--item'           ,'click'  ,'attack'       ,true      ,function(e){sendToAvrea(e,'!attack $1 -t $2','self');}],
            ['ct-combat-action-attack-weapon'   ,'click'  ,'attack'       ,true      ,function(e){sendToAvrea(e,'!attack $1 -t $2','self');}],
            ['ct-combat-attack--spell'          ,'click'  ,'cast'         ,true      ,function(e){sendToAvrea(e,'!cast $1 -t $2'  ,'self');}],
            ['ct-skills__item'                  ,'click'  ,'check(skill)' ,true      ,function(e){rollSkill(e);}]
//          ['ct-skills__item'                  ,'click'  ,'check(skill)' ,true      ,function(e){sendToAvrea(e,'!check $1'       ,'self');}]
        ]
        };
        for (var i = start; i < data[page].length; i++) {
            console.log(data[page][i]);
            var classname = data[page][i][0];
            var etype = data[page][i][1];
            var logMsg = data[page][i][2];
            var override = data[page][i][3];
            var func = data[page][i][4];
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
    function checkNode (searchType,searchTerm) {
        var e,els,len;
        switch (searchType) {
            case 'id':
                e = document.getElementById(searchTerm);
                if (e) {len = 1};
                break;
            case 'class':
                els = document.getElementsByClassName(searchTerm);
                if (els) {e = els[0];len=els.length};
                break;
        }
        console.log(searchTerm + ': ' + len);
        addNewMutationObserverTest(searchTerm,e,function(){alert('foo');});
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
    function main() {
        console.log('main');
        var text;
        // Get the Discord Info from Tooltips or Encounter Descr
        switch (page) {
            case 'characters':
                var tooltips = document.getElementsByClassName('ct-tooltip');
                for (var i = 0; i < tooltips.length; i++) {
                    if (tooltips[i].innerText.match(/^Discord/)) {
                        text = tooltips[i].getAttribute('data-original-title');
                        break;
                    }
                }
                break;
            case 'encounters':
                text = document.getElementsByClassName('encounter-details-content-section__content');
                text = (text.length > 0 ) ? text[1].innerText : 'null';
                text = (text.match(/Discord=\{[\s\S]*\}/)) ? text.replace(/[\s\S]*Discord=\{([\s\S]*)\}[\s\S]*$/m,'$1') : null;
                break;
        }
        if (! text) {console.log('DiscordServer,DiscordName Not Found');return}
        console.log('text: ' + text);
        text = text.replace(/^"(.+(?="$))"$/, '$1'); // Remove and quotes
        console.log('text: ' + text);
        var values = text.split(',');
        const DiscordServerName = values[0];
        const DiscordIdName = values[1];
        console.log(`DiscordServerName,DiscordIdName Found: ${DiscordServerName},${DiscordIdName}`);
        var DiscordServer;
        for (let rec of DiscordIds)     {if (DiscordIdName     === rec.name) {DiscordId = rec.id}}
        for (let rec of DiscordServers) {if (DiscordServerName === rec.name) {DiscordServer = rec.settings}}
        DiscordIdBot = DiscordServer.webhook.split('/')[0];
        pre = DiscordServer.pre;
        uri = 'https://discordapp.com/api/webhooks/' + DiscordServer.webhook;

        init = (DiscordServer.init === 1 || page === 'encounters') ? 'On' : 'Off';

//        console.log('DiscordIdBot: ' + DiscordIdBot);
//        console.log('pre: ' + pre);
//        console.log('uri: ' + uri);

        // Username and Avatar details
        switch (page) {
            case 'characters':
                DiscordIdDefault = DiscordId;
                username = document.getElementsByClassName('ct-character-tidbits__name')[0].innerText;
                avatar_url = document.getElementsByClassName('ct-character-tidbits__avatar')[0].style.backgroundImage.replace(/url\("(.*)"\)/, '$1') ;
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
                    ['ct-init_toggle'                ,'Init ' + init],
                    ['ct-free_text'                  ,'Free Text']
                ]
            }
        };
        if (data[page].buttons.length > 0) {
            const parentNode = document.getElementsByClassName(data[page].parentNode)[0];\
            if (parentNode) {
                var tpn = document.createElement('div');
                tpn.innerHTML = data[page].template;
                for (var i = 0; i < data[page].buttons.length; i++) {
                    console.log(data[page].buttons[i]);
                    var classname = data[page].buttons[i][0];
                    var text = data[page].buttons[i][1];
                    var pn = tpn.cloneNode(true);
                    pn.childNodes[0].classList.add(classname);
                    pn.getElementsByClassName('dndb2d_text-here')[0].innerText = text
                    parentNode.appendChild(pn.childNodes[0]);
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
    var DiscordIdBot;
    var DiscordIdDefault;
    var username;
    var avatar_url;
    var pre;
    var uri;
    var init;

    const page = (window.location.href.match(/characters/)) ? 'characters' : 'encounters';
    const pg = (page === 'characters') ? 'chr' : 'enc';  //Abbreviated form
    console.log("DnD Beyond to Discord Integration: " + page);
    // Wait for the Encounter/Character Sheet to load
    const dt = {
        enc: {
            pn: 'encounter-builder-root',  
            cn: 'encounter-details__body',
            tc: 'encounter-details-content-section__content'
        },
        chr: {
            pn: 'character-sheet-target',
            cn: 'ct-character-sheet-desktop',
            tc: 'ct-tooltip'

        }
    };
    
    if (document.getElementsByClassName(dt[pg].tc)) {
        console.log('launch sleep 2000')
        sleep(2000,function(){main();});
    } else {
        console.log('launch with MutationObserver')
        addNewMutationObserver(document.getElementById(dt[pg].pn),dt[pg].cn,function(){main();});
    }
    return;
//   checkNode('class','container');
//   checkNode('id'   ,'content');
//   checkNode('class','primary-content');
//   checkNode('id'   ,'character-sheet-target');
//   checkNode('class','ct-character-sheet');
//   addNewMutationObserver(document.getElementById('encounter-builder-root'),'encounter-details__body',function(){main();});
//   checkNode('class','container');
//   checkNode('id'   ,'content');
//   checkNode('class','primary-content');
//   checkNode('id'   ,'character-sheet-target');
//   checkNode('id'   ,'encounter-builder-root');
//   checkNode('class','encounter-details');
//   checkNode('class','encounter-details__body');
//   checkNode('class','encounter-details__content'); 
})();
/*
/**/
