import React, { Fragment, useState } from 'react';

import { styled } from '@storybook/theming';
import { Icons } from '@storybook/components';

import { Result } from 'axe-core';
import { Info } from './Info';
import { Elements } from './Elements';
import { Tags } from './Tags';
import { RuleType } from '../A11YPanel';
import HighlightToggle from './HighlightToggle';

const Wrapper = styled.div<{}>(({ theme }) => ({
  display: 'flex',
  width: '100%',
  borderBottom: `1px solid ${theme.appBorderColor}`,
  '&:hover': {
    background: theme.background.hoverable,
  },
}));

const Icon = styled<any, any>(Icons)(({ theme }) => ({
  height: 10,
  width: 10,
  minWidth: 10,
  color: theme.color.mediumdark,
  marginRight: 10,
  transition: 'transform 0.1s ease-in-out',
  alignSelf: 'center',
  display: 'inline-flex',
}));

const HeaderBar = styled.div<{}>(({ theme }) => ({
  padding: theme.layoutMargin,
  paddingLeft: theme.layoutMargin - 3,
  background: 'none',
  color: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  borderLeft: '3px solid transparent',
  width: '100%',

  '&:focus': {
    outline: '0 none',
    borderLeft: `3px solid ${theme.color.secondary}`,
  },
}));

const HighlightToggleElement = styled.span({
  fontWeight: 'normal',
  float: 'right',
  marginRight: 15,
  alignSelf: 'center',
  input: { margin: 0 },
});

interface ItemProps {
  item: Result;
  type: RuleType;
}

// export class Item extends Component<ItemProps, ItemState> {
export const Item = (props: ItemProps) => {
  const [open, onToggle] = useState(false);

  const { item, type } = props;
  const highlightToggleId = `${type}-${item.id}`;

  return (
    <Fragment>
      <Wrapper>
        <HeaderBar onClick={() => onToggle(!open)} role="button">
          <Icon
            icon="chevrondown"
            size={10}
            color="#9DA5AB"
            style={{
              transform: `rotate(${open ? 0 : -90}deg)`,
            }}
          />
          {item.description}
        </HeaderBar>
        <HighlightToggleElement>
          <HighlightToggle
            toggleId={highlightToggleId}
            type={type}
            elementsToHighlight={item.nodes}
          />
        </HighlightToggleElement>
      </Wrapper>
      {open ? (
        <Fragment>
          <Info item={item} key="info" />
          <Elements elements={item.nodes} type={type} key="elements" />
          <Tags tags={item.tags} key="tags" />
        </Fragment>
      ) : null}
    </Fragment>
  );
};
