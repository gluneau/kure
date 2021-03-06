import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Loading from '../../Loading/Loading';
import { getGroupsPage, logger } from '../../../utils/fetchFunctions';
import GroupSummary from './GroupSummary';
import './Groups.css';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';

//TODO: Show list of recent communities added. Option to sort by:
//New, Popular (Likes), Activity (Recent submissions), Rating

/**
 *  Community page component that displays a variety of data tailored around
 *  the community activity. From recently active, to popular, to newly created.
 */
class Groups extends Component {

  static propTypes = {
    user: PropTypes.string,
  };

  static defaultProps = {
    user: 'x',
  };

  state = {
    areGroupsLoading: true,
    groups: {},
    showGrid: true,
    tabSelected: 'new',
  }

  /**
   *  When going to Communities page from other pages, load componentDidMount
   *  with props set and fetch data.
   */
  componentDidMount() {
    const {
      user
    } = this.props;

    this.getGroups(user);
  }

  /**
   *  Get the various community data to display on the page.
   *
   *  @param {string} user User logged in
   */
  getGroups = (user) => {
    if (user === '') user = 'x';
    getGroupsPage(user)
    .then(result => {
      this.setState({
        areGroupsLoading: false,
        groups: result.data,
      });
    }).catch(err => {
      logger('error', err);
    });
  }

  /**
   *  Toggle state showGrid to show a grid or list view from being displayed.
   */
  toggleView = (e) => {
    e.preventDefault();
    const { showGrid } = this.state;
    this.setState({ showGrid: !showGrid });
  }

  /**
   *  Update state with the selected page section to view.
   */
  tabView = (e, selected) => {
    e.preventDefault();
    this.setState({ tabSelected: selected });
  }

  render() {

    const {
      state: {
        areGroupsLoading,
        groups,
        showGrid,
        tabSelected,
      }
    } = this;

    return (
      areGroupsLoading
        ? <Loading />
        : (
          <ErrorBoundary>
            <GroupSummary
              groups={groups}
              match={this.props.match}
              toggleView={this.toggleView}
              showGrid={showGrid}
              tabSelected={tabSelected}
              tabView={this.tabView}
            />
          </ErrorBoundary>
        )
    )
  }
}

/**
 *  Map redux state to component props.
 *
 *  @param {object} state - Redux state
 *  @returns {object} - Object with recent activity data
 */
const mapStateToProps = state => {
  const { user, isAuth } = state.auth;

  return {
    user,
    isAuth,
  }
}

export default connect(mapStateToProps)(Groups);
