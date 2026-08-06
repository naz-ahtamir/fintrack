#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

// Use node to run next dev directly
const nextBin = path.join(__dirname, 'node_modules/.bin/next');
exec(`node "${nextBin}" dev -p 3001`, (error, stdout, stderr) => {
  console.log(stdout);
  if (stderr) console.error(stderr);
  if (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
});
