/* eslint-disable no-underscore-dangle */

import { window, document } from 'global';
import Channel from '@storybook/channels';
import { isJSON, parse, stringify } from 'telejson';

export const KEY = 'storybook-channel';

// TODO: we should export a method for opening child windows here and keep track of em.
// that way we can send postMessage to child windows as well, not just iframe
// https://stackoverflow.com/questions/6340160/how-to-get-the-references-of-all-already-opened-child-windows

export class PostmsgTransport {
  constructor(config) {
    this._config = config;
    this._buffer = [];
    this._handler = null;

    if (window && window.addEventListener) {
      window.addEventListener('message', this._handleEvent.bind(this), false);
    }
    if (document && document.addEventListener) {
      document.addEventListener('DOMContentLoaded', () => this._flush());
    } else {
      this._flush();
    }

    // Check whether the config.page parameter has a valid value
    if (config.page !== 'manager' && config.page !== 'preview') {
      throw new Error(`postmsg-channel: "config.page" cannot be "${config.page}"`);
    }
  }

  setHandler(handler) {
    this._handler = handler;
  }

  send(event) {
    const iframeWindow = this._getWindow();
    if (!iframeWindow) {
      return new Promise((resolve, reject) => {
        this._buffer.push({ event, resolve, reject });
      });
    }

    const data = stringify({ key: KEY, event }, { maxDepth: 10 });

    // TODO: investigate http://blog.teamtreehouse.com/cross-domain-messaging-with-postmessage
    // might replace '*' with document.location ?
    iframeWindow.postMessage(data, '*');
    return Promise.resolve(null);
  }

  _flush() {
    const buffer = this._buffer;
    this._buffer = [];
    buffer.forEach(item => {
      this.send(item.event)
        .then(item.resolve)
        .catch(item.reject);
    });
  }

  _getWindow() {
    if (this._config.page === 'manager') {
      // FIXME this is a really bad idea! use a better way to do this.
      // This finds the storybook preview iframe to send messages to.
      const iframe = document.getElementById('storybook-preview-iframe');
      if (!iframe) {
        return null;
      }
      return iframe.contentWindow;
    }
    return window.parent;
  }

  _handleEvent(rawEvent) {
    try {
      const { data } = rawEvent;
      const { key, event } = typeof data === 'string' && isJSON(data) ? parse(data) : data;
      if (key === KEY) {
        // eslint-disable-next-line no-console
        console.debug(`message arrived at ${this._config.page}`, event.type, ...event.args);
        this._handler(event);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      // eslint-disable-next-line no-debugger
      debugger;
    }
  }
}

export default function createChannel({ page }) {
  const transport = new PostmsgTransport({ page });
  return new Channel({ transport });
}
