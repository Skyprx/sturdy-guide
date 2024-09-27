import { logger } from '@storybook/client-logger';
import { fetch } from 'global';

import { version as currentVersion } from '../../package.json';

const checkInterval = 24 * 60 * 60 * 1000;

const versionsUrl = 'https://storybook.js.org/versions.json';
async function fetchLatestVersion() {
  const fromFetch = await fetch(`${versionsUrl}?current=${currentVersion}`);
  return fromFetch.json();
}

export default function({ store }) {
  const {
    versions: persistedVersions = {},
    lastVersionCheck,
    dismissedVersionNotification,
  } = store.getState();

  // Check to see if we have info about the current version persisted
  const persistedCurrentVersion = Object.values(persistedVersions).find(
    v => v.version === currentVersion
  );
  const state = {
    versions: {
      ...persistedVersions,
      current: {
        version: currentVersion,
        ...(persistedCurrentVersion && { info: persistedCurrentVersion.info }),
      },
    },
    lastVersionCheck,
    dismissedVersionNotification,
  };

  const api = {
    getCurrentVersion: () => {
      const {
        versions: { current },
      } = store.getState();
      return current;
    },
    getLatestVersion: () => {
      const {
        versions: { latest },
      } = store.getState();
      return latest;
    },
    versionUpdateAvailable: () => {
      const latestVersion = api.getLatestVersion();
      return latestVersion && latestVersion.version !== store.getState().currentVersion;
    },
  };

  // Grab versions from the server/local storage right away
  async function init({ api: { versionUpdateAvailable, getLatestVersion, addNotification } }) {
    const { versions = {} } = store.getState();

    const now = Date.now();
    if (!lastVersionCheck || now - lastVersionCheck > checkInterval) {
      try {
        const { latest } = await fetchLatestVersion(currentVersion);

        await store.setState(
          { versions: { ...versions, latest }, lastVersionCheck: now },
          { persistence: 'permanent' }
        );
      } catch (error) {
        logger.warn(`Failed to fetch latest version from server: ${error}`);
      }
    }

    if (versionUpdateAvailable()) {
      const latestVersion = getLatestVersion().version;

      if (latestVersion !== dismissedVersionNotification) {
        addNotification({
          id: 'update',
          level: 2,
          link: '/settings/about',
          icon: '🎉',
          content: `There's a new version available: ${latestVersion}`,
          onClear() {
            store.setState(
              { dismissedVersionNotification: latestVersion },
              { persistence: 'permanent' }
            );
          },
        });
      }
    }
  }

  return { init, state, api };
}
