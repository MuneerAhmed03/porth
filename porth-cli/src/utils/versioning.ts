import type { PorthConfig } from './porthConfig.js';

interface VersionPackageJson {
  version?: string;
}

export interface VersionInfo {
  versionCode: number;
  versionName: string;
}

export function getVersionInfo(
  packageJson: VersionPackageJson,
  config: PorthConfig,
): VersionInfo {
  return {
    versionCode: config.versionCode,
    versionName: packageJson.version ?? '1.0.0',
  };
}
