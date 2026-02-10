#!/usr/bin/env node

import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const outputFile = join(rootDir, 'test-output.txt');

// Create write stream for the output file
const logStream = createWriteStream(outputFile, { flags: 'w' });

const child = spawn('npm', ['test'], {
    cwd: rootDir,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env },
    detached: false
});

child.stdout.on('data', (data) => {
    logStream.write(data);
});

child.stderr.on('data', (data) => {
    logStream.write(data);
});

const cleanup = (code) => {
    logStream.end();
    // Force close all streams
    if (child.stdout) child.stdout.destroy();
    if (child.stderr) child.stderr.destroy();
    console.log(`Test output saved to test-output.txt (exit code: ${code})`);
    // Force exit immediately
    process.exit(code);
};

child.on('exit', (code) => {
    cleanup(code || 0);
});

child.on('error', (err) => {
    console.error('Failed to start test process:', err);
    cleanup(1);
});
