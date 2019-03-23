import React, {Component} from 'react';
import './PostActions.css';
import { Icon, Popup } from "semantic-ui-react";

import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css';
import './VoteSlider.css';
import DollarDisplay from '../../common/DollarDisplay';
import UserLink from '../../common/UserLink';

const getUpvotes = activeVotes => activeVotes.filter(vote => vote.percent > 0);
const getDownvotes = activeVotes => activeVotes.filter(vote => vote.percent < 0);
const sortVotes = (votes, sortBy) => votes.sort((a, b) => a[sortBy] - b[sortBy]);

/**
 *  Displays the data and actions for the posts.
 *  This includes likes, votes, comments, dislikes, flags and adding a post to
 *  a community.
 *
 *  @param {string} activeVotesCount Number of Steem upvotes
 *  @param {number} commentCount Number of comments
 *  @param {string} author Author of post
 *  @param {number} category Category of the post
 *  @param {string} permlink Steem permlink for post
 *  @param {string} title Post's title
 *  @param {function} showModal Parent function to show the add post modal
 */
class PostActions extends Component {
  state = {
    unvote: false,
    showSlider: false,
    sliderWeight: 10000
  }

  /**
   *  Initial voting requests to process.
   */
  vote = (e, user, pid) => {
    e.preventDefault();

    //Don't upvote if not logged in
    if (!user) {
      return null;
    }

    //Don't upvote if already upvoted
    const upvote = document.querySelector(`#pid-${pid}`);
    if (upvote.classList.contains("votedOn")) {
      this.setState({unvote: true});
      return null;
    }

    this.setState({showSlider: true});
  }

  /**
   *  Changes to the weight for the slider.
   */
  handleWeightChange = weight => {
    this.setState({ sliderWeight: weight });
  };

  /**
   *  The real upvote is sent here.
   */
  handleVote = (e, author, permlink, weight) => {
    e.preventDefault();
    const {handleUpvote} = this.props;
    this.setState({ showSlider: false });
    handleUpvote(author, permlink, weight);
  }

  /**
   *  Exit out of unvote when already voted.
   */
  handleCloseUnvote = () => {
    this.setState({unvote: false});
  }

  comment = (e) => {
    e.preventDefault();
  }

  resteem = (e) => {
    e.preventDefault();
  }

  flag = (e) => {
    e.preventDefault();
  }

  render() {
    const {
      props: {
        activeVotes, commentCount, author, category, payoutValue, permlink, title, showModal, user, handleUpvote, upvotePayload, ratio, pid
      },
      state: {
        unvote,
        showSlider,
        sliderWeight,
      }
    } = this;

    const votedAuthor = upvotePayload.author;
    const votedPermlink = upvotePayload.permlink;
    const votedVoters = upvotePayload.post.active_votes;
    const isVoted = upvotePayload.votedPosts.length ? upvotePayload.votedPosts.some(vp => vp.id === pid) : false;

    const isThisPost = votedAuthor === author && votedPermlink === permlink;

    let upvoteClasses = '';
    if (upvotePayload.isUpvoting && isThisPost) {
      upvoteClasses = 'loading';
    }else if (isVoted) {
      upvoteClasses = 'votedOn';
    }else if (activeVotes.some(v => v.voter === user)) {
      upvoteClasses = 'votedOn';
    }

    let votesCount = getUpvotes(activeVotes).length;
    let voters = activeVotes;
    if (votedVoters.length && isThisPost) {
      votesCount = getUpvotes(votedVoters).length;
      voters = votedVoters;
    }

    voters = sortVotes(voters, 'rshares').reverse();

    let votersPopup = '';
    if (votesCount) {
      votersPopup = voters.slice(0, 14).map(vote => (
        <div key={vote.voter}>
          {<UserLink user={vote.voter} />}

          {vote.rshares * ratio > 0.01 && (
            <span style={{ opacity: '0.5' }}>
              {' '}
              <DollarDisplay value={vote.rshares * ratio} />
            </span>
          )}
        </div>
      ));
    }else {
      votersPopup = 'No voters yet.';
    }

    let sliderClass = 'vslider-show';
    let voteSlider = null;
    if (showSlider) {
      sliderClass += ' showing';
      voteSlider  = (
        <div className='change-weight'>
          <ul>
            <li>
              <a
                href='/upvote'
                className='accept-weight'
                onClick={e => this.handleVote(e, author, permlink, sliderWeight)}
              >
                <Icon name='chevron up circle' size='big' color='green' />
              </a>
            </li>
            <li>
              <span>
                <div className='weight-display'>{sliderWeight / 100}%</div>
                <Slider
                  min={100}
                  max={10000}
                  step={100}
                  value={sliderWeight}
                  onChange={this.handleWeightChange}
                  tooltip={false}
                />
              </span>
            </li>
            <li>
              <a
                href='/close'
                className='close-weight'
                onClick={e => {
                  e.preventDefault();
                  this.setState({ showSlider: false });
                }}
              >
                <Icon name='window close outline' size='big' color='red' />
              </a>
            </li>
          </ul>
        </div>
      )
    }

    return (
      <React.Fragment>
        <ul className="meta">

          <li className="item payout">{payoutValue}</li>

          <li className="item upvote">
            <div className='vslider'>
              <div className={sliderClass}>
                {voteSlider}
              </div>
            </div>
            <Popup
              trigger={(
                <a ref={this.contextRef} href="/vote" onClick={e => this.vote(e, user, pid)} title={`${votesCount} upvotes on Steem`}>
                  <Icon id={`pid-${pid}`} name='chevron up circle' size='large' className={upvoteClasses} />
                </a>
              )}
              open={unvote}
              onClose={this.handleCloseUnvote}
              position='top center'
              flowing
              hoverable
            >
              {'Unvoting in the works.'}
            </Popup>
            <Popup
              trigger={<span>{votesCount}</span>}
              horizontalOffset={15}
              flowing
              hoverable
            >
              {votersPopup}
            </Popup>
          </li>

          <li className="item disabled">
            <a href="/comment" onClick={(e) => this.comment(e)} title={`${commentCount} comments`}>
              <Icon name='comment outline' size='large' />
              <strong>{commentCount}</strong>
            </a>
          </li>

          <li className="item disabled">
            <a href="/resteem" onClick={(e) => this.resteem(e)} title="Resteem">
              <Icon name='retweet' size='large' />
            </a>
          </li>

          <li className="item disabled">
            <a href="/flag" onClick={(e) => this.flag(e)} title="Flag this post on Steem">
              <Icon name='flag outline' size='large' />
            </a>
          </li>

        </ul>

        <div className='right'>
          {
            user
            && (
              <a href="/group/add" onClick={(e) => showModal(e, 'addPost', {author, category, permlink, title})} title="Add to a community">
                <Icon name='plus circle' size='large' />
              </a>
            )
          }
        </div>
      </React.Fragment>
    )
  }
}

export default PostActions;