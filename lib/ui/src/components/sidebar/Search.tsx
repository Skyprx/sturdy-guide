import React, { ComponentProps, useState, ChangeEvent, FunctionComponent } from 'react';
import { styled } from '@storybook/theming';
import { opacify } from 'polished';
import { Icons } from '@storybook/components';

export type FilterFieldProps = ComponentProps<'input'>;

export type CancelButtonProps = ComponentProps<'button'>;
export type SearchProps = Omit<FilterFieldProps, 'onChange'> & {
  onChange: (arg: string) => void;
  defaultFocussed?: boolean;
};
export type FilterFormProps = ComponentProps<'form'> & {
  focussed: boolean;
};

const FilterField = styled.input<FilterFieldProps>(({ theme }) => ({
  // resets
  appearance: 'none',
  border: 'none',
  boxSizing: 'inherit',
  display: 'block',
  outline: 'none',
  width: '100%',
  background: 'transparent',
  padding: 0,
  fontSize: 'inherit',

  '&:-webkit-autofill': { WebkitBoxShadow: `0 0 0 3em ${theme.color.lightest} inset` },

  '::placeholder': {
    color: theme.color.mediumdark,
  },

  '&:placeholder-shown ~ button': {
    // hide cancel button using CSS only
    opacity: 0,
  },
}));

const CancelButton = styled.button<CancelButtonProps>(({ theme }) => ({
  border: 0,
  margin: 0,
  padding: 4,
  textDecoration: 'none',

  background: theme.appBorderColor,
  borderRadius: '1em',
  cursor: 'pointer',
  opacity: 1,
  transition: 'all 150ms ease-out',

  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  right: 2,

  '> svg': {
    display: 'block',
    height: 8,
    width: 8,
    color: theme.input.color,
    transition: 'all 150ms ease-out',
  },

  '&:hover': {
    background: opacify(0.1, theme.appBorderColor),
  },
}));

const FilterForm = styled.form<FilterFormProps>(({ theme, focussed }) => ({
  transition: 'all 150ms ease-out',
  borderBottom: '1px solid transparent',
  borderBottomColor: focussed
    ? opacify(0.3, theme.appBorderColor)
    : opacify(0.1, theme.appBorderColor),
  outline: 0,
  position: 'relative',
  color: theme.input.color,

  input: {
    color: theme.input.color,
    fontSize: theme.typography.size.s2 - 1,
    lineHeight: '20px',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 20,
    paddingRight: 20,
  },

  '> svg': {
    transition: 'all 150ms ease-out',
    position: 'absolute',
    top: '50%',
    height: 12,
    width: 12,
    transform: 'translateY(-50%)',
    zIndex: 1,

    background: 'transparent',

    path: {
      transition: 'all 150ms ease-out',
      fill: 'currentColor',
      opacity: focussed ? 1 : 0.3,
    },
  },
}));

export const Search: FunctionComponent<SearchProps> = ({
  className,
  onChange,
  defaultFocussed = false,
  defaultValue,
  ...props
}) => {
  const [focussed, onSetFocussed] = useState(defaultFocussed);
  return (
    <FilterForm
      autoComplete="off"
      focussed={focussed}
      className={className}
      onReset={() => onChange('')}
      onSubmit={e => e.preventDefault()}
    >
      <FilterField
        type="text"
        id="storybook-explorer-searchfield"
        onFocus={() => onSetFocussed(true)}
        onBlur={() => onSetFocussed(false)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        }}
        defaultValue={defaultValue}
        {...props}
        placeholder={focussed ? 'Type to search...' : 'Press "/" to search...'}
        aria-label="Search stories"
      />
      <Icons icon="search" />
      <CancelButton type="reset" value="reset" title="Clear search">
        <Icons icon="closeAlt" />
      </CancelButton>
    </FilterForm>
  );
};
