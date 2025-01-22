import pLimit from 'p-limit';
import { throttleRequest } from '../utils/throttle.mts';
import { retryWithBackoff } from '../utils/retry.mts';
import { addDiscussionComment, closeDiscussion, searchDiscussions } from '../api/githubApi.mts';
import { CONCURRENCY_LIMIT, MUTATION_DELAY } from '../config.mts';
import { unansweredClosingMessage, answeredClosingMessage } from '../constants/messages.mts';

const limit = pLimit(CONCURRENCY_LIMIT);

export const processDiscussions = async (searchQuery: string) => {
  let after = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { search } = await throttleRequest(() =>
      searchDiscussions(searchQuery, after)
    );
    const { edges, pageInfo } = search;
    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;

    await Promise.all(
      edges.map(({ node }: any) =>
        limit(async () => {
          // Determine the message type
          const comment =
            node.answerChosenAt !== null
              ? answeredClosingMessage // For answered discussions
              : unansweredClosingMessage; // For unanswered discussions

          console.log(`Processing discussion: ${node.title} (${node.url})`);
          await retryWithBackoff(() => addDiscussionComment(node.id, comment));
          await retryWithBackoff(() => closeDiscussion(node.id));
          await new Promise(res => setTimeout(res, MUTATION_DELAY)); // Delay between mutations
        })
      )
    );
  }
};
