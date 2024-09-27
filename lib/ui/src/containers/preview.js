import React from 'react';
import memoize from 'memoizerific';

import { Consumer } from '@storybook/api';

import { Preview } from '../components/preview/preview';

const nonAlphanumSpace = /[^a-z0-9 ]/gi;
const doubleSpace = /\s\s/gi;
const replacer = match => ` ${match} `;
const addExtraWhiteSpace = input =>
  input.replace(nonAlphanumSpace, replacer).replace(doubleSpace, ' ');

const createPreviewActions = memoize(1)(api => ({
  toggleFullscreen: () => api.toggleFullscreen(),
}));
const mapper = ({ api, state: { layout, location, selected } }) =>
  api.renderPreview
    ? { renderPreview: api.renderPreview }
    : {
        api,
        getElements: api.getElements,
        getQueryParams: () =>
          Object.entries(api.getUrlState().queryParams).reduce((acc, [k, v]) => {
            return `${acc}&${k}=${v}`;
          }, ''),
        actions: createPreviewActions(api),
        options: layout,
        description: selected ? addExtraWhiteSpace(`${selected.kind} - ${selected.name}`) : '',
        ...api.getUrlState(),
        location,
      };

const PreviewConnected = React.memo(props => (
  <Consumer filter={mapper}>
    {fromState =>
      fromState.renderPreview ? fromState.renderPreview() : <Preview {...props} {...fromState} />
    }
  </Consumer>
));
PreviewConnected.displayName = 'PreviewConnected';

export default PreviewConnected;
