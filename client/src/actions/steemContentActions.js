//import axios from 'axios';
import { Client } from 'dsteem';

import { getUserGroups, addPost, logger } from '../utils/fetchFunctions';

const client = new Client('https://hive.anyx.io/');

export const GET_SUMMARY_START = 'GET_SUMMARY_START';
export const GET_SUMMARY_SUCCESS = 'GET_SUMMARY_SUCCESS';
export const GET_DETAILS_START = 'GET_DETAILS_START';
export const GET_DETAILS_SUCCESS = 'GET_DETAILS_SUCCESS';
export const GET_GROUPS_SUCCESS = 'GET_GROUPS_SUCCESS';
export const ADD_POST_EXISTS = 'ADD_POST_EXISTS';
export const ADD_POST_START = 'ADD_POST_START';
export const GROUP_SELECT = 'GROUP_SELECT';
export const MODAL_SHOW = 'MODAL_SHOW';
export const MODAL_CLOSE = 'MODAL_CLOSE';

/**
 *  Action creator for requesting returning user athentication.
 *
 *  @return {object} The action data
 */
export const summaryStart = () => ({
  type: GET_SUMMARY_START,
});

/**
 *  Action creator for requesting returning user athentication.
 *
 *  @param {array} posts Posts to display
 *  @param {boolean} noMore If there are more posts to fetch
 *  @return {object} The action data
 */
export const summarySuccess = (posts, noMore) => ({
  type: GET_SUMMARY_SUCCESS,
  posts,
  noMore,
});

/**
 *  Action creator for requesting returning user athentication.
 *
 *  @return {object} The action data
 */
export const detailsStart = () => ({
  type: GET_DETAILS_START,
});

/**
 *  Action creator for requesting returning user athentication.
 *
 *  @param {array} post Post to display
 *  @return {object} The action data
 */
export const detailsSuccess = (post) => ({
  type: GET_DETAILS_SUCCESS,
  post,
});


export const groupsSuccess = (groups) => ({
  type: GET_GROUPS_SUCCESS,
  groups,
});

export const addPostStart = () => ({
  type: ADD_POST_START,
});

export const addPostExists = (postExists) => ({
  type: ADD_POST_EXISTS,
  postExists,
});

/**
 *  Set state values for when group select changes.
 *  Reset post exists error flag.
 *
 *  @param {event} e Event triggered by element to handle
 *  @param {string} value Value of the element triggering the event
 */
export const handleGroupSelect = (value) => ({
  type: GROUP_SELECT,
  selectedGroup: value,
});

/**
 *  Shows the popup modal for user confirmation.
 *
 *  @param {event} e Event triggered by element to handle
 *  @param {object} modalData Post and user data for the modal
 */
export const showModal = (e, type, data) => {
  e.preventDefault();
  return ({
    type: MODAL_SHOW,
    addPostData: data,
  });
}

/**
 *  Hides the popup modal.
 */
export const onModalCloseAddPost = () => ({
  type: MODAL_CLOSE,
});

/**
 *  Function to fetch the returning user authentication from the database.
 *
 *  @param {function} dispatch Redux dispatch function
 *  @returns {function} Dispatches returned action object
 */
export const getSummaryContent = (selectedFilter, query, nextPost) => (dispatch, getState) => {
  dispatch(summaryStart());

  return client.database.getDiscussions(selectedFilter, query)
    .then(result => {
      let noMore = false;
      let newPosts = null;

      if (result) {
        if (nextPost) {
          newPosts = [...getState().steemContent.posts, ...result.slice(1)];
        }else {
          newPosts = result;
        }
      }else {
        noMore = true;
        newPosts = getState().posts;
      }

      const {user} = getState().auth;
      if (user)
        dispatch(getGroupsFetch(user));

      dispatch(summarySuccess(newPosts, noMore));
    }).catch(err => {
      logger({level: 'error', message: {name: err.name, message: err.message, stack: err.stack}});
    });
}

export const getDetailsContent = (author, permlink) => (dispatch, getState) => {
  dispatch(detailsStart());
  return client.database.call('get_content', [author, permlink])
    .then(result => {

      const {user} = getState().auth;
      if (user)
        dispatch(getGroupsFetch(user));

      dispatch(detailsSuccess(result));
  })
}

/**
 *  Fetch the groups for groups selection when adding a post.
 *
 *  @param {string} user User to get groups for
 */
const getGroupsFetch = (user) => (dispatch, getState) => {
  const {groups} = getState().steemContent;
  if (groups[0].text !== "No Groups") return;

  return getUserGroups(user, 'all')
    .then(res => {
      const groups = res.data.groups.map((g, i) => {
        return {key: i, value: g.name, text: g.display}
      })
      dispatch(groupsSuccess(groups));
    }).catch(err => {
      logger({level: 'error', message: {name: err.name, message: err.message, stack: err.stack}});
    });
}

/**
 *  Handle the Yes or No confirmation from the modal.
 *  If Yes, proceed with deletion of post or user.
 *
 *  @param {event} e Event triggered by element to handle
 */
export const handleModalClickAddPost = (e) => dispatch => {
  const confirm = e.target.dataset.confirm;
  //const {addPost, onModalCloseAddPost} = this.props;
  if (confirm === 'true')
    dispatch(addPostFetch());
  else
    dispatch(onModalCloseAddPost());
}

/**
 *  Send new post to be added to the database.
 *  Reset the flags depending on errors or not, add new post to posts state.
 */
const addPostFetch = () => (dispatch, getState) => {
  const {
    auth: {
      user,
      csrf
    },
    steemContent: {
      selectedGroup,
      addPostData
    }
  } = getState();
  addPost({group: selectedGroup, user, ...addPostData}, csrf)
  .then(res => {
    if (!res.data.invalidCSRF) {
      if (res.data.exists) {
        const postExists = true;
        dispatch(addPostExists(postExists));
      }else if (res.data.post) {
        dispatch(onModalCloseAddPost());
      }

    }
  }).catch((err) => {
    logger({level: 'error', message: {name: err.name, message: err.message, stack: err.stack}});
  });
}

export default getSummaryContent;
