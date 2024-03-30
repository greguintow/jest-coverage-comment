# Jest Coverage Comment

![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/MishaKav/5e90d640f8c212ab7bbac38f72323f80/raw/jest-coverage-comment__main.json)
![License](https://img.shields.io/github/license/MishaKav/jest-coverage-comment)
![Version](https://img.shields.io/github/package-json/v/MishaKav/jest-coverage-comment)
[![WakaTime](https://wakatime.com/badge/user/f838c8aa-c197-42f0-b335-cd1d26159dfd/project/9b2410f3-4104-44ec-bd7f-8d2553a31ffb.svg)](https://wakatime.com/badge/user/f838c8aa-c197-42f0-b335-cd1d26159dfd/project/9b2410f3-4104-44ec-bd7f-8d2553a31ffb)

This action comments a pull request or commit with a HTML test coverage report.
The report is based on the coverage report generated by your Jest test runner.
Note that this action does not run any tests, but expects the tests to have already been run by another action (`npx jest`).

**Similar Action for pytest**

---

I've made this action after I saw that similar action for python that runs `pytest` became very popular, see [pytest-coverage-comment](https://github.com/marketplace/actions/pytest-coverage-comment).

---

You can add this action to your GitHub workflow for Ubuntu runners (e.g. `runs-on: ubuntu-latest`) as follows:

```yaml
- name: Test Report
  uses: greguintow/jest-test-report@main
```

## Inputs

| Name                        | Required | Default                            | Description                                                                                                                                                              |
| --------------------------- | -------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `github-token`              | ✓        | `${{github.token}}`                | An alternative GitHub token, other than the default provided by GitHub Actions runner                                                                                    |
| `coverage-summary-path`     |          | `./coverage/coverage-summary.json` | The location of the coverage-summary of Jest                                                                                                                             |
| `title`                     |          | ''                                 | Main title for the comment                                                                                                                                               |
| `summary-title`             |          | ''                                 | Title for the coverage summary                                                                                                                                           |
| `badge-title`               |          | `Coverage`                         | Title for the badge icon                                                                                                                                                 |
| `hide-summary`              |          | false                              | Hide coverage summary report                                                                                                                                             |
| `create-new-comment`        |          | false                              | When false, will update the same comment, otherwise will publish new comment on each run.                                                                                |
| `delete-old-comments`       |          | false                              | create-new-comment option needs to be true first, when this option is true, it will delete the old comments run.                                                         |
| `hide-comment`              |          | false                              | Hide the whole comment (use when you need only the `output`). Useful to auto-update badges in README file.                                                               |
| `remove-links-to-files`     |          | false                              | Remove links to files (useful when summary-report is too big)                                                                                                            |
| `remove-links-to-lines`     |          | false                              | Remove links to lines (useful when summary-report is too big)                                                                                                            |
| `junitxml-path`             |          | ''                                 | The location of the junitxml path (npm package `jest-junit` should be installed)                                                                                         |
| `junitxml-title`            |          | ''                                 | Title for summary for junitxml                                                                                                                                           |
| `coverage-path`             |          | ''                                 | The location of the coverage.txt (Jest console output)                                                                                                                   |
| `coverage-title`            |          | `Coverage Report`                  | Title for the coverage report                                                                                                                                            |
| `coverage-path-prefix`      |          | ''                                 | Prefix for path when link to files in comment                                                                                                                            |
| `report-only-changed-files` |          | false                              | Show in report only changed files for this commit, and not all files                                                                                                     |
| `multiple-files`            |          | ''                                 | You can pass array of `json-summary.json` files and generate single comment with table of results<br/>Single line should look like `Title1, ./path/to/json-summary.json` |
| `multiple-junitxml-files`   |          | ''                                 | You can pass array of `junit.xml` files and generate single comment with table of results<br/>Single line should look like `Title1, ./path/to/junit.xml`                 |
| `unique-id-for-comment`     |          | ''                                 | When running in a matrix, pass the matrix value, so each comment will be updated its own comment `unique-id-for-comment: ${{ matrix.node-version }}`                     |

## Output Variables

| Name           | Example | Description                                                                          |
| -------------- | ------- | ------------------------------------------------------------------------------------ |
| `coverage`     | 78      | Percentage of the coverage, get from `coverage-summary.json`                         |
| `color`        | yellow  | Color of the percentage. You can see the whole list of [badge colors](#badge-colors) |
| `summaryHtml`  | ...     | Markdown table with summary. See the [output-example](#output-example)               |
| `tests`        | 9       | Total number of tests, get from `junitxml`                                           |
| `skipped`      | 0       | Total number of skipped tests, get from `junitxml`                                   |
| `failures`     | 0       | Total number of tests with failures, get from `junitxml`                             |
| `errors`       | 0       | Total number of tests with errors, get from `junitxml`                               |
| `time`         | 2.883   | Seconds the took to run all the tests, get from `junitxml`                           |
| `lines`        | 71      | Lines covered, get from Jest text report                                             |
| `branches`     | 100     | Branches covered, get from Jest text report                                          |
| `functions`    | 28      | Functions covered, get from Jest text report                                         |
| `statements`   | 100     | Statements covered, get from Jest text report                                        |
| `coverageHtml` | ...     | Markdown table with coverage summary. See the [output-example](#output-example)      |

## Output Example

> <!-- Jest Coverage Comment: jest-coverage-comment -->
>
> # My Jest Coverage Comment
>
> ## My Summary Title
>
> | Lines                                                                                                                                                                                                               | Statements     | Branches     | Functions  |
> | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------ | ---------- |
> | <a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/README.md"><img alt="Coverage: 78%" src="https://img.shields.io/badge/Coverage-78%25-yellow.svg" /></a><br/> | 76.74% (33/43) | 33.33% (2/6) | 100% (0/0) |
>
> ## My JUnit Title
>
> | Tests | Skipped | Failures | Errors   | Time               |
> | ----- | ------- | -------- | -------- | ------------------ |
> | 6     | 0 :zzz: | 0 :x:    | 0 :fire: | 1.032s :stopwatch: |
>
> <details><summary>My Coverage Title (<b>78%</b>)</summary><table><tr><th>File</th><th>% Stmts</th><th>% Branch</th><th>% Funcs</th><th>% Lines</th><th>Uncovered Line #s</th></tr><tbody><tr><td><b>All files</b></td><td><b>76.74</b></td><td><b>100</b></td><td><b>33.33</b></td><td><b>78.57</b></td><td>&nbsp;</td></tr><tr><td>src</td><td>75.67</td><td>100</td><td>40</td><td>75.67</td><td>&nbsp;</td></tr><tr><td>&nbsp; &nbsp;<a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/controller.js">controller.js</a></td><td>63.63</td><td>100</td><td>50</td><td>63.63</td><td><a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/controller.js#L14-L18">14&ndash;18</a></td></tr><tr><td>&nbsp; &nbsp;<a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/index.js">index.js</a></td><td>85.71</td><td>100</td><td>0</td><td>85.71</td><td><a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/index.js#L9">9</a></td></tr><tr><td>&nbsp; &nbsp;<a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/router.js">router.js</a></td><td>100</td><td>100</td><td>100</td><td>100</td><td>&nbsp;</td></tr><tr><td>&nbsp; &nbsp;<a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/service.js">service.js</a></td><td>69.23</td><td>100</td><td>50</td><td>69.23</td><td><a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/service.js#L16-L20">16&ndash;20</a></td></tr><tr><td>src/utils</td><td>83.33</td><td>100</td><td>0</td><td>100</td><td>&nbsp;</td></tr><tr><td>&nbsp; &nbsp;<a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/utils/config.js">config.js</a></td><td>100</td><td>100</td><td>100</td><td>100</td><td>&nbsp;</td></tr><tr><td>&nbsp; &nbsp;<a href="https://github.com/MishaKav/api-testing-example/blob/725508e4be6d3bc9d49fa611bd9fba96d5374a13/src/utils/utils.js">utils.js</a></td><td>75</td><td>100</td><td>0</td><td>100</td><td>&nbsp;</td></tr></tbody></table></details>

## Example Usage

The following is an example GitHub Action workflow that uses the Jest Coverage Comment to extract the coverage summary to comment at pull request:

```yaml
# This workflow will install dependencies, create coverage tests and run Jest Coverage Comment
# For more information see: https://github.com/MishaKav/jest-coverage-comment/
name: Jest Coverage Comment
on:
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: |
          npx jest --coverage --coverageReporters json-summary

      - name: Jest Coverage Comment
        uses: MishaKav/jest-coverage-comment@main
```

Example GitHub Action workflow that uses coverage percentage as output and update the badge in `README.md` without commits to the repo (see the [live workflow](../main/.github/workflows/update-coverage-in-readme.yml)):

```yaml
name: Update Coverage in README
on:
  push:

jobs:
  update-coverage-in-readme:
    name: Update Coverage in README
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Jest Coverage Comment
        id: coverageComment
        uses: MishaKav/jest-coverage-comment@main
        with:
          hide-comment: true
          coverage-summary-path: ./coverage/coverage-summary.json

      - name: Check the output coverage
        run: |
          echo "Coverage Percentage - ${{ steps.coverageComment.outputs.coverage }}"
          echo "Coverage Color - ${{ steps.coverageComment.outputs.color }}"
          echo "Summary HTML - ${{ steps.coverageComment.outputs.summaryHtml }}"

      - name: Create the badge
        if: github.ref == 'refs/heads/main'
        uses: schneegans/dynamic-badges-action@v1.6.0
        with:
          auth: ${{ secrets.JEST_COVERAGE_COMMENT }}
          gistID: 5e90d640f8c212ab7bbac38f72323f80
          filename: jest-coverage-comment__main.json
          label: Coverage
          message: ${{ steps.coverageComment.outputs.coverage }}%
          color: ${{ steps.coverageComment.outputs.color }}
          namedLogo: javascript
```

Example GitHub Action workflow that passes all params to Jest Coverage Comment:

```yaml
- name: Jest Coverage Comment
  uses: MishaKav/jest-coverage-comment@main
  with:
    coverage-summary-path: ./coverage/coverage-summary.json
    title: My Jest Coverage Comment
    summary-title: My Summary Title
    badge-title: Coverage
    hide-comment: false
    create-new-comment: false
    hide-summary: false
    junitxml-title: My JUnit Title
    junitxml-path: ./coverage/junit.xml
    coverage-title: My Coverage Title
    coverage-path: ./coverage.txt
```

<img alt="Example Comment" width="600px" src="https://user-images.githubusercontent.com/289035/161066760-40876696-c2cc-432a-9a7c-0952239941f3.png">

Example GitHub Action workflow that generate JUnit report from `junit.xml`:

- You should install `jest-junit` package, and add the following entry in your Jest config `jest.config.js`:

```json
{
  "reporters": ["default", "jest-junit"]
}
```

- Or you can provide it directly to `jest` like `jest --reporters=default --reporters=jest-junit`:

```yaml
- name: Jest Coverage Comment
  uses: MishaKav/jest-coverage-comment@main
  with:
    junitxml-path: ./junit.xml
    junitxml-title: JUnit
```

### Summary Report

Generated from `json-summary`:

<img alt="Summary Report" width="450px" src="https://user-images.githubusercontent.com/289035/161067781-b162f85f-5ff4-4e00-b0f9-e487b3a10f9f.png">

```yaml
- name: Run tests
  run: |
    npx jest --coverage --reporters=default --reporters=jest-junit'

- name: Jest Coverage Comment
  uses: MishaKav/jest-coverage-comment@main
  with:
    coverage-summary-path: ./coverage/coverage-summary.json
```

### Coverage Report

Generated from Jest output by writing the output to file `| tee ./coverage.txt`
The nice thing, is that will link all your files inside that commit and ability to click by missing lines and go inside file directly to missing lines:

<img alt="Coverage Report (Single File)" width="550px" src="https://user-images.githubusercontent.com/289035/161068864-25d8878a-2c82-4f83-b7dc-70a5a955b877.png">

```yaml
- name: Run tests
  run: |
    npx jest --coverage | tee ./coverage.txt && exit ${PIPESTATUS[0]}

- name: Jest Coverage Comment
  uses: MishaKav/jest-coverage-comment@main
  with:
    coverage-path: ./coverage.txt
```

Example GitHub Action workflow that uses multiple files mode (can be useful on mono-repo projects):

<img alt="Coverage Report (Multiple Files)" width="550px" src="https://user-images.githubusercontent.com/289035/183769452-99e53ad9-5205-44b7-bba6-c8d481ce5cc4.png">

```yaml
- name: Jest Coverage Comment
  uses: MishaKav/jest-coverage-comment@main
  with:
    multiple-files: |
      My-Title-1, ./coverage_1/coverage-summary.json
      My-Title-2, ./coverage_2/coverage-summary.json
```

### JUnit Report

Generated from `junit.xml` by [jest-junit](https://www.npmjs.com/package/jest-junit):

- If the elapsed time is more than 1 minute, it will show it in a different format (`555.0532s` > `9m 15s`), the output format will be the same as `junit.xml` (`555.0532s`).

  <img alt="JUnit Report (Single File)" width="400px" src="https://user-images.githubusercontent.com/289035/161068120-303b47a9-c8e2-4fa6-80db-21aefbf9033b.png">

```yaml
- name: Run tests
  run: |
    npx jest --coverage --config='{ "coverageReporters": ["json-summary"] }'

- name: Jest Coverage Comment
  uses: MishaKav/jest-coverage-comment@main
  with:
    junitxml-path: ./junit.xml
```

Example GitHub Action workflow that uses multiple JUnit files mode (can be useful on mono-repo projects):

<img alt="JUnit Report (Multiple Files)" width="600px" src="https://user-images.githubusercontent.com/289035/195997703-95d331a3-beba-4567-831e-22d1f0e977da.png">

```yaml
- name: Jest Coverage Comment
  uses: MishaKav/jest-coverage-comment@main
  with:
    multiple-junitxml-files: |
      My-Title-1, ./coverage_1/junit.xml
      My-Title-2, ./coverage_2/junit.xml
```

Example GitHub Action workflow that will update your README file with coverage summary, only on merge to `main` branch.
If your coverage summary report will not change, it wouldn't push any changes to the README file.
All you need is to add the following lines in `README.md` wherever you want:

```html
<!-- Jest Coverage Comment:Begin -->
<!-- Jest Coverage Comment:End -->
```

```yaml
name: Update Coverage in README
on:
  push:
    branches:
      - main
jobs:
  update-coverage-in-readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          persist-credentials: false # otherwise, the token used is the GITHUB_TOKEN, instead of your personal token
          fetch-depth: 0 # otherwise, you will failed to push refs to dest repo

      - name: Jest Coverage Comment
        if: github.ref == 'refs/heads/main'
        id: coverageComment
        uses: MishaKav/jest-coverage-comment@main
        with:
          hide-summary: true
          coverage-summary-path: ./coverage/coverage-summary.json

      - name: Update README with Coverage HTML
        if: github.ref == 'refs/heads/main'
        run: |
          sed -i '/<!-- Jest Coverage Comment:Begin -->/,/<!-- Jest Coverage Comment:End -->/c\<!-- Jest Coverage Comment:Begin -->\n\${{ steps.coverageComment.outputs.summaryHtml }}\n<!-- Jest Coverage Comment:End -->' ./README.md

      - name: Commit & Push changes in README
        if: github.ref == 'refs/heads/main'
        uses: actions-js/push@master
        with:
          message: Update coverage in README
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Badge Colors

| Badge                                                                           | Range    |
| ------------------------------------------------------------------------------- | -------- |
| ![Coverage 0-40](https://img.shields.io/badge/Coverage-20%25-red.svg)           | 0 - 40   |
| ![Coverage 40-60](https://img.shields.io/badge/Coverage-50%25-orange.svg)       | 40 - 60  |
| ![Coverage 60-80](https://img.shields.io/badge/Coverage-70%25-yellow.svg)       | 60 - 80  |
| ![Coverage 80-90](https://img.shields.io/badge/Coverage-85%25-green.svg)        | 80 - 90  |
| ![Coverage 90-100](https://img.shields.io/badge/Coverage-95%25-brightgreen.svg) | 90 - 100 |

## Auto Updating Badge in README

If you want to auto-update the coverage badge in your README file, you can see the [live workflow](../main/.github/workflows/update-coverage-in-readme.yml):

![Auto Updating Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/MishaKav/5e90d640f8c212ab7bbac38f72323f80/raw/jest-coverage-comment__main.json)

## 🤝 Contributing

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

We welcome all contributions. You can submit any ideas as [pull requests](https://github.com/MishaKav/jest-coverage-comment/pulls) or as [GitHub issues](https://github.com/MishaKav/jest-coverage-comment/issues) and have a good time! :)

## Our Contributors

<a href="https://github.com/MishaKav/jest-coverage-comment/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MishaKav/jest-coverage-comment" alt="Contributors" />
</a>
