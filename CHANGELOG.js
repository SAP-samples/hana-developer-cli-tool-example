import changelog from 'stringify-changelog'
let markdown = changelog("./CHANGELOG.json")

markdown = `# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

${markdown}`

import fs from 'fs'
fs.writeFileSync('./CHANGELOG.md', markdown)
