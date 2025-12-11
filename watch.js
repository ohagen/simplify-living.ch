#!/usr/bin/env node
/**
 * Simple file watcher - automatically rebuilds when templates or messages change
 * Pure Node.js - no dependencies required
 */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

let buildTimeout = null;

function build() {
  // Clear any pending build
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }
  
  // Debounce: wait 300ms for multiple rapid changes
  buildTimeout = setTimeout(() => {
    console.log('\n🔄 Rebuilding...');
    exec('node build.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Build failed:', error.message);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
      console.log('✅ Ready! Refresh your browser.\n');
    });
  }, 300);
}

function watchDirectory(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.html') || filename.endsWith('.json'))) {
      callback(filename);
    }
  });
}

console.log('👀 Watching for changes...');
console.log('📁 Watching: templates/, messages/');
console.log('🛑 Press Ctrl+C to stop\n');

// Watch both directories
watchDirectory('templates', (file) => {
  console.log(`📝 Changed: templates/${file}`);
  build();
});

watchDirectory('messages', (file) => {
  console.log(`📝 Changed: messages/${file}`);
  build();
});

// Initial build
build();

