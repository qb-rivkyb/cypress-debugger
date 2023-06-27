import { HttpArchiveLog } from '@currents/cypress-debugger-support';
import {
  ensureBrowserFlags,
  install as installHarPlugin,
} from '@neuralegion/cypress-har-generator';
import path from 'path';
import {
  browserLaunchHandler,
  clearLogs,
  getLogs,
  recordLogs,
} from './browserLogs';
import { createDir, readFile, removeDir, removeFile, writeFile } from './fs';
import { PluginOptions, TestExecutionResult } from './types';

type CreateDumpFileOptions = {
  dumpDir: string;
  filename: string;
};

const harDir = 'dump_har';

const createDumpFile = (
  data: TestExecutionResult,
  { dumpDir, filename }: CreateDumpFileOptions
): string => {
  createDir(dumpDir);
  const resultsPath = path.join(dumpDir, `${filename}.json`);
  writeFile(resultsPath, JSON.stringify(data, null, 2));
  return resultsPath;
};

const getHar = (filename: string): HttpArchiveLog | null => {
  try {
    const filePath = path.join(harDir, filename);
    const data = readFile(filePath);
    const parsed = JSON.parse(data.toString('utf-8'));

    removeFile(filePath);

    return parsed;
  } catch (error) {
    return null;
  }
};

function install(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  options?: PluginOptions
) {
  if (options?.failedTestsOnly) {
    // eslint-disable-next-line no-underscore-dangle, no-param-reassign
    config.env.__cypress_debugger_failedTestsOnly = true;
  }

  on('task', {
    // called in "afterEach" hook
    dumpEvents(
      data: Pick<TestExecutionResult, 'id' | 'cy' | 'rr' | 'meta'> & {
        harFilename: string;
      }
    ) {
      const har = getHar(data.harFilename);

      const browserLogs = getLogs();
      clearLogs();

      const dumpData = {
        id: data.id,
        cy: data.cy,
        rr: data.rr,
        meta: data.meta,
        har,
        browserLogs,
        pluginMeta: options?.meta,
      };

      const dumpDir =
        options?.targetDirectory &&
        path.resolve(options.targetDirectory) !== path.resolve(harDir)
          ? options.targetDirectory
          : 'dump';

      let filename = `${dumpData.meta.spec}_${dumpData.meta.test.join(' > ')}_${
        dumpData.meta.retryAttempt + 1
      }`;
      if (typeof options?.filenameFn === 'function') {
        const result = options.filenameFn(dumpData.meta);
        if (typeof result === 'string') {
          filename = result;
        }
      }

      const resultsFilePath = createDumpFile(dumpData, {
        dumpDir,
        filename,
      });

      if (options && options.callback) {
        options.callback(resultsFilePath, dumpData);
      }

      return null;
    },

    // called in "after" hook
    cleanup() {
      removeDir(harDir);
      return null;
    },
  });

  // install cypress-har-generator
  installHarPlugin(on);

  on('before:browser:launch', (browser, launchOptions) => {
    // cypress-har-generator uses this event, details here: https://github.com/NeuraLegion/cypress-har-generator/blob/master/README.md?plain=1#L74
    ensureBrowserFlags(browser, launchOptions);

    // use chrome debugging protocol to listen to console events
    browserLaunchHandler(browser, launchOptions);

    return launchOptions;
  });

  on('before:spec', async () => {
    await recordLogs();
  });

  return config;
}

export default install;
