import React from 'react';
import { Grid, Segment, Icon, Table, Dimmer, Loader } from "semantic-ui-react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import {roles} from '../../../settings';

/**
 *  Table of posts for the selected group.
 *
 *  Shows the title, likes, views, rating, submitter and remove button icon
 *  for deleting a post.
 *
 *  @param {object} props Component props
 *  @param {array} props.posts Posts data to be mapped and displayed
 *  @param {function} props.showModal Sets the modal to be shown or hidden
 *  @param {string} props.deletingPost The post to be deleted
 *  @returns {Component} Table of post data
 */
const GroupManagePosts = ({posts, showModal, deletingPost, user, access, headers}) => {
  if (!posts.length) {
    return (
      <Grid.Column width={8}>
        <Segment>
          {"No posts in this group."}
        </Segment>
      </Grid.Column>
    )
  }else {
    return (
      <Grid.Column>
        <Table striped>
          <Table.Header>
            <Table.Row>
              {
                headers.map((h, i) => {
                  let align = { 'textAlign': 'center' };
                  if (i === 0) align = {};
                  return <Table.HeaderCell {...align} key={h}>{h}</Table.HeaderCell>
                })
              }
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
            posts.map((p, i) => (
              <Table.Row key={p._id}>
                <Table.Cell>
                <Link
                  to={p.st_category+'/@'+p.st_author+'/'+p.st_permlink}
                >
                {(p.st_title.length > 70)
                  ? p.st_title.substr(0,70) + " ..."
                  : p.st_title}
                </Link>
                </Table.Cell>
                <Table.Cell collapsing textAlign='center'>{p.likes}</Table.Cell>
                <Table.Cell collapsing textAlign='center'>{p.views}</Table.Cell>
                <Table.Cell collapsing textAlign='center'>{p.rating}</Table.Cell>
                <Table.Cell collapsing textAlign='center'>{p.added_by}</Table.Cell>
                <Table.Cell collapsing textAlign='center'>
                  {
                    (deletingPost === p.st_permlink)
                      ? <Dimmer inverted active><Loader /></Dimmer>
                      : ''
                  }
                  {
                    //if logged in user added post, or is mod or above
                    //can delete the post
                    //(user === p.added_by)
                    //?
                    access < roles.kGroupsRolesRev['Member']
                    &&
                      (
                        <a href={'/post/delete/'+p.st_author+'/'+p.st_permlink} onClick={e => showModal(e, {author: p.st_author, post: p.st_permlink})}>
                          <Icon name='delete' color='blue' />
                        </a>
                      )

                    //:''
                  }
                </Table.Cell>
              </Table.Row>
            ))
          }
          </Table.Body>
        </Table>
      </Grid.Column>
    )
  }
}

GroupManagePosts.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.object).isRequired,
  showModal: PropTypes.func.isRequired,
  deletingPost: PropTypes.string.isRequired,
};

export default GroupManagePosts;
