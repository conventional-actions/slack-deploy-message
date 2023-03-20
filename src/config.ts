import * as core from '@actions/core'

export const SlackWebhookType: {[key: string]: string} = {
  WORKFLOW_TRIGGER: 'WORKFLOW_TRIGGER',
  INCOMING_WEBHOOK: 'INCOMING_WEBHOOK'
}

export type Config = {
  version: string
  botToken: string
  webhookUrl: string
  message: string
  channelIds: string
  webhookType: string
  github_token: string
}

export async function getConfig(): Promise<Config> {
  const botToken = core.getInput('bot-token') || ''
  const webhookUrl = core.getInput('webhook-url', {required: true}) || ''

  if (botToken.length <= 0 && webhookUrl.length <= 0) {
    throw new Error('Need to provide at least one botToken or webhookUrl')
  }

  return {
    botToken,
    webhookUrl,
    version: core.getInput('version') || '',
    message: core.getInput('message') || '',
    channelIds: core.getInput('channel-id') || '',
    webhookType:
      SlackWebhookType[core.getInput('webhook-type').toUpperCase()] ||
      SlackWebhookType.WORKFLOW_TRIGGER,
    github_token:
      core.getInput('github-token') || process.env.GITHUB_TOKEN || ''
  }
}
