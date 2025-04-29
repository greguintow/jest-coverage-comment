import * as core from '@actions/core'
import { context } from '@actions/github'
import stripAnsi from 'strip-ansi'
import { JsonReport, Options } from './types'
import { getContentFile } from './utils'

type SpoilerConfig = {
  body: string
  summary: string
  tag?: string
}

function createMarkdownSpoiler({
  body,
  summary,
  tag = 'b',
}: SpoilerConfig): string {
  return `
<details><summary><${tag}>${summary}</${tag}></summary>
${tag.startsWith('h') ? '' : '<br/>'}

${body || ''}

</details>
`
}

function getCurrentBranch(): string {
  if (context.payload.pull_request) {
    return context.payload.pull_request.head.ref
  }

  return context.ref.replace('refs/heads/', '')
}

function createTestTitleFromAssertionResult({
  ancestorTitles,
  title,
}: {
  ancestorTitles?: string[]
  title: string
}): string {
  if (!ancestorTitles) return title

  return `${ancestorTitles.join(' > ')} > ${title}`
}

function getCodeSourceLink(failureMessage: string): string {
  const lastSentence = failureMessage.split('\n').at(-1)?.trim()

  if (!lastSentence?.startsWith('at Object.<anonymous>')) return ''

  const [filePath, line] = lastSentence
    .split('(')[1]
    .split(')')[0]
    .split(':')
    .slice(0, -1)
    .join(':')
    .split(':')

  const branchName = getCurrentBranch()

  const githubLink = `https://github.com/${context.repo.owner}/${context.repo.repo}/blob/${branchName}/${filePath}#L${line}`

  return `[:octocat: Go to source code](${githubLink})`
}

const wrapCode = (code: string): string => `\`\`\`\n${code}\n\`\`\``

export const getFailureDetails = ({ testResults }: JsonReport): string => {
  const codeBlocks = testResults
    ?.filter(({ status }) => status !== 'passed')
    .flatMap(({ assertionResults }) => {
      const failures = assertionResults?.map((assertionResult) => {
        const { failureDetails, failureMessages, title, ancestorTitles } =
          assertionResult

        const hasFailures =
          (failureMessages && failureMessages.length > 0) ||
          (failureDetails && failureDetails.length > 0)

        if (!hasFailures) return false

        const failureMessage =
          failureMessages?.[0] || failureDetails?.[0]?.message

        const heading = createTestTitleFromAssertionResult({
          ancestorTitles,
          title,
        })

        const formattedMessage = failureMessage ? stripAnsi(failureMessage) : ''
        const sourceCodeLink =
          formattedMessage && getCodeSourceLink(formattedMessage)

        let body = formattedMessage && wrapCode(formattedMessage)

        if (sourceCodeLink) {
          body += `\n\n${sourceCodeLink}`
        }

        return createMarkdownSpoiler({
          summary: heading,
          body,
        })
      })

      return failures
    })
    .filter(Boolean)

  if (!codeBlocks || codeBlocks.length === 0) return ''

  const markdown = createMarkdownSpoiler({
    summary: `Failed Tests - ${codeBlocks.length}`,
    body: codeBlocks.join('\n\n'),
    tag: 'h3',
  })

  return `${markdown}\n`
}

export function getFailedTestsReport(options: Options): string {
  const { jestTestReportFile } = options

  if (!jestTestReportFile) {
    return ''
  }

  const txtContent = getContentFile(jestTestReportFile)
  let parsedContent: JsonReport

  try {
    parsedContent = JSON.parse(txtContent) as JsonReport
  } catch {
    core.error(`Failed to parse ${jestTestReportFile} as JSON`)
    return ''
  }

  return getFailureDetails(parsedContent)
}
