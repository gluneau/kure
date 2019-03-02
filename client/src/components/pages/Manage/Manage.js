import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from "semantic-ui-react";
import { connect } from 'react-redux';

import ManageGroups from './ManageGroups';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import './Manage.css';


/**
 *  The root manangement page for community groups, posts and users.
 *
 *  Loads the two Communiy Group list types: Owned and Joined.
 *  The logged in user name and CSRF token are passed to each.
 *
 *  @param {object} props Component props
 *  @param {string} props.user User name to use in Manage page
 *  @param {string} props.csrf CSRF token to prevent CSRF attacks
 *  @returns {Component} Loads various components to manage community groups
 */
const Manage = ({user, csrf}) => (
  <ErrorBoundary>
    <div className="manage">
      <Grid columns={1} stackable>

        <Grid.Column width={16} className="main">
          <Grid>

            <ManageGroups
              user={user}
              csrf={csrf}
              type='owned'
              headerText='Communities You Own'
            />

            <ManageGroups
              user={user}
              csrf={csrf}
              type='joined'
              headerText='Communities You Joined'
            />

          </Grid>
        </Grid.Column>
      </Grid>
    </div>
  </ErrorBoundary>
)

Manage.propTypes = {
  user: PropTypes.string.isRequired,
  csrf: PropTypes.string.isRequired,
};

/**
 *  Map redux state to component props.
 *
 *  @param {object} state - Redux state
 *  @returns {object} - Object with recent activity data
 */
const mapStateToProps = state => {
  const { userData, csrf } = state.auth;

  return {
    user: userData.name,
    csrf
  }
}

export default connect(mapStateToProps)(Manage);
