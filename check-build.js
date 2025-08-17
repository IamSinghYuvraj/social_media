const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for build issues...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('❌ node_modules not found. Running npm install...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ node_modules found\n');
}

// Check TypeScript compilation
console.log('🔍 Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful\n');
} catch (error) {
  console.log('❌ TypeScript compilation failed:');
  console.log(error.stdout?.toString() || error.message);
  console.log('\n');
}

// Check Next.js build
console.log('🔍 Running Next.js build...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build failed:', error.message);
  process.exit(1);
}
