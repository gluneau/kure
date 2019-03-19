import React from 'react';
import { Header, Table, Label } from "semantic-ui-react";

import GroupLink from '../../common/GroupLink';
import UserLink from '../../common/UserLink';
import DateFromNow from '../../common/DateFromNow';

/**
 *  Show the newly created groups as a table list.
 *
 *  @param {array} groupsCreated Data for newly created groups
 */
const GroupsCreated = ({ groupsCreated}) => {
  if (groupsCreated.length) {
    return (
      <React.Fragment>
        <Label size='large' color='blue'><Header>Newly Created</Header></Label>
        <Table striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Community</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>Posts</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>Users</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>Created</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>Owner</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              groupsCreated.map((g, i) => (
                <Table.Row key={g._id}>
                  <Table.Cell>
                    <GroupLink display={g.display} name={g.name} />
                  </Table.Cell>
                  <Table.Cell collapsing textAlign='center'>{g.posts}</Table.Cell>
                  <Table.Cell collapsing textAlign='center'>{g.users}</Table.Cell>
                  <Table.Cell collapsing textAlign='center'><DateFromNow date={g.created} /></Table.Cell>
                  <Table.Cell collapsing textAlign='center'><UserLink user={g.owner} /></Table.Cell>
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table>
      </React.Fragment>
    )
  }
}

export default GroupsCreated;
