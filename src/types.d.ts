export interface Options {
  token: string
  repository: string
  summaryFile: string
  summaryTitle?: string
  badgeTitle: string
  prefix: string
  watermark: string
  commit: string
  head?: string
  base?: string
  title?: string
  junitFile?: string
  junitTitle?: string
  coverageFile?: string
  jestTestReportFile?: string
  coverageTitle?: string
  coveragePathPrefix?: string
  hideSummary?: boolean
  removeLinksToFiles?: boolean
  removeLinksToLines?: boolean
  createNewComment?: boolean
  deleteOldComments?: boolean
  hideComment?: boolean
  reportOnlyChangedFiles?: boolean
  changedFiles?: ChangedFiles | null
  multipleFiles?: string[]
  multipleJunitFiles?: string[]
}

export interface ChangedFiles {
  all: string[]
  added?: string[]
  modified?: string[]
  removed?: string[]
  renamed?: string[]
  addedOrModified?: string[]
}

export interface LineSummary {
  total: number
  covered: number
  skipped: number
  pct: number
}

export interface Summary {
  lines: LineSummary
  statements: LineSummary
  functions: LineSummary
  branches: LineSummary
  branchesTrue: LineSummary
}

export type CoverageColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'brightgreen'

export interface SummaryReport {
  summaryHtml: string
  coverage: number
  color: CoverageColor
}

export interface Junit {
  skipped: number // calculated field
  tests: number
  failures: number
  errors: number
  succeeded: number
  time: number
}

export interface JunitReport extends Junit {
  junitHtml: string
}

export interface CoverageLine {
  file: string
  stmts: number
  branch: number
  funcs: number
  lines: number
  uncoveredLines: string[] | null
}

export interface CoverageReport {
  coverageHtml: string
  coverage: number
  color: CoverageColor
  branches: number
  functions: number
  lines: number
  statements: number
}

export interface MultipleFilesLine {
  title: string
  file: string
}

export type JsonReport = {
  numFailedTestSuites: number
  numFailedTests: number
  numPassedTestSuites: number
  numPassedTests: number
  numPendingTestSuites: number
  numPendingTests: number
  numRuntimeErrorTestSuites: number
  numTodoTests: number
  numTotalTestSuites: number
  numTotalTests: number
  openHandles?: unknown[]
  snapshot: Snapshot
  startTime: number
  success: boolean
  testResults?: TestResult[]
  wasInterrupted: boolean
  coverageMap: CoverageMap
}

export type Snapshot = {
  added: number
  didUpdate: boolean
  failure: boolean
  filesAdded: number
  filesRemoved: number
  filesRemovedList?: unknown[]
  filesUnmatched: number
  filesUpdated: number
  matched: number
  total: number
  unchecked: number
  uncheckedKeysByFile?: unknown[]
  unmatched: number
  updated: number
}

export type TestResult = {
  assertionResults?: AssertionResult[]
  endTime: number
  message: string
  name: string
  startTime: number
  status: string
  summary: string
}

export type AssertionResult = {
  ancestorTitles?: string[]
  failureMessages?: string[]
  failureDetails?: FailureDetail[]
  fullName: string
  location: Location
  status: string
  title: string
}

interface FailureDetail {
  matcherResult: {
    message: string
    pass: boolean
  }
  message: string
}

export type Location = {
  column?: number
  line: number
}

export type Range = {
  start?: Location
  end?: Location
}

export type CoverageMap = Record<string, FileCoverage | FileCoverageInData>

export type FileCoverage = {
  path: string
  statementMap: StatementMap
  fnMap: FunctionMap
  branchMap: BranchMap
  s: HitMap
  f: HitMap
  b: ArrayHitMap
}

export type FileCoverageInData = {
  data: FileCoverage
}

export type StatementMap = Record<number, StatementCoverage>

export type StatementCoverage = {
  start: Location
  end: Location
}

export type FunctionMap = Record<number, FunctionCoverage>

export type FunctionCoverage = {
  name: string
  decl: Range
  loc: Range
}

export type BranchMap = Record<number, BranchCoverage>

export type BranchCoverage = {
  loc: Range
  type: string
  locations?: Range[]
}

export type HitMap = Record<number, number>

export type ArrayHitMap = Record<number, number[]>
