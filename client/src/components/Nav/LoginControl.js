import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Dropdown, Icon } from "semantic-ui-react";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Avatar from '../pages/Steem/Avatar';

const trigger = (user) => (
  <Avatar author={user} height='30px' width='30px' />
)

/**
 *  Menu component for Login/Logout display.
 *
 *  Controller for displaying if a user sees a Login or Logout in the menu.
 *  Also shows a Manage menu if user is logged in.
 *
 *  @param {object} props Component props
 *  @param {bool} props.isAuth Determines if user is authenticated
 *  @param {function} props.loginURL URL to login via Steem Connect
 *  @returns {Component} Menu component that displays Login, or Logout & Manage
 */
const LoginControl = ({isAuth, user, loginURL}) => {
  let menu;
  const avatar = trigger(user);

  if (isAuth) {
    menu =
    (
      <React.Fragment>
        <Menu.Item
          exact
          as={NavLink}
          to="/manage"
          header
        >
          {'Manage'}
        </Menu.Item>
        <Menu.Item
          exact
          as={NavLink}
          to="/write"
          header
        >
          <Icon name='compose' />
        </Menu.Item>
        <Dropdown trigger={avatar} item>
          <Dropdown.Menu>
            <Dropdown.Item
              exact
              as={NavLink}
              to={`/@${user}/feed`}
            >
              <Icon name='newspaper outline' />
              {'Feed'}
            </Dropdown.Item>

            <Dropdown.Item
              exact
              as={NavLink}
              to={`/@${user}`}
            >
              <Icon name='address card outline' />
              {'Blog'}
            </Dropdown.Item>

            <Dropdown.Item
              exact
              as={NavLink}
              to="/logout"
            >
              <Icon name='shutdown' />
              {'Logout'}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

      </React.Fragment>
    )
  }else {
    menu = <a className="header item" href={loginURL}>Login</a>;
  }

  return (
    menu
  )
}

LoginControl.propTypes = {
  isAuth: PropTypes.bool.isRequired,
  loginURL: PropTypes.string.isRequired,
};

/**
 *  Map redux state to component props.
 *
 *  @param {object} state - Redux state
 *  @returns {object} - Authentication data
 */
const mapStateToProps = state => {
  const { isAuth, user } = state.auth;

  return {
    isAuth,
    user,
  }
}

export default connect(mapStateToProps)(LoginControl)
