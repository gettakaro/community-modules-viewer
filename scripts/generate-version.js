const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Get the short commit hash as fallback
  const commitHash = execSync('git rev-parse --short HEAD', {
    encoding: 'utf-8',
  }).trim();

  // Get the commit message to extract PR number
  const commitMessage = execSync('git log -1 --pretty=%B', {
    encoding: 'utf-8',
  }).trim();

  // Extract PR number from commit message (e.g., "#170" from "feat: something #170")
  const prMatch = commitMessage.match(/#(\d+)/);
  const displayVersion = prMatch ? `#${prMatch[1]}` : commitHash;

  // Create version object
  const version = {
    commit: displayVersion,
    buildTime: new Date().toISOString(),
  };

  // Ensure public directory exists
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write version.json to public directory
  const versionPath = path.join(publicDir, 'version.json');
  fs.writeFileSync(versionPath, JSON.stringify(version, null, 2));

  console.log(`✓ Generated version.json with version ${displayVersion}`);
} catch (error) {
  console.warn(
    '⚠ Could not generate version (not a git repository or git not available)',
  );

  // Write fallback version for development
  const fallbackVersion = {
    commit: 'dev',
    buildTime: new Date().toISOString(),
  };

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const versionPath = path.join(publicDir, 'version.json');
  fs.writeFileSync(versionPath, JSON.stringify(fallbackVersion, null, 2));
}
