const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

try {
  logger.info('Starting client build process...');
  
  // Get the root directory (parent of server directory)
  const rootDir = path.join(__dirname, '..');
  const clientDir = path.join(rootDir, 'client');
  
  logger.info('Root directory:', rootDir);
  logger.info('Client directory:', clientDir);
  logger.info('Current working directory:', process.cwd());
  
  // Verify client directory exists
  if (!fs.existsSync(clientDir)) {
    throw new Error(`Client directory not found at: ${clientDir}`);
  }
  
  logger.info('Client directory exists');
  
  // Check if package.json exists in client directory
  const clientPackageJson = path.join(clientDir, 'package.json');
  if (!fs.existsSync(clientPackageJson)) {
    throw new Error(`Client package.json not found at: ${clientPackageJson}`);
  }
  
  logger.info('Client package.json found');
  
  // Change to client directory
  logger.info('Changing to client directory...');
  process.chdir(clientDir);
  logger.info('Current directory after chdir:', process.cwd());
  
  // Install dependencies
  logger.info('Installing client dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  logger.info('Client dependencies installed');
  
  // Run build
  logger.info('Building client application...');
  execSync('npm run build', { stdio: 'inherit' });
  logger.info('Client build completed successfully');
  
} catch (error) {
  logger.error('Build process failed:', error.message);
  logger.error('Stack trace:', error.stack);
  process.exit(1);
}