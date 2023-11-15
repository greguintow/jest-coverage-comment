import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { components } from '@octokit/openapi-types/types'
import { Options } from './types.d'

const MAX_COMMENT_LENGTH = 65536

const REQUESTED_COMMENTS_PER_PAGE = 20

type Github = ReturnType<typeof getOctokit>

type Comment = components['schemas']['issue-comment']

async function getExistingComments(
  github: Github,
  options: Options
): Promise<Comment[]> {
  let page = 0
  let results: Comment[] = []
  let response: { data: Comment[] }
  do {
    response = await github.rest.issues.listComments({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      per_page: REQUESTED_COMMENTS_PER_PAGE,
      page,
    })
    results = results.concat(response.data)
    page++
  } while (response.data.length === REQUESTED_COMMENTS_PER_PAGE)

  return results.filter(
    (comment) =>
      comment.user?.login === 'github-actions[bot]' &&
      comment.body?.startsWith(options.watermark)
  )
}

async function deleteOldComments(
  github: Github,
  options: Options
): Promise<void> {
  const existingComments = await getExistingComments(github, options)

  for (const comment of existingComments) {
    core.debug(`Deleting comment: ${comment.id}`)
    try {
      await github.rest.issues.deleteComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: comment.id,
      })
    } catch (error) {
      core.warning(
        `Failed to delete comment: ${comment.id}. ${(error as Error).message}`
      )
    }
  }
}

export async function createComment(
  options: Options,
  body: string
): Promise<void> {
  try {
    const { eventName, payload } = context
    const { repo, owner } = context.repo

    const octokit = getOctokit(options.token)
    const issue_number = payload.pull_request ? payload.pull_request.number : 0

    if (body.length > MAX_COMMENT_LENGTH) {
      const warningsArr = [
        `Your comment is too long (maximum is ${MAX_COMMENT_LENGTH} characters), coverage report will not be added.`,
        'Try one/some of the following:',
        `- Add "['text-summary', { skipFull: true }]" - to remove fully covered files from report`,
        '- Add "hide-summary: true" - to remove the summary report',
      ]

      if (!options.reportOnlyChangedFiles) {
        warningsArr.push(
          '- Add "report-only-changed-files: true" - to report only changed files and not all files'
        )
      }

      if (!options.removeLinksToFiles) {
        warningsArr.push(
          '- Add "remove-links-to-files: true" - to remove links to files'
        )
      }

      if (!options.removeLinksToLines) {
        warningsArr.push(
          '- Add "remove-links-to-lines: true" - to remove links to lines'
        )
      }

      core.warning(warningsArr.join('\n'))
    }

    if (eventName === 'push') {
      core.info('Create commit comment')

      await octokit.rest.repos.createCommitComment({
        repo,
        owner,
        commit_sha: options.commit,
        body,
      })
    } else if (
      eventName === 'pull_request' ||
      eventName === 'pull_request_target'
    ) {
      if (options.createNewComment) {
        if (options.deleteOldComments) {
          core.info('Deleting old comments')

          await deleteOldComments(octokit, options)
        }

        core.info('Creating a new comment')

        await octokit.rest.issues.createComment({
          repo,
          owner,
          issue_number,
          body,
        })
      } else {
        // Now decide if we should issue a new comment or edit an old one
        const { data: comments } = await octokit.rest.issues.listComments({
          repo,
          owner,
          issue_number,
        })

        const comment = comments.find(
          (c) =>
            c.user?.login === 'github-actions[bot]' &&
            c.body?.startsWith(options.watermark)
        )

        if (comment) {
          core.info('Found previous comment, updating')
          await octokit.rest.issues.updateComment({
            repo,
            owner,
            comment_id: comment.id,
            body,
          })
        } else {
          core.info('No previous comment found, creating a new one')
          await octokit.rest.issues.createComment({
            repo,
            owner,
            issue_number,
            body,
          })
        }
      }
    } else {
      if (!options.hideComment) {
        core.warning(
          `This action supports comments only on 'pull_request', 'pull_request_target' and 'push' events. '${eventName}' events are not supported.\nYou can use the output of the action.`
        )
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.error(error.message)
    }
  }
}
