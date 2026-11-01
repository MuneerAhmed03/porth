import fs from 'fs-extra';
import path from 'node:path';
import { derivePackageName, validatePackageName } from './packageName.js';

export interface PorthConfig {
  packageName: string;
  versionCode: number;
  keystorePath: string;
}

interface ProjectPackageJson {
  name?: string;
}

const PORTH_DIR = '.porth';
const CONFIG_RELATIVE_PATH = path.join(PORTH_DIR, 'config.json');
const KEYSTORE_RELATIVE_PATH = path.join(PORTH_DIR, 'keystore', 'release.p12');

export function getConfigPath(cwd: string): string {
  return path.join(cwd, CONFIG_RELATIVE_PATH);
}

export async function loadOrCreateConfig(cwd: string): Promise<PorthConfig> {
  const configPath = getConfigPath(cwd);
  if (await fs.pathExists(configPath)) {
    const config = (await fs.readJSON(configPath)) as PorthConfig;
    validatePackageName(config.packageName);
    return config;
  }

  const packageJsonPath = path.join(cwd, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error('No package.json found. Run porth from your project root.');
  }

  const packageJson = (await fs.readJSON(packageJsonPath)) as ProjectPackageJson;
  const packageName = derivePackageName(packageJson.name ?? '');
  const config: PorthConfig = {
    packageName,
    versionCode: 1,
    keystorePath: KEYSTORE_RELATIVE_PATH.replaceAll('\\', '/'),
  };
  validatePackageName(config.packageName);

  await fs.ensureDir(path.join(cwd, PORTH_DIR));
  await saveConfig(cwd, config);
  await ensureKeystoreInGitignore(cwd);
  console.log('✨ Porth initialized → .porth/config.json');
  return config;
}

export async function saveConfig(cwd: string, config: PorthConfig): Promise<void> {
  const configPath = getConfigPath(cwd);
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeJSON(configPath, config, { spaces: 2 });
}

async function ensureKeystoreInGitignore(cwd: string): Promise<void> {
  const gitignorePath = path.join(cwd, '.gitignore');
  const entries = ['.porth/keystore/', '.porth/container-build/', '.porth/dev-dist/'];

  const current = (await fs.pathExists(gitignorePath))
    ? await fs.readFile(gitignorePath, 'utf8')
    : '';
  const lines = current.split(/\r?\n/).map((line) => line.trim());
  const missing = entries.filter((entry) => !lines.includes(entry));

  if (missing.length === 0) {
    return;
  }

  const separator = current.length === 0 || current.endsWith('\n') ? '' : '\n';
  await fs.appendFile(gitignorePath, `${separator}${missing.join('\n')}\n`, 'utf8');
}
