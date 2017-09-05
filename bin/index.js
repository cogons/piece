#! /usr/bin/env node

const program = require('commander')
const process = require('process');
const fs = require('fs')
const assert = require('assert');
const path = require('path')
const execSync = require('child_process').execSync;
const config = require('../config.json')



program
    .allowUnknownOption()
    .usage(' <command>')

program
    .command('version')
    .action(() => console.log(require('../package.json').version))

program
    .command('init [file]')
    .alias('i')
    .option("-t, --tag [tag]", "Which setup mode to use")
    .option("-f, --force", "If file exists, open it anyway")
    //.option("-r, --raw", "Do not attach default extension")
    .action(function(file_, options) {
        try {
            let tag = options.tag || 'default'
            let folder = config.path[tag]
            let ext = config.ext[tag]
            let filename = file_ || defaultFilename()
            if(tag == 'default') assert(fs.existsSync(folder), 'set default first')
            else assert(fs.existsSync(folder), 'tag does not exist')
            //if(!options.raw) filename += "."+ext
            if(filename.indexOf('.')==-1 && ext) filename += "."+ext
            let file = path.resolve(folder, filename)
            //if(!options.force) assert(!fs.existsSync(file), 'file does exist')
            execSync('touch ' + file)
            execSync('code ' + file)
            console.log(file)

        } catch (e) {
            console.log(e.message || e)
            return false;
        }
    })

program
    .command('tag [tag]')
    //.alias('t')
    .option("-e, --extension [ext]", "Specfy a default file extension")
    .option("-f, --force", "Replace the old one")
    .action(function(tag, options) {
        try {
            if(options.force) assert(!config.path[tag], 'change tag or use -f')
            config.path[tag]=process.cwd()
            config.ext[tag]=options.extension || ""
            updateConfig(config)
        } catch (e) {
            console.log(e.message)
            return false;
        }
    })

program
    .command('default')
    //.alias('t')
    .action(function() {
        try {
            let tag = "default"
            config.path[tag] = process.cwd()
            config.ext[tag] = ""
            updateConfig(config)
        } catch (e) {
            console.log(e.message)
            return false;
        }
    })

program
    .command('ls-tag')
    .action(function() {
        try {
            console.log(config)
        } catch (e) {
            console.log(e.message)
            return false;
        }
    })

program
    .command('open [tag]')
    .alias('o')
    .action(function(tag='default') {
        try {
            assert(config.path[tag], 'tag does not exist')
            execSync('open '+config.path[tag])
            // let result = fs.readdirSync(config[tag]);
            // result.forEach(r => console.log(r))
        } catch (e) {
            console.log(e.message)
            return false;
        }
    })

program
    .command('rm-tag [tag]')
    .action(function(tag) {
        try {
            assert(config.path[tag], 'no tag')
            delete config.path[tag]
            delete config.ext[tag]
            console.log(config)
            updateConfig(config)
        } catch (e) {
            console.log(e.message)
            return false;
        }
    })

program.parse(process.argv)


function updateConfig(config) {

    const configPath = path.resolve(__dirname, "../", "config.json")
    fs.writeFileSync(configPath, JSON.stringify(config))


}

function defaultFilename(){
    let date = new Date();
    return date.getFullYear()+"-"+(date.getMonth() + 1)+"-"+date.getDate()+"-"+date.getHours()+"-"+date.getMinutes()+"-"+date.getSeconds()
}