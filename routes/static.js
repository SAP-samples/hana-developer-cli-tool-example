const path = require('path')
const express = require('express')

module.exports = (app) => {
    app.use('/ui', express.static(path.join(__dirname, '../app/resources')))
    app.use('/i18n', express.static(path.join(__dirname, '../_i18n')))
   
}