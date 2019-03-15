import React from 'react';
import moment from 'moment';

import './PostsSummary.css';
import AuthorCatgoryTime from './AuthorCatgoryTime';
import Thumbnail from './Thumbnail';
import PostActions from './PostActions';
import { extractContent } from './helpers/extractContent';
import RepLog10 from '../../../utils/reputationCalc';
import TitleLink from '../../common/TitleLink';

/**
 *  Root container for post summaries.
 *
 *  @param {array} posts All the posts fetched
 *  @param {array} nextPost Whether to skip the first post, dupe of prev last post
 *  @param {function} showModal Parent function to show the add post modal
 */
const PostsSummary = ({posts, nextPost, showModal, user, csrf, handleUpvote, upvotePayload, isFetching}) => {

  if (!posts.length && !isFetching) {
    return "No Posts";
  }else {
    return (
      posts.map((p, i) => {

        if (nextPost) {
					nextPost = false;
					return false;
				}
        const extract = extractContent(p);
        const post = {...p, ...extract};

        const title = post.title;
        const author = post.author;
        const authorReputation = RepLog10(post.author_reputation);
        //const url = post.url;
        const desc = post.desc;
        const permlink = post.permlink;
        const category = post.category;
        const thumb = post.image_link;
        const payoutValue = post.pending_payout_value/* + post.total_payout_value*/;
        //const created = new Date(post.created).toDateString();
        const createdFromNow = moment.utc(post.created).fromNow();
        const commentCount = post.children;
        const activeVotes = post.active_votes;

        const totalPayout =
          parseFloat(post.pending_payout_value) +
          parseFloat(post.total_payout_value) +
          parseFloat(post.curator_payout_value);
        const totalRShares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
        const ratio = totalRShares === 0 ? 0 : totalPayout / totalRShares;


        return (
          <div key={p.id} className='post'>
            <AuthorCatgoryTime
              author={author}
              authorReputation={authorReputation}
              category={category}
              createdFromNow={createdFromNow}
            />

            <div className="block">
              {
                (thumb)
                  ? (
                    <div className="thumbnail">
                      <Thumbnail thumb={thumb} />
                    </div>
                    )
                  : ''
              }
              <div className="summary-content" data-permlink={permlink}>
                <h4>
                  <TitleLink
                    title={title}
                    category={category}
                    author={author}
                    permlink={permlink}
                  />
                </h4>
                <p>
                  {desc}
                </p>
                <div className='post-actions'>
                  <PostActions
                    activeVotes={activeVotes}
                    commentCount={commentCount}
                    author={author}
                    category={category}
                    payoutValue={payoutValue}
                    permlink={permlink}
                    title={title}
                    showModal={showModal}
                    user={user}
                    handleUpvote={handleUpvote}
                    upvotePayload={upvotePayload}
                    ratio={ratio}
                  />
                </div>
              </div>
            </div>
            <hr />
          </div>
        )
      })
    )
  }
}

export default PostsSummary;
