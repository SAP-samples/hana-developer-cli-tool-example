  
'use strict';
const updateNotifier = require('update-notifier')

// Run: $ node example

// You have to run this file two times the first time
// This is because it never reports updates on the first run
// If you want to test your own usage, ensure you set an older version

updateNotifier({
	pkg: {
		name: 'hana-cli',
		version: '2.202108.1'
	},
	updateCheckInterval: 0
}).notify({isGlobal: true})