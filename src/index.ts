import * as core from '@actions/core'
import { Options } from './types.d'
import { context } from '@actions/github'
import { createComment } from './create-comment'
import { getJunitReport } from './junit'
import { getCoverageReport } from './coverage'
import { getSummaryReport } from './summary'
import { getChangedFiles } from './changed-files'
import { getMultipleReport } from './multi-files'
import { getMultipleJunitReport } from './multi-junit-files'
import { getFailedTestsReport } from './failed-tests'

async function main(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true })
    const title = core.getInput('title', { required: false })
    const badgeTitle = core.getInput('badge-title', { required: false })
    const hideSummary = core.getBooleanInput('hide-summary', {
      required: false,
    })
    const removeLinksToFiles = core.getBooleanInput('remove-links-to-files', {
      required: false,
    })
    const removeLinksToLines = core.getBooleanInput('remove-links-to-lines', {
      required: false,
    })
    const summaryTitle = core.getInput('summary-title', { required: false })
    const summaryFile = core.getInput('coverage-summary-path', {
      required: false,
    })
    const junitTitle = core.getInput('junitxml-title', { required: false })
    const junitFile = core.getInput('junitxml-path', {
      required: false,
    })
    const coverageTitle = core.getInput('coverage-title', { required: false })
    const coverageFile = core.getInput('coverage-path', {
      required: false,
    })
    const jestTestReportFile = core.getInput('jest-json-report-path', {
      required: false,
    })
    const coveragePathPrefix = core.getInput('coverage-path-prefix', {
      required: false,
    })
    const createNewComment = core.getBooleanInput('create-new-comment', {
      required: false,
    })
    const deleteOldComments = core.getBooleanInput('delete-old-comments', {
      required: false,
    })
    const hideComment = core.getBooleanInput('hide-comment', {
      required: false,
    })
    const reportOnlyChangedFiles = core.getBooleanInput(
      'report-only-changed-files',
      { required: false }
    )
    const multipleFiles = core.getMultilineInput('multiple-files', {
      required: false,
    })
    const multipleJunitFiles = core.getMultilineInput(
      'multiple-junitxml-files',
      { required: false }
    )
    const uniqueIdForComment = core.getInput('unique-id-for-comment', {
      required: false,
    })

    const { repo, owner } = context.repo
    const { eventName, payload } = context
    const watermarkUniqueId = uniqueIdForComment
      ? `| ${uniqueIdForComment} `
      : ''
    const watermark = `<!-- Jest Coverage Comment: ${context.job} ${watermarkUniqueId}-->\n`
    let finalHtml = ''

    const options: Options = {
      token,
      repository: `${owner}/${repo}`,
      prefix: `${process.env.GITHUB_WORKSPACE}/`,
      commit: '',
      watermark,
      title,
      badgeTitle,
      summaryFile,
      summaryTitle,
      junitTitle,
      junitFile,
      jestTestReportFile,
      coverageTitle,
      coverageFile,
      coveragePathPrefix,
      hideSummary,
      removeLinksToFiles,
      removeLinksToLines,
      createNewComment,
      deleteOldComments,
      hideComment,
      reportOnlyChangedFiles,
      multipleFiles,
      multipleJunitFiles,
    }

    if (eventName === 'pull_request' && payload) {
      options.commit = payload.pull_request?.head.sha
      options.head = payload.pull_request?.head.ref
      options.base = payload.pull_request?.base.ref
    } else if (eventName === 'push') {
      options.commit = payload.after
      options.head = context.ref
    }

    if (options.reportOnlyChangedFiles) {
      const changedFiles = await getChangedFiles(options)
      options.changedFiles = changedFiles

      // When GitHub event is different to 'pull_request' or 'push'
      if (!changedFiles) {
        options.reportOnlyChangedFiles = false
      }
    }

    const report = getSummaryReport(options)
    const { coverage, color, summaryHtml } = report

    if (coverage || summaryHtml) {
      core.startGroup(options.summaryTitle || 'Summary')
      core.info(`coverage: ${coverage}`)
      core.info(`color: ${color}`)
      core.info(`summaryHtml: ${summaryHtml}`)

      core.setOutput('coverage', coverage)
      core.setOutput('color', color)
      core.setOutput('summaryHtml', summaryHtml)
      core.endGroup()
    }

    if (title) {
      finalHtml += `# ${title}\n\n`
    }

    const reportContent = {
      testReportHtml: '',
      summaryHtml,
      junitReportHtml: '',
    }

    if (options.junitFile) {
      const junit = await getJunitReport(options)
      const { junitHtml, tests, skipped, failures, errors, time, succeeded } =
        junit

      if (junitHtml) {
        reportContent.junitReportHtml = junitHtml

        core.startGroup(options.junitTitle || 'Junit')
        core.info(`tests: ${tests}`)
        core.info(`skipped: ${skipped}`)
        core.info(`failures: ${failures}`)
        core.info(`errors: ${errors}`)
        core.info(`time: ${time}`)
        core.info(`junitHtml: ${junitHtml}`)

        core.setOutput('tests', tests)
        core.setOutput('skipped', skipped)
        core.setOutput('failures', failures)
        core.setOutput('errors', errors)
        core.setOutput('time', time)
        core.setOutput('junitHtml', junitHtml)
        core.endGroup()

        let testReportHtml = ''

        if (failures) {
          testReportHtml += `**❌ ${failures} failed**\n`
        }

        if (succeeded) {
          testReportHtml += ` **✅ ${succeeded} passed**\n`
        }

        if (coverage) {
          testReportHtml += `**📊 ${coverage}% coverage**\n`
        }

        reportContent.testReportHtml = testReportHtml
      }
    }

    if (multipleFiles?.length) {
      finalHtml += `\n\n${getMultipleReport(options)}`
    }

    if (multipleJunitFiles?.length) {
      const junitReport = await getMultipleJunitReport(options)

      if (junitReport) {
        const { succeeded, failures } = junitReport

        let testReportHtml = ''
        if (failures) {
          testReportHtml += `**❌ ${failures} failed**\n`
        }
        if (succeeded) {
          testReportHtml += ` **✅ ${succeeded} passed**\n`
        }
        if (coverage) {
          testReportHtml += `**📊 ${coverage}% coverage**\n`
        }

        reportContent.testReportHtml = testReportHtml

        reportContent.junitReportHtml = `\n\n${junitReport.junitHtml}`
      }
    }

    if (reportContent.testReportHtml) {
      finalHtml += `\n\n${reportContent.testReportHtml}`
    }

    if (reportContent.summaryHtml) {
      finalHtml += `\n\n${reportContent.summaryHtml}`
    }

    if (reportContent.junitReportHtml) {
      finalHtml += `\n\n${reportContent.junitReportHtml}`
    }

    if (options.jestTestReportFile) {
      const jestTestReport = getFailedTestsReport(options)

      finalHtml += jestTestReport ? `\n\n${jestTestReport}` : ''
    }

    if (options.coverageFile) {
      const coverageReport = getCoverageReport(options)
      const {
        coverageHtml,
        coverage: reportCoverage,
        color: coverageColor,
        branches,
        functions,
        lines,
        statements,
      } = coverageReport
      finalHtml += coverageHtml ? `\n\n${coverageHtml}` : ''

      if (lines || coverageHtml) {
        core.startGroup(options.coverageTitle || 'Coverage')
        core.info(`coverage: ${reportCoverage}`)
        core.info(`color: ${coverageColor}`)
        core.info(`branches: ${branches}`)
        core.info(`functions: ${functions}`)
        core.info(`lines: ${lines}`)
        core.info(`statements: ${statements}`)
        core.info(`coverageHtml: ${coverageHtml}`)

        core.setOutput('coverage', reportCoverage)
        core.setOutput('color', coverageColor)
        core.setOutput('branches', branches)
        core.setOutput('functions', functions)
        core.setOutput('lines', lines)
        core.setOutput('statements', statements)
        core.setOutput('coverageHtml', coverageHtml)
        core.endGroup()
      }
    }

    if (!finalHtml || options.hideComment) {
      core.info('Nothing to report')
      return
    }

    const body = watermark + finalHtml
    await createComment(options, body)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

main()
