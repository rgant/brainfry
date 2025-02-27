#!/usr/bin/env bash
# Purpose of this script is to restore any coverage doc files where the only change is the date the
# test command was run.
# This is setup as a `posttest:once` script, but it will only be run if the tests all pass. So I will
# likely need to run this manually. Or maybe this should be a git precommit hook using [pre-commit](https://pre-commit.com/)

set -euo pipefail

# `npm run test:once` coverage output directory
COVERAGE_DIR='docs/coverage'

# List of files with only one line changed in coverage docs
readarray -t ONE_CHANGE_FILES < <(git diff --numstat "$COVERAGE_DIR" \
	| sed -E -e '/^1[[:space:]]+1[[:space:]]+/!d' -e 's/^1[[:space:]]+1[[:space:]]+//')

for FILE in "${ONE_CHANGE_FILES[@]}"; do
	# This pattern is a Y2100 bug!
	if [[ ! $(git diff --ignore-matching-lines='at 20..-..-..T' "$FILE") ]]; then
		# This is my `git toss` alias, but all written out for the script
		git restore --source=HEAD --staged --worktree -- "$FILE"
	fi
done
