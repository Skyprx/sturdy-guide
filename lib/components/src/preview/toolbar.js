import React from 'react';
import { styled } from '@storybook/theming';

import { FlexBar } from '../bar/bar';

export const Toolbar = styled(({ shown, ...props }) => <FlexBar {...props} />)(
  {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    transition: 'transform .2s linear',
  },
  ({ shown }) => ({
    tranform: shown ? 'translateY(0px)' : 'translateY(-40px)',
  })
);
