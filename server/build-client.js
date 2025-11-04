const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  console.log('Starting client build process...');
  
  // Get the root directory (parent of server directory)
  const rootDir = path.join(__dirname, '..');
  const clientDir = path.join(rootDir, 'client');
  
  console.log('Root directory:', rootDir);
  console.log('Client directory:', clientDir);
  console.log('Current working directory:', process.cwd());
  
  // Verify client directory exists
  if (!fs.existsSync(clientDir)) {
    throw new Error(`Client directory not found at: ${clientDir}`);
  }
  
  console.log('Client directory exists');
  
  // Check if package.json exists in client directory
  const clientPackageJson = path.join(clientDir, 'package.json');
  if (!fs.existsSync(clientPackageJson)) {
    throw new Error(`Client package.json not found at: ${clientPackageJson}`);
  }
  
  console.log('Client package.json found');
  
  // Change to client directory
  console.log('Changing to client directory...');
  process.chdir(clientDir);
  console.log('Current directory after chdir:', process.cwd());
  
  // Install dependencies
  console.log('Installing client dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('Client dependencies installed');
  
  // Run build
  console.log('Building client application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Client build completed successfully');
  
} catch (error) {
  console.error('Build process failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}