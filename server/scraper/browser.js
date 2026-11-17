import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export async function renderDom(url, options = {}) {
  const chrome = findChrome();
  if (!chrome) {
    throw new Error(
      "No Chromium/Chrome found. Set CHROME_PATH to use the PLUS renderer."
    );
  }
  const {
    timeout = 70000,
    virtualTimeBudget = 22000,
    width = 1440,
    height = 2400
  } = options;

  const args = [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--mute-audio",
    "--disable-background-networking",
    `--window-size=${width},${height}`,
    `--virtual-time-budget=${virtualTimeBudget}`,
    "--dump-dom",
    url
  ];

  const { stdout } = await execFileAsync(chrome, args, {
    timeout,
    maxBuffer: 64 * 1024 * 1024,
    encoding: "utf8"
  });
  return stdout;
}
