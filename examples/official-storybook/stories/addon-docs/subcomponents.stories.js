import React from 'react';
import { DocgenButton } from '../../components/DocgenButton';
import { ButtonGroup } from '../../components/ButtonGroup';

export default {
  title: 'Addons/Docs/ButtonGroup',
  component: ButtonGroup,
  parameters: { viewMode: 'docs' },
  subcomponents: { DocgenButton },
};

export const basic = () => (
  <ButtonGroup>
    <DocgenButton label="foo" />
    <DocgenButton label="bar" />
  </ButtonGroup>
);
