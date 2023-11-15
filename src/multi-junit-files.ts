import * as core from '@actions/core'
import { junitToMarkdown, parseJunit } from './junit'
import { Junit, JunitReport, Options } from './types'
import { getContentFile, notNull, parseLine } from './utils'

/** Return multiple report in markdown format. */
export async function getMultipleJunitReport(
  options: Options
): Promise<JunitReport | null> {
  const { multipleJunitFiles } = options

  if (!multipleJunitFiles?.length) {
    return null
  }

  const results: Junit = {
    tests: 0,
    skipped: 0,
    failures: 0,
    errors: 0,
    succeeded: 0,
    time: 0,
  }

  try {
    const lineReports = multipleJunitFiles.map(parseLine).filter(notNull)
    if (!lineReports.length) {
      core.error(
        'Generating report for multiple JUnit files. No files are provided'
      )
      return null
    }

    const tableTitle = options.junitTitle ? `# ${options.junitTitle}\n\n` : ''

    let atLeastOneFileExists = false
    let table =
      `${tableTitle}| Title | Tests | Skipped | Failures | Errors | Time |\n` +
      `| --- | --- | --- | --- | --- | --- |\n`

    for (const titleFileLine of lineReports) {
      const { title, file } = titleFileLine
      const xmlContent = getContentFile(file)
      const parsedXml = await parseJunit(xmlContent)

      if (parsedXml) {
        const junitHtml = junitToMarkdown(parsedXml, options, true)
        table += `| ${title} ${junitHtml}\n`
        atLeastOneFileExists = true

        const { skipped, errors, failures, tests, time, succeeded } = parsedXml

        results.tests += tests
        results.skipped += skipped
        results.failures += failures
        results.errors += errors
        results.time += time
        results.succeeded = succeeded
      }
    }

    if (atLeastOneFileExists) {
      return {
        ...results,
        junitHtml: table,
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.error(
        `Generating summary report for multiple JUnit files. ${error.message}`
      )
    }
  }

  return null
}
