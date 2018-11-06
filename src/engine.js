const {JSONPath} = require('jsonpath-plus');
const fs = require('fs');
const hash = require('object-hash');
const BigQuery = require('@google-cloud/bigquery');

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

