import * as core from '@actions/core'
import * as exec from '@actions/exec'
import fs from 'fs'
import path from 'path'

export const writeVersion = async (
  outputPath: string,
  version: string,
  selector: string,
  format: string
): Promise<unknown> => {
  core.info(`Updating version ${version} in ${outputPath}`)
  core.debug(`writeVersion(${outputPath}, ${version}, ${selector})`)

  let ext = path.extname(outputPath)
  switch (ext) {
    case '.json':
    case '.yaml':
    case '.yml':
      break

    default:
      ext = `.${format}`
  }
  core.debug(`ext = ${ext}`)

  switch (ext) {
    case '.json':
      return writeJSONVersion(outputPath, version, selector)

    case '.yaml':
      return writeYAMLVersion(outputPath, version, selector)

    case '.yml':
      return writeYAMLVersion(outputPath, version, selector)
  }

  return writePlainVersion(outputPath, version)
}

export const writeYAMLVersion = async (
  outputPath: string,
  version: string,
  selector: string
): Promise<unknown> => {
  core.debug(`writeYAMLVersion("${outputPath}", "${version}", "${selector}")`)

  return exec.exec('yq', [
    'eval',
    '-i',
    `.${selector}="${version}"`,
    outputPath
  ])
}

export const writeJSONVersion = async (
  outputPath: string,
  version: string,
  selector: string
): Promise<unknown> => {
  core.debug(`writeJSONVersion("${outputPath}", "${version}", "${selector}")`)

  return exec.exec('yq', [
    'eval',
    '-i',
    `.${selector}="${version}"`,
    outputPath
  ])
}

export const writePlainVersion = async (
  outputPath: string,
  version: string
): Promise<unknown> => {
  core.debug(`writePlainVersion("${outputPath}", "${version}")`)

  return new Promise<unknown>(() => fs.writeFileSync(outputPath, version))
}
