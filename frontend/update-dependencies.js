// update-dependencies.js
const { execSync } = require('child_process');

const packagesToUpdate = [
  'rimraf@latest',
  'glob@latest',
  'abab@latest',
  'source-map@latest',
  'eslint@latest',
  'react-instantsearch-dom@latest',
  'workbox-cacheable-response@latest',
  'workbox-google-analytics@latest',
  '@babel/plugin-proposal-private-methods@latest',
  '@babel/plugin-proposal-class-properties@latest',
  '@babel/plugin-proposal-optional-chaining@latest',
  '@babel/plugin-proposal-nullish-coalescing-operator@latest',
  '@babel/plugin-proposal-numeric-separator@latest'
];

console.log('Updating deprecated packages...');
packagesToUpdate.forEach(pkg => {
  try {
    execSync(`npm install ${pkg}`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`Failed to update ${pkg}, might not be in dependencies`);
  }
});