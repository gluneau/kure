import React from 'react';
import PropTypes from 'prop-types'
import { Grid, Table, Segment } from "semantic-ui-react";

import SteemConnect from '../../../utils/auth/scAPI';
import GroupLink from '../../kure/GroupLink';
import TitleLink from '../Steem/TitleLink';

/**
 *  Component to display the post data sent.
 *  If posts exist, display them. If not, display message.
 *
 *  @param {object} props Component props
 *  @param {object} props.post The post data to display
 *  @param {function} props.isAuth Determines if user is authenticated
 *  @returns {element} Displays the post, or message if no posts are in the app
 */
const RecentPostsTable = ({posts, isAuth}) => {
  const loginURL = SteemConnect.getLoginURL('/');
  if (posts.length) {
    return (
      <Grid.Row columns={1}>
        <Grid.Column>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell textAlign='center'>Group</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
              posts.map((p, i) => (
                <Table.Row key={p._id}>
                  <Table.Cell>
                    <TitleLink
                      title={p.st_title}
                      category={p.st_category}
                      author={p.st_author}
                      permlink={p.st_permlink}
                    />
                  </Table.Cell>
                  <Table.Cell collapsing textAlign='center'>
                    <GroupLink display={p.display} name={p.group} />
                  </Table.Cell>
                </Table.Row>
              ))
            }
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    )
  }else {
    if (isAuth)
      return (
        <Segment>
          <div className="recPost">
            {"There are no posts yet. Go to "}
            <a href="/manage">
              {"Manage"}
            </a>
            {" and create a community."}
          </div>
        </Segment>
      )
    else {
      return (
        <Segment>
          <div className="recPost">
            {"There are no posts yet. "}
            <a href={loginURL}>
              {"Login"}
            </a>
            {" to "}
            <a href="/manage">
              {"create"}
            </a>
            {" or join a community."}
          </div>
        </Segment>
      )
    }
  }
}

RecentPostsTable.propTypes = {
  post: PropTypes.shape(PropTypes.object),
  isAuth: PropTypes.bool.isRequired,
};

export default RecentPostsTable;
