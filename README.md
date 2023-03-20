# slack-deploy-message

A GitHub Action for sending a deploy message to a Slack channel.

## Usage

To use the GitHub Action, add the following to your job:

```yaml
- uses: conventional-actions/slack-deploy-message@v1
  with:
    version: ${{steps.version.outputs.version}}
```

Supported file formats include YAML (.yml and .yaml extension) and JSON (.json extension). Any unknown file extension
is written as a plain-text file.

### Inputs

| Name          | Default  | Description        |
|---------------|----------|--------------------|
| `version`     | required | version            |
| `release-url` | required | URL to the release |
| `token`       | N/A      | bot token          |
| `webhook-url` | N/A      | webhook URL        |
| `message`     | N/A      | Slack message      |
| `channel-id`  | N/A      | Slack channel ID   |

### Outputs

| Name         | Description          |
|--------------|----------------------|
| `thread_ts`  | The thread timestamp |
| `channel_id` | The Slack channel ID |

### Example

```yaml
on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - id: version
        name: Determine next version
        uses: conventional-actions/next-version@v1
      - uses: conventional-actions/slack-deploy-message@v1
        with:
          version: ${{steps.version.outputs.version}}
          release-url: https://release
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
