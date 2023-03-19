import * as core from '@actions/core'
import * as github from '@actions/github'
import {getConfig, SlackWebhookType} from './config'
import {ChatPostMessageResponse, WebClient} from '@slack/web-api'
import flatten from 'flat'
import {parseURL} from 'whatwg-url'
import {HttpsProxyAgent} from 'https-proxy-agent'
import axios, {AxiosError} from 'axios'
import type {AxiosRequestConfig} from 'axios'

async function run(): Promise<void> {
  try {
    const config = await getConfig()

    let payload = {
      link_names: true,
      type: 'mrkdwn',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Deploy ${github.context.repo.repo} ${config.version}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Repository: <https://github.com/${github.context.repo.owner}/${github.context.repo.repo}|${github.context.repo.owner}/${github.context.repo.repo}>`
            },
            {
              type: 'mrkdwn',
              text: `Release: <${config.releaseUrl}|${config.version}>`
            },
            {
              type: 'mrkdwn',
              text: `Build: <https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runId}|#${github.context.runNumber}>`
            }
          ]
        }
      ]
    } as {[key: string]: any}

    let webResponse: ChatPostMessageResponse | undefined

    if (config.botToken.length > 0) {
      const web = new WebClient(config.botToken)

      if (config.channelIds.length <= 0) {
        core.warning(
          'Channel ID is required to run this action. An empty one has been provided'
        )
        throw new Error(
          'Channel ID is required to run this action. An empty one has been provided'
        )
      }

      await Promise.all(
        config.channelIds.split(',').map(async channelId => {
          // post message
          webResponse = await web.chat.postMessage({
            channel: channelId.trim(),
            text: config.message,
            ...(payload || {})
          })
        })
      )
    }

    if (config.webhookUrl.length > 0) {
      if (config.webhookType === SlackWebhookType.WORKFLOW_TRIGGER) {
        // flatten JSON payload (no nested attributes)
        const flatPayload: {[key: string]: any} = flatten(payload)

        // workflow builder requires values to be strings
        // iterate over every value and convert it to string
        for (const key of Object.keys(flatPayload)) {
          flatPayload[key] = `${flatPayload[key]}`
        }

        flatPayload['text'] = config.message

        payload = flatPayload
      }

      const axiosOpts: AxiosRequestConfig = {}
      try {
        if (parseURL(config.webhookUrl)?.scheme === 'https') {
          const httpsProxy =
            process.env.HTTPS_PROXY || process.env.https_proxy || ''
          if (httpsProxy && parseURL(httpsProxy)?.scheme === 'http') {
            axiosOpts.httpsAgent = new HttpsProxyAgent(httpsProxy)

            // Use configured tunnel above instead of default axios proxy setup from env vars
            axiosOpts.proxy = false
          }
        }
      } catch (err) {
        core.warning(
          'failed to configure https proxy agent for http proxy. Using default axios configuration'
        )
      }

      try {
        await axios.post(config.webhookUrl, payload, axiosOpts)
      } catch (err) {
        core.error(
          'axios post failed, double check the payload being sent includes the keys Slack expects'
        )
        core.debug(JSON.stringify(payload))

        if (err instanceof AxiosError) {
          if (err.response) {
            core.setFailed(err.response.data)
          }

          core.setFailed(err.message)
        } else {
          core.setFailed(err as Error)
        }
        return
      }
    }

    if (webResponse && webResponse.ok) {
      const thread_ts = webResponse.thread_ts
        ? webResponse.thread_ts
        : webResponse.ts
      core.setOutput('thread_ts', thread_ts)
      core.setOutput('channel_id', webResponse.channel)
    }

    return
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
