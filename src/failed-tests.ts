import * as core from '@actions/core'
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
<br/>

${body}

</details>
`
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

export const getFailureDetails = ({ testResults }: JsonReport): string => {
  if (
    !testResults ||
    !testResults.some(
      ({ message, status }) => message.length > 0 && status !== 'passed'
    )
  ) {
    return ''
  }

  const wrapCode = (code: string): string => `\`\`\`\n${code}\n\`\`\``

  const codeBlocks = testResults
    .filter(({ status }) => status !== 'passed')
    .flatMap(({ message, assertionResults }) => {
      const stripped = stripAnsi(message)
      if (stripped.trim().length === 0) {
        return ''
      }

      const failures = assertionResults
        ?.map((assertionResult) => {
          const { failureDetails, title, ancestorTitles } = assertionResult

          if (failureDetails && failureDetails.length > 0) {
            const [{ message: failureMessage }] = failureDetails

            const heading = createTestTitleFromAssertionResult({
              ancestorTitles,
              title,
            })

            return createMarkdownSpoiler({
              summary: heading,
              body: wrapCode(failureMessage),
            })
          }

          return false
        })
        .filter(Boolean)

      return failures
    })

  const markdown = createMarkdownSpoiler({
    summary: 'Failed Tests',
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
