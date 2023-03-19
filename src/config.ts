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
  releaseUrl: string
  webhookType: string
}

export async function getConfig(): Promise<Config> {
  const botToken = core.getInput('token') || ''
  const webhookUrl = core.getInput('webhook-url') || ''

  if (botToken.length <= 0 && webhookUrl.length <= 0) {
    throw new Error('Need to provide at least one botToken or webhookUrl')
  }

  return {
    botToken,
    webhookUrl,
    version: core.getInput('version') || '',
    message: core.getInput('message') || '',
    channelIds: core.getInput('channel-id') || '',
    releaseUrl: core.getInput('release-url') || '',
    webhookType:
      SlackWebhookType[core.getInput('webhook-type').toUpperCase()] ||
      SlackWebhookType.WORKFLOW_TRIGGER
  }
}
