const changelog = require('stringify-changelog')
let markdown = changelog("./CHANGELOG.json")

markdown = `# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

${markdown}`

const fs = require("fs")
fs.writeFileSync('./CHANGELOG.md', markdown)
