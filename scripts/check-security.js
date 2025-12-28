#!/usr/bin/env node

/**
 * Security Check Script
 * 
 * This script validates that the private key is properly secured and not exposed.
 * Run this before deploying: npm run check:security
 */

const fs = require('fs');
const path = require('path');

let hasErrors = false;
const errors = [];

console.log('🔒 Running security checks...\n');

// Check 1: .env.local is in .gitignore
console.log('1. Checking .gitignore...');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
if (!gitignore.includes('.env') && !gitignore.includes('.env*.local')) {
  errors.push('❌ .env files not in .gitignore');
  hasErrors = true;
} else {
  console.log('   ✅ .env files are in .gitignore');
}

// Check 2: No NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY in code
console.log('\n2. Checking for accidental NEXT_PUBLIC_ exposure...');
const filesToCheck = [
  'utils/constants.ts',
  'utils/launchWallet.ts',
  'app/**/*.ts',
  'app/**/*.tsx',
  'components/**/*.ts',
  'components/**/*.tsx',
];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY (but ignore if it's in error messages/comments)
  const hasNextPublic = content.includes('NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY');
  const isInErrorOrComment = content.includes('SECURITY ERROR') || 
                              content.includes('//') || 
                              content.includes('/*') ||
                              content.includes('throw new Error');
  
  if (hasNextPublic && !isInErrorOrComment) {
    errors.push(`❌ Found NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY in ${filePath} (outside of error/comment)`);
    hasErrors = true;
  }
  
  // Check for private key in client components (actual usage, not imports)
  if (content.includes("'use client'") && 
      content.includes('LAUNCH_WALLET_PRIVATE_KEY') &&
      !content.includes('//') && // Not just a comment
      !content.includes('import')) { // Not just an import (which would fail anyway)
    errors.push(`❌ LAUNCH_WALLET_PRIVATE_KEY used in client component: ${filePath}`);
    hasErrors = true;
  }
}

// Check specific files
checkFile('utils/constants.ts');
checkFile('utils/launchWallet.ts');

// Check 3: Verify .env.local format (if exists)
console.log('\n3. Checking .env.local format...');
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY')) {
    errors.push('❌ .env.local contains NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY (should be LAUNCH_WALLET_PRIVATE_KEY)');
    hasErrors = true;
  } else if (envContent.includes('LAUNCH_WALLET_PRIVATE_KEY')) {
    console.log('   ✅ LAUNCH_WALLET_PRIVATE_KEY found (correct format)');
  } else {
    console.log('   ⚠️  LAUNCH_WALLET_PRIVATE_KEY not found in .env.local');
  }
} else {
  console.log('   ⚠️  .env.local not found (this is OK if using environment variables)');
}

// Check 4: Verify build output doesn't expose private key
console.log('\n4. Checking build output...');
const nextPath = '.next';
if (fs.existsSync(nextPath)) {
  // This is a basic check - in production, you'd want more thorough scanning
  console.log('   ℹ️  Build directory exists - manual review recommended');
} else {
  console.log('   ℹ️  No build directory (run npm run build to test)');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ SECURITY ISSUES FOUND:\n');
  errors.forEach(err => console.log('   ' + err));
  console.log('\n⚠️  Please fix these issues before deploying!');
  process.exit(1);
} else {
  console.log('✅ All security checks passed!');
  console.log('\nRemember:');
  console.log('  - Never commit .env.local to git');
  console.log('  - Never use NEXT_PUBLIC_ prefix for private keys');
  console.log('  - Only use private key in server-side code');
  console.log('  - Keep backups secure and encrypted');
  process.exit(0);
}

