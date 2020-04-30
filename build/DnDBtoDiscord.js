// ==UserScript==
// @name         DnDBtoDiscord
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  DnD Beyond to Discord Integration
// @author       Andrew J Kennedy
// @match        https://www.dndbeyond.com/encounters/*
// @match        https://www.dndbeyond.com/profile/*/characters/*
// @grant        none
// @require      file://C:/DnDBtoDiscordPrivate.js
// ==/UserScript==
/*
    Comments are important

/**/
(function() {
    'use strict';
////////////////////////////////////////////////////////////////////////////////
    function sendMessage(content) {
        var embed = (content.substr(0,1) === pre) // only embed alias DiscordId when sending to Avrae Bot
        var request = new XMLHttpRequest();
        request.open("POST", uri);
        request.setRequestHeader('Content-type', 'application/json');
        var params = {
            username: username,
            avatar_url: avatar_url,
            content: content,
            embeds: ( (embed) ? [{fields: [{name: 'alias',value: DiscordId}]}] : null)
        }

        request.send(JSON.stringify(params));
    }
////////////////////////////////////////////////////////////////////////////////
    function addNewEventListenerFinal(e,logMsg,sendMsgFinal,TargetReq,func) {
        if (logMsg) {console.log(logMsg);}
        if (TargetReq) {
            var target = prompt("Please enter your target:" );
            if (target){
                sendMsgFinal = sendMsgFinal.replace('$2',target)
            } else {
                sendMsgFinal = null;
            }
        }
        if (sendMsgFinal) {
            sendMessage(sendMsgFinal);
        }
        if (func) {func(e);}
    }
////////////////////////////////////////////////////////////////////////////////
    function addNewEventListener(e,logMsg,sendMsgFinal,TargetReq,override,func) {
        if (window.event.ctrlKey || ! override) {
            if (override) {
                event.stopImmediatePropagation();
                addNewEventListenerFinal(e,logMsg,sendMsgFinal,TargetReq,func);
            } else {
                var sleep100ms = setInterval(function() {
                    addNewEventListenerFinal(e,logMsg,sendMsgFinal,TargetReq,func);
                    clearInterval(sleep100ms);
                },100); // Wait for others to complete
            }
        }
    }
////////////////////////////////////////////////////////////////////////////////
    function addNewEventListenerDelegate(logMsg,sendMsgFinal,TargetReq,override,func) {
        return function(e){
            addNewEventListener(e,logMsg,sendMsgFinal,TargetReq,override,func)
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
            sendMessage(sendMsgFinal);
        }
    }
////////////////////////////////////////////////////////////////////////////////
    function statBlock (e) {
        console.log('statBlock(e)')
    }
////////////////////////////////////////////////////////////////////////////////
    function freeText (e) {
        var sendMsg = prompt("Please enter your message:" );
        if (sendMsg) {sendMessage(sendMsg);}
    }
////////////////////////////////////////////////////////////////////////////////
    function addNewEventListeners(start) {
        console.log('addNewEventListeners');
        const data = [
        //   ['classname'                     ,'type'   ,'logMessage'   ,'sendMessage'      ,'Arg1_innerText'         ,'override','function']
             ['qa-init_begin'                 ,'click'  ,'start'        ,'!init begin'      ,null                     ,true      ,null]
            ,['qa-init_madd'                  ,'click'  ,'add mob'      ,null               ,null                     ,true      ,function(e){addMobs(e,pre);}]
            ,['qa-init_next'                  ,'click'  ,'next'         ,'!init next'       ,null                     ,true      ,null]
            ,['qa-init_list'                  ,'click'  ,'list'         ,'!init list'       ,null                     ,true      ,null]
            ,['qa-init_end'                   ,'click'  ,'end'          ,'!init end'        ,null                     ,true      ,null]
            ,['qa-free_text'                  ,'click'  ,'free text'    ,null               ,null                     ,true      ,function(e){freeText(e);}]
            ,['encounter-details-monster'     ,'click'  ,'monster'      ,null               ,null                     ,true      ,function(e){selectMobs(e);}]
        ];
        for (var i = start; i < data.length; i++) {
            console.log(data[i]);
            var classname = data[i][0];
            var etype = data[i][1];
            var logMsg = data[i][2];
            var sendMsg = data[i][3];
            var Arg1_innerText = data[i][4];
            var override = data[i][5];
            var func = data[i][6];
            var elem = document.getElementsByClassName(classname);

            console.log(elem.length);
            for (var j = 0; j < elem.length; j++) {
                console.log(j + ':' + logMsg);
                var sendMsgFinal = sendMsg;
                var TargetReq;
                if (sendMsg) {
                    sendMsgFinal = sendMsgFinal.replace(/^./,pre); // Replace with server Prefix
                    if (Arg1_innerText) {
                        var Arg1 = elem[j].getElementsByClassName(Arg1_innerText)[0].innerText;
                        console.log('Arg1: ' + Arg1);
                        sendMsgFinal = sendMsgFinal.replace('$1',Arg1);
                    }
                    TargetReq = (sendMsg.includes('-t $2'));
                    console.log(sendMsgFinal);
                }
                elem[j].addEventListener(etype, addNewEventListenerDelegate(logMsg,sendMsgFinal,TargetReq,override,func), false);
            }
        }
    } // addNewEventListeners
////////////////////////////////////////////////////////////////////////////////
    function addNewMutationObservers () {
        const targetNode = document.getElementsByClassName('encounter-details__content')[0];
        const config = { attributes: false, childList: true, subtree: true };
        const callback = function(mutationsList, observer) {
            for(let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    var elems = [];
                    var classname = 'mon-stat-block__description-block-content';
                    if (mutation.target.classList.contains('encounter-details__content')) {
                        elems = mutation.target.getElementsByClassName(classname);
                    } else if (mutation.target.classList.contains(classname)) {
                        elems.push(mutation.target);
                    }
                    for (var i = 0; i < elems.length; i++) {
                        if (elems[i].parentNode.childNodes[0].innerText === 'Actions') {
                            var e = elems[i].getElementsByTagName('strong');
                            for (var j = 0; j < e.length; j++) {
                                var sendMsg = pre + 'init attack "' + e[j].innerText.replace(/\.$/,'') + '" -t $2'
                                console.log(sendMsg);
                                e[j].addEventListener('click',addNewEventListenerDelegate('testing',sendMsg,true,true,null), false);
                            }
                        }
                    }
                }
            }
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
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
    function addNewMutationObserver (e,classname,cb) {
        if (! e) {console.log('undefined');return;}
        console.log('classname: ' + classname);
        const config = { attributes: false, childList: true, subtree: true };
        const callback = function(mutationsList, observer) {
            for(let mutation of mutationsList) {
                if (mutation.addedNodes.length > 0) {
                    for(let node of mutation.addedNodes) {
//                      console.log(node);
                        if (node instanceof HTMLDivElement && node.classList.contains(classname)) {
                            console.log('node: ' + node);
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
        const DiscordServer = text.replace(/([^,]*),([^,]*)/,'$1');
        const DiscordName = text.replace(/([^,]*),([^,]*)/,'$2');
        console.log('DiscordServer,DiscordName Found: ' + DiscordServer + ',' + DiscordName);

        DiscordId = DiscordIds[DiscordName];
        pre = DiscordServerSettings[DiscordServer][0];
        uri = 'https://discordapp.com/api/webhooks/' + DiscordServerSettings[DiscordServer][1];

        switch (page) {
            case 'characters':
                username = document.getElementsByClassName('ct-character-tidbits__name')[0].innerText;
                avatar_url = document.getElementsByClassName('ct-character-tidbits__avatar')[0].style.backgroundImage.replace(/url\("(.*)"\)/, '$1') ;
                break;
            case 'encounters':
                username = 'DM';
                avatar_url = 'https://i.imgur.com/kLfuisi.png';
                var header_controls = document.getElementsByClassName('ddb-page-header__controls')[0];
                const data = [
                    //   ['classname'                     ,'text'       ]
                         ['qa-init_begin'                 ,'Start Fight']
                        ,['qa-init_madd'                  ,'Add Mobs']
                        ,['qa-init_next'                  ,'Next']
                        ,['qa-init_list'                  ,'List']
                        ,['qa-init_end'                   ,'End Fight']
                        ,['qa-free_text'                  ,'Free Text']
                    ];
                for (var i = 0; i < data.length; i++) {
                    console.log(data[i]);
                    var classname = data[i][0];
                    var text = data[i][1];
                    var btn = document.createElement('a');
                    btn.setAttribute('class',classname + ' ddbeb-button');
                    btn.innerText = text
                    header_controls.appendChild(btn);
                }
                break;
        }
        console.log('username: ' + username);
        addNewEventListeners(0);
        addNewMutationObservers();
        return;  
    } // main
    var DiscordId;
    var username;
    var avatar_url;
    var pre;
    var uri;

    const page = (window.location.href.match(/characters/)) ? 'characters' : 'encounters';
    console.log("DnD Beyond to Discord Integration: " + page);
    // Wait for the Encounter Sheet to load
    switch (page) {
        case 'characters':
            addNewMutationObserver(document.getElementById('character-sheet-target'),'ct-character-sheet-tablet',function(){main();});
            break;
        case 'encounters':
            addNewMutationObserver(document.getElementById('encounter-builder-root'),'encounter-details__body',function(){main();});
            break;
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
