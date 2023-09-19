import React from 'react';
import PropTypes from 'prop-types';

const Header = ({ className }) => (
  <div className={className}>
    <h1>Plan the</h1>
    <div className="header__logo">
      <a href="/">
        <img src="/images/logo.svg" alt="logo" />
        <img src="/images/logo-2.svg" alt="logo" />
      </a>
    </div>
    <h1>Sprints</h1>
  </div>
);

Header.propTypes = {
  className: PropTypes.string.isRequired,
};
Header.defaultProps = {};

export default Header;
