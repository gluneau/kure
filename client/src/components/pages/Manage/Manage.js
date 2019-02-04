import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Header, Segment, Form, Icon, Divider } from "semantic-ui-react";
import axios from 'axios';
import { connect } from 'react-redux';

import GroupsList from './GroupsList';
import GroupManage from './GroupManage';
import ErrorLabel from '../../ErrorLabel/ErrorLabel';
import ModalConfirm from '../../ModalConfirm/ModalConfirm';
import './Manage.css';

/**
 *  The manangement page for community groups, posts and users.
 *
 *  An authenticated Steem user can manage their own communities,
 *  or communities they joined.
 *  Communities can be created by users.
 *  Community groups are displayed for mangement or deletion.
 *  Posts can be added to or deleted from communities.
 *  Users can be added to or deleted from communities.
 *
 *  @param {object} props - Component props
 *  @param {string} props.user - User name to use in Manage page
 *  @param {string} props.csrf - CSRF token to prevent CSRF attacks
 *  @returns {Component} - Loads various components to manage community groups
 */
class Manage extends Component {

  static propTypes = {
    user: PropTypes.string.isRequired,
    csrf: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      newGroup: '',
      groups: [],
      groupExists: false,
      exceededGrouplimit: false,
      areGroupsLoading: false,
      isGroupLoading: false,
      addGroupLoading: false,
      manageGroup: {},
      noOwned: true,
      errors: {},
      selectedGroup: '',
      modalOpen: false,
      modalData: {},
      /*searchResults: [],
      searchValue: ''*/
    }

    this.existText = "Group name taken. Try another.";
    this.exceededGrouplimit = "Limit of 4 groups reached.";
    const {user, csrf} = this.props;
    this.user = user;
    this.csrf = csrf;
  }

  componentDidMount() {
    this.setState({areGroupsLoading: true});
    this.getGroupsFetch(this.user);
  }

  /**
   *  Shows the popup modal for user confirmation.
   */
  showModal = (e, modalData) => {
    e.preventDefault()
    this.setState({ modalOpen: true, modalData });
  }

  /**
   *  Hides the popup modal.
   */
  onModalClose = () => this.setState({ modalOpen: false });

  /**
   *  Handle the Yes or No confirmation from the modal.
   *  If Yes, proceed with deletion of group.
   */
  handleModalClick = (e) => {
    const confirm = e.target.dataset.confirm;
    if (confirm === 'true') {
      this.onModalClose();
      const {modalData} = this.state;
      const {group} = modalData;
      this.handleDeleteGroup(group)
    }else this.onModalClose();

  }

  /**
   *  Get the groups from the database.
   */
  getGroupsFetch = (user) => {
    axios.get(`/api/groups/user/${user}`, {
    }).then((res) => {
      this.setState({
        groups: res.data.groups,
        areGroupsLoading: false,
        noOwned: false,
        manageGroup: {}
     });
    }).catch((err) => {
      throw new Error('Error getting groups: ', err);
    });
  }

  /**
   *  Set state values for when group input text changes.
   */
  handleChange = (e, { name, value }) => {
    this.setState({
      [name]: value,
      groupExists: false,
      exceededGrouplimit: false,
      errors: {}
     });
  }

  /**
   *  Validate then add new group to database.
   */
  handleSubmitNewGroup = (e) => {
    let {newGroup} = this.state;
    newGroup = newGroup.trim();

    if (this.handleGroupValidation(newGroup)) {
      this.setState({addGroupLoading: true});
      this.addGroupFetch(newGroup);
    }
  }

  /**
   *  Validate the new group text to be added. Return errors.
   */
  handleGroupValidation = (newGroup) => {
    let valid = true;
    let errors = {};

    if(!newGroup){
      errors["newGroup"] = "Cannot be empty";
      valid = false;
    }

    if(valid && (newGroup.length < 4 || newGroup.length > 17)){

      errors["newGroup"] = "Must be between 4 and 17 chars.";
      valid = false;
    }

    if(valid && !/^[\d\w\s_-]+$/.test(newGroup)) {
      errors["newGroup"] = "Only letters, numbers, spaces, underscores or hyphens.";
      valid = false;
    }
    this.setState({errors: errors});

    return valid;
  }

  /**
   *  Send new group data to be added to the database.
   */
  addGroupFetch = (group) => {
    axios.post('/manage/groups/add', {
      group: group,
      user: this.user
    }, {
      headers: {
        "x-csrf-token": this.csrf
      }
    }).then((res) => {
      if (!res.data.invalidCSRF) {
        if (res.data.exists) {
          this.setState({
            groupExists: true,
            exceededGrouplimit: false,
            addGroupLoading: false,
            noOwned: false
          });
        }else if (res.data.exceeded) {
          this.setState({
            exceededGrouplimit: true,
            groupExists: false,
            addGroupLoading: false,
            noOwned: false
          });
        } else {
          const {groups} = this.state;
          this.setState({
            groups: [
              res.data.group,
              ...groups,
            ],
            newGroup: '',
            groupExists: false,
            noOwned: false,
            addGroupLoading: false,
          });
        }
      }
    }).catch((err) => {
      throw new Error('Error adding group: ', err);
    });
  }

  /**
   *  Set appropriate state values when user confirms Yes to delete.
   */
  handleDeleteGroup = (group) => {
    this.setState({
      isGroupLoading: true,
      selectedGroup: group,
      modalData: {}
    });
    this.deleteGroupFetch(group);
  }

  /**
   *  Delete the group from the database.
   */
  deleteGroupFetch = (group) => {
    axios.post('/manage/groups/delete', {
      group: group,
      user: this.user
    }, {
      headers: {
        "x-csrf-token": this.csrf
      }
    }).then((res) => {
      if (res.data) {
        const {groups} = this.state;
        const oldGroups = groups;
        const newGroup = oldGroups.filter(g => g.name !== group);
        this.setState({
          groups: newGroup,
          manageGroup: {},
          isGroupLoading: false
        })
      }
    }).catch(err => {
      throw new Error('Error deleting group: ', err);
    })
  }

  /**
   *  Get ready to fetch group data to be edited/managed.
   */
  handleManageGroup = (e, group) => {
    e.preventDefault();
    this.setState({
      isGroupLoading: true,
      selectedGroup: group
    });
    this.manageGroupFetch(group);
  }

  /**
   *  Get the group, posts and users data for the group to be managed.
   */
  manageGroupFetch = (group) => {
    axios.get(`/api/groups/${group}/${this.user}`, {
    }).then(res => {
      this.setState({
        manageGroup: res.data,
        isGroupLoading: false,
     });
    }).catch(err => {
      throw new Error('Error getting group to manage: ', err);
    })
  }

  render() {
    const {
      newGroup,
      groups,
      groupExists,
      exceededGrouplimit,
      areGroupsLoading,
      addGroupLoading,
      manageGroup,
      noOwned,
      errors,
      isGroupLoading,
      selectedGroup,
      modalOpen,
      modalData,
      /*searchResults,
      searchValue*/
    } = this.state;

    const {
      user,
      csrf,
    } = this.props;

    let addError = '';
    if (groupExists) addError = <ErrorLabel text={this.existText} />;
    if (exceededGrouplimit) addError = <ErrorLabel text={this.exceededGrouplimit} />;
    if (errors["newGroup"] !== undefined) addError = <ErrorLabel text={errors["newGroup"]} />;

    const newGroupError = groupExists || exceededGrouplimit;

    return (
      <div className="manage">
        <Grid columns={1} stackable>

          <Grid.Column width={16} className="main">
            <Grid>
              <Grid.Row className="header-row">
                <Grid.Column floated='left' width={10}>

                  <Header as="h2">Communities You Own</Header>
                  {
                      /*<SearchComponent
                      onResultSelect={this.handleResultSelect}
                      onSearchChange={this.handleSearchChange}
                      results={searchResults}
                      value={searchValue}
                    />*/
                }
                </Grid.Column>
                <Grid.Column floated='right' width={6}>
                  <div className="">
                    <Form size="tiny" onSubmit={this.handleSubmitNewGroup}>
                      <Form.Group style={{float: 'right'}}>
                        <Form.Field>
                          <Form.Input
                            placeholder='Create a group'
                            name='newGroup'
                            value={newGroup}
                            onChange={this.handleChange}
                            error={newGroupError}
                            loading={addGroupLoading}
                          />
                          {addError}
                        </Form.Field>
                        <Form.Button icon size="tiny" color="blue">
                          <Icon name="plus" />
                        </Form.Button>
                      </Form.Group>
                    </Form>
                  </div>
                </Grid.Column>
              </Grid.Row>

              <ModalConfirm
                modalOpen={modalOpen}
                onModalClose={this.onModalClose}
                handleModalClick={this.handleModalClick}
                modalData={modalData}
              />

              <GroupsList
                groups={groups}
                areGroupsLoading={areGroupsLoading}
                handleManageGroup={this.handleManageGroup}
                noOwned={noOwned}
                isGroupLoading={isGroupLoading}
                selectedGroup={selectedGroup}
                showModal={this.showModal}
              />

              {
              (manageGroup && Object.entries(manageGroup).length)
                ? (
                  <GroupManage
                    manageGroup={manageGroup}
                    csrf={csrf}
                    user={user}
                  />
                  )
                : ''
              }

              <Divider />

              <Grid.Row className="header-row">
                <Grid.Column floated='left' width={6}>
                  <Header as="h2">Communities You Joined</Header>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column>
                  <Grid stackable className="groups">
                    <Grid.Column width={8}>
                      <Segment>
                        <p>
                          {"You don't belong to any other communities."}
                        </p>
                      </Segment>
                    </Grid.Column>
                  </Grid>
                </Grid.Column>
              </Grid.Row>

            </Grid>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { userData, csrf } = state.auth;

  return {
    user: userData.name,
    csrf
  }
}

export default connect(mapStateToProps)(Manage)
