import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Typography } from '@storybook/components';
import { navigate, hrefTo } from '../../preview';

export default class LinkTo extends PureComponent {
  state = {
    href: '/',
  };

  componentDidMount() {
    this.updateHref();
  }

  componentDidUpdate(prevProps) {
    const { kind, story } = this.props;

    if (prevProps.kind !== kind || prevProps.story !== story) {
      this.updateHref();
    }
  }

  handleClick = e => {
    if (e) {
      e.preventDefault();
    }
    navigate(this.props);
  };

  async updateHref() {
    const { kind, story } = this.props;
    const href = await hrefTo(kind, story);
    this.setState({ href });
  }

  render() {
    const { kind, story, ...rest } = this.props;
    const { href } = this.state;

    return <Typography.Link cancel href={href} onClick={this.handleClick} {...rest} />;
  }
}

LinkTo.defaultProps = {
  kind: null,
  story: null,
};

LinkTo.propTypes = {
  kind: PropTypes.string,
  story: PropTypes.string,
};
