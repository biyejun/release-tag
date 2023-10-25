const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    console.log(process.env, 'process.env');
    console.log(process.env.GITHUB_TOKEN, 'process.env.GITHUB_TOKEN');
    const github = new GitHub(process.env.GITHUB_TOKEN);

    const contextJSON = JSON.stringify(context, null, 2);
    console.log(contextJSON, 'contextJSON');

    // Get owner and repo from context of payload that triggered the action
    const { owner, repo } = context.repo;

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const tagName = core.getInput('tag_name', { required: true });
    console.log(tagName, 'tagName');

    // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
    const tag = tagName.replace('refs/tags/', '');
    const releaseName =
      core.getInput('release_name', { required: false }) || tag;
    const body = core.getInput('body', { required: false }) || '';
    const draft = core.getInput('draft', { required: false }) === 'true';
    const prerelease = /\d-[a-z]/.test(tag);

    // Create a release
    // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
    await github.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
      name: releaseName,
      body,
      draft,
      prerelease,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
