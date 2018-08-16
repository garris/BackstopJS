const util = require('util');

/**
 * This class watches stdOut and stdErr of a process, and makes sure that all of required set of
 * messages appear ons stdOut, and also that no messages other than a whitelist of errors appears
 * on stdErr
 */
class SmokeTestErrorTracker {
  constructor (requiredStdout, allowedStdErr) {
    this.missingStdOut = [...requiredStdout];
    this.allowedStdErr = allowedStdErr;
    this.stdErrs = [];
  }

  recordStdOut (buf) {
    const line = String(buf);
    util.print(line);
    const key = line.trim();
    this.missingStdOut = this.missingStdOut.filter(el => !key.includes(el));
  }

  recordStdErr (buf) {
    const line = String(buf);
    util.print('StdErr:', line);
    if (this.allowedStdErr.filter(allowed => line.includes(allowed)).length === 0) {
      this.stdErrs.push(line.trim());
    }
  }

  getProblemsAfterRunning () {
    const problems = [];
    if (this.missingStdOut.length !== 0) {
      problems.push('The following line were expected in smoke test std output, but were not found:');
      problems.push(...this.missingStdOut);
    }

    if (this.stdErrs.length !== 0) {
      problems.push('Unexpected output on Std Error of smoke test:');
      problems.push(...this.stdErrs);
    }

    return problems;
  }
}

module.exports = SmokeTestErrorTracker;
