import React, { ComponentProps } from 'react';
import { Separator } from '@storybook/components';
import { ToolbarControl } from './ToolbarControl';
import { ContextNode, FCNoChildren, SelectionState } from '../../shared/types.d';

type ToolBar = FCNoChildren<{
  nodes: ContextNode[];
  state: SelectionState;
  setSelected: ComponentProps<typeof ToolbarControl>['setSelected'];
}>;

export const ToolBar: ToolBar = React.memo(({ nodes, state, setSelected }) =>
  nodes.length ? (
    <>
      <Separator />
      {nodes.map(({ components, ...forwardProps }) => (
        <ToolbarControl
          {...forwardProps}
          setSelected={setSelected}
          selected={state[forwardProps.nodeId]}
          key={forwardProps.nodeId}
        />
      ))}
    </>
  ) : null
);
