import chalk from 'chalk';
import { execa } from 'execa';

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
  fix?: string;
}

async function run(
  cmd: string,
  args: string[],
): Promise<{ ok: boolean; out: string }> {
  try {
    const { stdout } = await execa(cmd, args, { stdio: 'pipe' });
    return { ok: true, out: stdout };
  } catch (error) {
    const e = error as { stderr?: string; stdout?: string; shortMessage?: string };
    return { ok: false, out: (e.stderr || e.stdout || e.shortMessage || '').trim() };
  }
}

export async function doctorCommand(): Promise<void> {
  const checks: CheckResult[] = [];

  // Node.js
  const node = await run('node', ['--version']);
  const nodeMajor = Number.parseInt(node.out.replace(/^v/, '').split('.')[0] ?? '0', 10);
  checks.push({
    name: 'Node.js 18+',
    ok: node.ok && nodeMajor >= 18,
    detail: node.ok ? node.out.trim() : node.out,
    fix: 'Install Node.js 18+ from https://nodejs.org',
  });

  // Docker CLI
  const dockerCli = await run('docker', ['--version']);
  checks.push({
    name: 'Docker CLI',
    ok: dockerCli.ok,
    detail: dockerCli.ok ? dockerCli.out.trim() : dockerCli.out,
    fix: 'Install Docker Desktop or Docker Engine',
  });

  // Docker daemon
  const dockerInfo = await run('docker', ['info']);
  checks.push({
    name: 'Docker daemon',
    ok: dockerInfo.ok,
    detail: dockerInfo.ok ? 'reachable' : dockerInfo.out.split('\n')[0],
    fix: 'Start Docker first (Docker Desktop, `colima start`, etc.)',
  });

  // amd64 emulation — the key check: Google's aapt2 is x86_64-only,
  // so the builder must run in a linux/amd64 container.
  const amd64 = await run('docker', ['run', '--rm', '--platform', 'linux/amd64', 'alpine', 'uname', '-m']);
  checks.push({
    name: 'linux/amd64 containers',
    ok: amd64.ok && amd64.out.trim() === 'x86_64',
    detail: amd64.ok ? amd64.out.trim() : amd64.out.split('\n')[0],
    fix: 'Apple Silicon + colima: `colima start --arch x86_64 --vz-rosetta`. '
      + 'Or use Docker Desktop / OrbStack, which emulate amd64 automatically.',
  });

  // adb (optional, for installing the APK)
  const adb = await run('adb', ['--version']);
  checks.push({
    name: 'adb (for installing APKs)',
    ok: adb.ok,
    detail: adb.ok ? adb.out.trim().split('\n')[0] : 'not found',
    fix: 'Install Android platform-tools and add it to PATH (optional — only needed for `adb install`)',
  });

  let allOk = true;
  for (const c of checks) {
    if (c.ok) {
      console.log(`${chalk.green('✔')} ${c.name}`);
    } else {
      allOk = false;
      console.log(`${chalk.red('✖')} ${c.name} — ${chalk.red(c.detail)}`);
      if (c.fix) {
        console.log(`   ${chalk.yellow('Fix:')} ${c.fix}`);
      }
    }
  }

  console.log('');
  if (allOk) {
    console.log(chalk.green('Everything looks good — `porth build` should work.'));
  } else {
    console.log(chalk.yellow('Some checks failed. Fix the items above, then run `porth doctor` again.'));
    process.exitCode = 1;
  }
}
