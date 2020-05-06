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
        if (init === 'On') {
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
    
    var sendMsg = pre + common.command + ' ' + stat;

    if (window.event.shiftKey) {
        var args = prompt("Enter options: " + common.options);
        sendMsg = sendMsg + ' ' + args;
    }
    sendMsg = sendMsg + ' -title "' + username + ' checks ' + stat_name + '"';
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

    var sendMsg = (init === 'On') ? pre + 'init attack ' : pre + 'attack ';

    if (window.event.altKey && p.getElementsByClassName(md.cp + '-damage--versatile').length > 0) {
        attack_label = '2-Handed ' + attack_label
    }
    sendMsg = sendMsg + attack_label;

    if (init === 'On') {
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
function turnOver (e) {

    var msg = (window.event.shiftKey) ? prompt("Please enter message:" ) : 'Done';

    var sendMsg = (init === 'On') ? '!init next' : `!embed -thumb ${avatar_url} -desc '${msg}'`;
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
        if (init === 'On') {
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
            ['ct-init_toggle'                   ,'click'  ,'init toggle'   ,true      ,function(e){initToggle(e);}],
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
function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;
    
    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }
    
    return os;
}
////////////////////////////////////////////////////////////////////////////////
function checkElementExists(classnames,innerText = null,cb,timeout = 100) {  // wait for ten seconds
    var counter = 0;
    var found;
    var checkExist = setInterval(function() {
        for (let classname of classnames) {
            var els = document.getElementsByClassName(classname);
            if (els.length > 0) {
                if (! innerText) {
                    found = true;
                } else {
                    for (var i = 0; i < els.length; i++) {
                        if (els[i].innerText.match(innerText)) {
                            found = true;
                            break;
                        }
                    }
                }
            }
        }
        counter++;
        if (counter > timeout) {
            found = false;
        }
        if (typeof found === 'boolean') {
            clearInterval(checkExist);
            if (found) {
                cb();
            } else {
                console.log('Element not found');
            }
        }
    }, 100); // check every 100ms
}
////////////////////////////////////////////////////////////////////////////////
    function main(dt) {
        md = dt;  // main data

        console.log('main: ' + md.cp);
        var text;
        // Get the Discord Info from Tooltips or Encounter Descr
        switch (pg) {
            case 'chr':
                for (let el of document.getElementsByClassName(md.cp + '-tooltip')) {
                    if (el.innerText.match(/^Discord/)) {
                        text = el.getAttribute('data-original-title');
                        break;
                    }
                }
                break;
            case 'enc':
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
                username = document.getElementsByClassName(md.cp + '-character-tidbits__name')[0].innerText;
                avatar_url = document.getElementsByClassName(md.cp + '-character-tidbits__avatar')[0].style.backgroundImage.replace(/url\("(.*)"\)/, '$1') ;
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
                    ['ct-init_toggle'                ,'Init ' + init],
                    ['ct-free_text'                  ,'Free Text']
                ]
            }
        };
        if (data[page].buttons.length > 0) {
            const parentNode = document.getElementsByClassName(data[page].parentNode)[0];
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
    var md; // main data
    var prof_bonus;

    const page = (window.location.href.match(/characters/)) ? 'characters' : 'encounters';
    const pg = (page === 'characters') ? 'chr' : 'enc';  //Abbreviated form
    console.log("DnD Beyond to Discord Integration: " + page);

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
    return;
})();
/*
/**/
