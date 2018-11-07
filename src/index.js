import "regenerator-runtime/runtime";
import React, { Component } from 'react';
import SysTray from 'systray';
import fs from "fs";
import { render, Window, App, Box, TextInput, Menu } from 'proton-native';
const {JSONPath} = require('jsonpath-plus');
const hash = require('object-hash');
const BigQuery = require('@google-cloud/bigquery');
const find = require('find-process');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const defConfig = {

};
const defConfigFilePath = "./config.json";
const optionDefinitions = [
  { 
    name: 'configFile',
    alias: 'c',
    type: String, 
    multiple: false, 
    defaultOption: true,
    defaultValue: defConfigFilePath
  },
  { 
    name: 'help',
    type: Boolean,
    multiple: false,
    defaultOption: false
  }
];
const usageDefinitions = [
  {
    header: 'Guild Activity Stats',
    content: 'Monitors ESOGuildActivity saved variables and pushes them to Google BigQuery.'
  },
  {
    header: 'Options',
    optionList: [
      { 
        name: 'configFile',
        typeLabel: '{underline file}', 
        description: 'The configuration file to read. Default: ' + defConfigFilePath 
      },
      { 
        name: 'help', 
        description: 'Print this usage guide.' 
      }
    ]
  }
];
const options = commandLineArgs(optionDefinitions);
const usage = commandLineUsage(usageDefinitions);
const systrayMenu = {
  // you should using .png icon in macOS/Linux, but .ico format in windows
  icon: new Buffer(fs.readFileSync("img/icon.ico")).toString('base64'),
  title: "Guild Activity Stats",
  tooltip: "Guild Activity Stats",
  items: [{
      title: "Settings",
      tooltip: "Guild Activity Stats Settings",
      enabled: true
  }, {
      title: "Exit",
      tooltip: "Quits Guild Activity Stats.",
      enabled: true
  }]
};
const systray = new SysTray({
    menu: systrayMenu,
    debug: false,
    copyDir: true
})

function updateTooltip(stri) {
  systrayMenu.tooltip = stri;
  systray.sendAction({
    type: 'update-menu',
    menu: systrayMenu
  });
}

let oldState = null;
let newState = null;
let mainLoopTimer = null;
let firstIteration = true;
let config = null;

function lsonToObject(fileName) {
  return JSONPath({path: '$..onlines', json: JSON.parse(
    fs.readFileSync(fileName, 'utf-8')
    .replace('GuildActivityDB =', '')
    .replace(/\[(.*)\]\s\=\s/g,'$1:')     // change equal to colon & remove outer brackets
    .replace(/[\t\r\n]/g,'')              // remove tabs & returns
    .replace(/\}\,\s--\s\[\d+\]\}/g,']]') // replace sets ending with a comment with square brackets
    .replace(/\,\s--\s\[\d+\]/g,',')      // remove close subgroup and comment
    .replace(/,\s*(\}|\])/g,'$1')         // remove trailing comma
    .replace(/\}\,\{/g,'],[')             // replace curly bracket set with square brackets
    .replace(/\{\{/g,'[[')                // change double curlies to square brackets
    .replace(/(\d+)\s*:/, '"$1":')        // remove variable definition
  ), wrap: false});
}

function getObjHash(obje) {
  return hash(obje, {respectType: false, unorderedArrays: true, respectFunctionNames: false, respectFunctionProperties: false, ignoreUnknown: true, algorithm: "sha1"});
}

function getJsonHash(jsonstr) {
  return JSON.parse(hash(obje, {respectType: false, unorderedArrays: true, respectFunctionNames: false, respectFunctionProperties: false, ignoreUnknown: true, algorithm: "sha1"}));
}

async function isEsoRunning() {
  let runn = await find('name', 'eso64', true);
  return runn.length > 0;
}

async function mainLoop() {
  oldState = newState;
  newState = await isEsoRunning();
  console.log(`newState: ${newState}; oldState: ${oldState}`);
  if(firstIteration || (newState == false && oldState == true)) {
    console.log("Running.");

  }

  firstIteration = false;
}

async function setupEngine() {
  if(!fs.existsSync(options.configFile)) {
    console.log("Config file doesn't exist: " + options.configFile);
    console.log(usage);
  }
  else {
    config = require(options.configFile);
    await mainLoop();
    mainLoopTimer = setInterval(mainLoop, 60000);
  }
}

systray.onClick(action => {
    if (action.seq_id === 0) {
      console.log("Settings Clicked!");
    } else if (action.seq_id === 1) {
      systray.kill();
    }
});

const stop = ()=>{
  systray.kill(false);
};

class Example extends Component {
  render() {
    return (
      <App onShouldQuit={stop}>
        <Menu>
          <Menu.Item type="Quit"/>
        </Menu>
        <Window onClose={stop} title="Proton Native Rocks!" size={{w: 400, h: 400}} menuBar={false}>
            <Box>
            	<TextInput>Hi</TextInput>
            </Box>
        </Window>
      </App>
    );
  }
}

setupEngine();
render(<Example />);