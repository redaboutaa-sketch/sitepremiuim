import { defineConfig, devices } from '@playwright/test';

const CHROMIUM = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';

/**
 * QA navigateur. Sert le `dist/` statique — donc on teste exactement
 * l'artefact qui sera uploadé chez Hostinger, pas le serveur de dev.
 *
 * Chromium est préinstallé dans l'environnement (PLAYWRIGHT_BROWSERS_PATH).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  timeout: 30_000,

  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'off',
    screenshot: 'off',
    // Le Chromium préinstallé (build 1194) ne correspond pas au build attendu
    // par @playwright/test 1.62. On pointe le binaire existant plutôt que de
    // télécharger : l'environnement interdit `playwright install`.
    launchOptions: { executablePath: CHROMIUM },
  },

  // Les tests unitaires du catalogue ne touchent pas au navigateur : NO_SERVER=1
  // évite de servir dist/ pour rien, et permet d'utiliser ce gate AVANT le build.
  webServer: process.env.NO_SERVER
    ? undefined
    : {
        command: 'npx --yes serve dist -l 4321 --no-clipboard',
        url: 'http://127.0.0.1:4321/',
        reuseExistingServer: true,
        timeout: 60_000,
      },

  projects: [
    // `channel` est neutralisé : il prendrait le pas sur `executablePath`.
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: undefined, viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: undefined } },
  ],
});
