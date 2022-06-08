# Contributing to Praise

- [How to contribute?](#how-to-contribute)
- [Setting up the project](#setting-up-the-project)
- [Feedback, Bug Reports, Issues - How to open issues?](#feedback-bug-reports-issues---how-to-open-issues)
- [Claiming an Issue](#claiming-an-issue)
- [Working on your issue](#working-on-your-issue)
  - [Syncing your fork with the project](#syncing-your-fork-with-the-project)
  - [Creating a new branch](#creating-a-new-branch)
  - [Commit Message Guidelines](#commit-message-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Contributing in other ways](#contributing-in-other-ways)
- [Setting up the dev environment](#setting-up-the-dev-environment)
- [Project Structure](#project-structure)

## How to contribute?

Thank you for showing interest in this project! We appreciate and encourage any and all contributions to the project. However, do keep in mind that it takes some time to get responses on issues and reviews on PRs. Before contributing, have a look at the [CODE of CONDUCT](./CODE_OF_CONDUCT.md) and try to comply with those guidelines.

If you are new to contributing to projects on GitHub, this project follows a certain pattern of development and contributing - [github flow](https://docs.github.com/en/github/getting-started-with-github/github-flow). You could learn more about how to use Github on [Github Labs](https://lab.github.com/) and through the [Github docs](https://docs.github.com/en/github/getting-started-with-github/)

Please ensure all pull requests and contributions comply with the [Developer Certificate of Origin](https://developercertificate.org/).

### Setting up the project

First, [fork this repository](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) to your own account. Then use `git clone <forked-repo-url>` to clone your forked repository down to your local machine (remember to get the URL for _your_ repository - the fork, not the original repository).
Use `git remote add upstream <original-repo-url>` to add the original repository as the upstream (this is helpful for keeping your fork up-to-date).

### Feedback, Bug Reports, Issues - How to open issues?

If you have any feedback, bug reports, feature request or ideas, feel free to [open an issue](https://docs.github.com/en/github/managing-your-work-on-github/creating-an-issue) on the project's repository. We love issues! ;D
Please try not to duplicate issues and always try to give enough context in the issues that you open.
You could use some of the issues templates to make better structured issues with relevant labels.

### Claiming an Issue

All of the issues on this repo are open to contributors! If you see an open issue you would like to work on, please comment on the issue so that you may get assigned to it.

> NOTE: Assigned issues that have not had any activity in 2 weeks will be unassigned.

If an issue is already assigned, please look for another issue to contribute to, or open an issue that you could work on and adds value to the project. We use labels to help categorise issues:

- `good first issue` - These issues require minimal familiarity with our codebase. Please reserve these for first-time contributors.
- `help wanted` - These issues are open to any contributors.
- `staff only` - These issues are locked to project maintainers/collaborators. Pull requests on these issues will not be accepted from outside contributors.

### Working on your issue

This project follows a certain development and contribution pattern([github-flow](https://docs.github.com/en/github/getting-started-with-github/github-flow)). If you have any confusion at any step in the process, refer to the [Github docs](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests). Feel free to comment on your assigned issue if you have any questions, doubts or need any help. (Do note that it might take some time to get help on the issues. It is highly suggested that you ask for help on [EddieHub's Everyone Helps Everyone forum](https://github.com/EddieHubCommunity/support/discussions/categories/q-a) or [freeCodeCamp's forum](https://forum.freecodecamp.org/) if you would prefer a quicker help response)

#### Syncing your fork with the project

Before starting any work, it is highly recommended that you ensure that your forked version of the repo is up to date. If you set the upstream as mentioned in [Setting Up The Project](#setting-up-the-project), run these commands in your terminal (with the terminal pointed at the root directory of your local files):

- Switch to the `main` branch:
  ```rb
  git checkout main
  ```
- Get the current state of the original repo, without pulling down the changes to your local machine:
  ```css
  git fetch upstream
  ```
- Reset the state of your local files to match the current state of the original repo:
  ```rb
  git reset --hard upstream/main
  ```
- Force the changes to your forked repo on github (thus making it match the original):
  ```css
  git push -f
  ```
  > NOTE: Before you do the above, keep in mind that you will lose any changes you are currently working on. Do this with care.

**If you are working on small changes directly on Github's UI**, you could also consider [using the `Fetch Upstream` button on Github's UI](https://twitter.com/i/status/1390382527588798477)

#### Creating a new branch

Before making code changes, it would be best if you create a new branch and make changes in that branch. It's always a good idea to avoid committing changes directly to your `main` branch - this keeps it clean and avoids errors when updating (above).
You could use this command to create and switch to a new branch -

```rb
git checkout -b <branchname>
```

(Alternatively, you could also make a branch on github's UI and use `git fetch` and `git checkout <branch-name>` to switch to the created branch)

Branch names should follow a convention of `type/issue/description` where:

- `type` is the nature of the changes (eg. `feat` for a new feature, or `docs` for documentation update). This should match the [scope of the related issue](https://www.conventionalcommits.org/en/v1.0.0/#summary).
- `issue` is the number for the related issue you're addressing.
- `description` is a brief description of your changes, such as update-contribs for updating the contributing guidelines.

Example - `docs/3/update=contribs`, when working on docs to update contributors for issue #3

After this, you could start working on your code :D

#### Commit Message Guidelines

Now you are free to work on your code! When you are satisfied with your changes, you can commit them with `git commit -s -m "message"`, where:

- `-s` flag signs the commit, to verify the connection with your GitHub account.
- `-m` flag sets up the commit message.
- `message` is the commit message: a brief (50 character max) message describing what the commit changes.

While writing the commit message, please try to be brief (if you want to add more context, you can add a description by adding another `-m "some description"` tag to the command) and try to write messages in present tense (like `docs: add link to coc`, instead of `docs: added link to coc`)

We prefer to follow a certain commit message styling format in order to make the commits easily readable by people as well as automation. You could refer to [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/) for more information about the format.

All commit messages should follow this format- `<type>(optional scope): <description>`
(The scope can be skipped, in order to make the commit message more succint)
Examples-

```
docs: update project links
feat: set up project
feat(deploy): deployment config
fix: fix website crash bug
```

**Type** - The type could be one of the following:

- `fix`: bug patches, typo and lint corrections
- `feat`: introduce new features to the codebase
- `docs`: for documentation and README/CONTRIBUTING changes
- `refactor`: code change that refactors the code
- `chore`: project config, maintainance

### Submitting a Pull Request

Once you have all of your changes made and committed, you can push them to your forked repository! Use `git push -u origin <branchname>`, where:

- `-u` tells `git` to set the upstream (see below)
- `origin` tells `git` to push to your fork
- `branchname` tells `git` to push to a branch - this MUST match the name of the branch you created locally.

> NOTE: By setting the upstream, any subsequent push commands can be done with `git push`, and it will be pushed to the same branch.

Now you can [open a pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)! You should see a quick option to do so appear at the top of your repository on GitHub. Click the "`Pull Request`" button to have GitHub automatically set up the pull request.

First, change the title of the pull request to match your branch name (following the conventions above!). Then, follow the instructions in the preset Pull Request template (make sure to complete any steps listed!).

Congratulations! You've submitted your first pull request! It will be reviewed as quickly as possible, so keep an eye out for comments, approvals, or requested changes.

### Contributing in other ways

If you aren't comfortable with the codebase, or would like to contribute in other ways, we have options for that!
We like and appreciate good contributions of any kind!

- Documentation Updates: You are always welcome to update our documentation (like this file). If you see any typos or anything that can be clarified, go on ahead and open an issue and a Pull Request!
- Feature Requests: If you have ideas for new features or improvements, feel free to open an issue!
- Arts/graphics: If you would like to make artistic contributions to the project, feel free to open an issue or contact a maintainer regarding this. We like good graphics for repository banners, or graphics that can be featured in the application.
- Bug Reports: We rely on our users to help identify bugs - if you see something wrong, please let us know with an issue!
- Dropping reviews: If you want, you could also contribute by reviewing pull requests. (If you aren't familiar with the codebase, you could still drop reviews on documentation updates)

## Setting up the dev environment

### Set up node, yarn and docker -

This project uses JavaScript and the nodeJS environment. For setting up this environment, you would need to install `node` on your machine.

- You could install `node` using a [package manager](https://nodejs.dev/download/package-manager/) or with a pre-packaged installer from https://nodejs.org/en/download/
- To check if node is installed, open a terminal(CMD Prompt) and run `node -v` and `npm -v`
- `yarn` is a package manager for nodejs, that is needed in our project for smooth development. You could install yarn by running -
  ```
  npm install --global yarn
  ```
  To verify your installation, run -
  ```
  yarn --version
  ```
- Install dependencies
  ```
  yarn
  ```
- Install husky hooks
  ```
  yarn prepare
  ```
- Install Docker:

  If you're on Windows or Macos, you could download [Docker Desktop](https://docs.docker.com/desktop/), which includes all the things you need pre-packaged:

  - [Install Docker Desktop on Mac](https://docs.docker.com/desktop/mac/install/)
  - [Install Docker Desktop on Windows](https://docs.docker.com/desktop/windows/install/)

  If you're on Linux, you need to download [Docker Engine](https://docs.docker.com/engine/) and [Docker Compose](https://docs.docker.com/compose/):

  - [Install Docker Engine](https://docs.docker.com/engine/install/)
  - [Install Docker Compose](https://docs.docker.com/compose/install/)

- Pull the mongodb docker image
  ```
  docker pull mongo
  ```

## Project Structure

- #TODO

```
/packages
 |- api
 |- discord-bot
 |  |- commands
 |  |- utils
 |- frontend

```

## Review Developer Documentation
Additional developer documentation is included in [DEVELOPMENT.md](./DEVELOPMENT.md)