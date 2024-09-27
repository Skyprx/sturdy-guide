import { fetch } from 'global';
import initVersions from './versions';

jest.mock('../../package.json', () => ({
  version: '3.0.0',
}));

jest.mock('global', () => ({
  fetch: jest.fn(),
}));

function createMockStore() {
  let state = {};
  return {
    getState: jest.fn().mockImplementation(() => state),
    setState: jest.fn().mockImplementation(s => {
      state = { ...state, ...s };
    }),
  };
}

const standardResponse = {
  json: jest.fn().mockResolvedValue({
    latest: {
      version: '4.0.0',
    },
  }),
};

jest.mock('@storybook/client-logger');

describe('versions API', () => {
  it('sets initial state with current version', async () => {
    const store = createMockStore();
    const { state } = initVersions({ store });

    expect(state.versions).toEqual({
      current: { version: '3.0.0' },
    });
  });

  it('sets initial state based on persisted versions', async () => {
    const store = createMockStore();
    store.setState({
      versions: {
        current: { info: '3-info', version: '3.0.0' },
        latest: { version: '4.0.0', info: '4-info' },
      },
    });
    const { state } = initVersions({ store });

    expect(state.versions).toEqual({
      current: { version: '3.0.0', info: '3-info' },
      latest: { version: '4.0.0', info: '4-info' },
    });
  });

  it('sets versions in the init function', async () => {
    const store = createMockStore();
    const { state: initialState, init, api } = initVersions({ store });
    store.setState(initialState);

    fetch.mockResolvedValueOnce(standardResponse);
    store.setState.mockReset();
    await init({ api: { addNotification: jest.fn(), ...api } });
    expect(store.setState).toHaveBeenCalledWith(
      {
        versions: {
          latest: { version: '4.0.0' },
          current: { version: '3.0.0' },
        },
        lastVersionCheck: expect.any(Number),
      },
      { persistence: 'permanent' }
    );
  });

  it('sets a new latest version if old version was cached', async () => {
    const store = createMockStore();
    store.setState({
      versions: {
        current: { version: '3.0.0' },
        latest: { version: '3.1.0' },
      },
    });

    const { state: initialState, init, api } = initVersions({ store });
    store.setState(initialState);

    fetch.mockResolvedValueOnce(standardResponse);
    store.setState.mockReset();
    await init({ api: { addNotification: jest.fn(), ...api } });
    expect(store.setState).toHaveBeenCalledWith(
      {
        versions: {
          latest: { version: '4.0.0' },
          current: { version: '3.0.0' },
        },
        lastVersionCheck: expect.any(Number),
      },
      { persistence: 'permanent' }
    );
  });

  it('does not set versions if check was recent', async () => {
    const store = createMockStore();
    store.setState({ lastVersionCheck: Date.now() });
    const { state: initialState, init, api } = initVersions({ store });
    store.setState(initialState);

    store.setState.mockReset();
    await init({ api: { addNotification: jest.fn(), ...api } });
    expect(store.setState).not.toHaveBeenCalled();
  });

  it('handles failures in the versions function', async () => {
    const store = createMockStore();
    const { init, api, state: initialState } = initVersions({ store });
    store.setState(initialState);

    fetch.mockRejectedValueOnce(new Error('fetch failed'));
    await init({ api: { addNotification: jest.fn(), ...api } });

    expect(store.getState().versions).toEqual({
      current: { version: '3.0.0' },
    });
  });

  it('sets an update notification right away in the init function', async () => {
    const store = createMockStore();
    const { init, api, state: initialState } = initVersions({ store });
    store.setState(initialState);

    fetch.mockResolvedValueOnce(standardResponse);
    const addNotification = jest.fn();
    await init({ api: { addNotification, ...api } });
    expect(addNotification).toHaveBeenCalled();
  });

  it('does not set an update notification if it has been dismissed', async () => {
    const store = createMockStore();
    store.setState({ dismissedVersionNotification: '4.0.0' });
    const { init, api, state: initialState } = initVersions({ store });
    store.setState(initialState);

    fetch.mockResolvedValueOnce(standardResponse);
    const addNotification = jest.fn();
    await init({ api: { addNotification, ...api } });
    expect(addNotification).not.toHaveBeenCalled();
  });

  it('persists a dismissed notification', async () => {
    const store = createMockStore();
    const { init, api, state: initialState } = initVersions({ store });
    store.setState(initialState);

    fetch.mockResolvedValueOnce(standardResponse);
    let notification;
    const addNotification = jest.fn().mockImplementation(n => {
      notification = n;
    });
    await init({ api: { addNotification, ...api } });
    notification.onClear();
    expect(store.setState).toHaveBeenCalledWith(
      { dismissedVersionNotification: '4.0.0' },
      { persistence: 'permanent' }
    );
  });

  it('getCurrentVersion works', async () => {
    const store = createMockStore();
    const { api, init, state: initialState } = initVersions({ store });
    store.setState(initialState);

    fetch.mockResolvedValueOnce(standardResponse);
    await init({ api: { ...api, addNotification: jest.fn() } });

    expect(api.getCurrentVersion()).toEqual({
      version: '3.0.0',
    });
  });

  it('getLatestVersion works', async () => {
    const store = createMockStore();
    const { api, init, state: initialState } = initVersions({ store });
    store.setState(initialState);

    fetch.mockResolvedValueOnce(standardResponse);
    await init({ api: { ...api, addNotification: jest.fn() } });

    expect(api.getLatestVersion()).toMatchObject({
      version: '4.0.0',
    });
  });

  it('versionUpdateAvailable works', async () => {
    const store = createMockStore();
    const { api, init, state: initialState } = initVersions({ store });
    store.setState(initialState);

    fetch.mockResolvedValueOnce(standardResponse);
    await init({ api: { ...api, addNotification: jest.fn() } });

    expect(api.versionUpdateAvailable()).toEqual(true);
  });
});
