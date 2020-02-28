#!/usr/bin/env bash

# if any command inside script returns error, exit and return that error 
set -e

# magic line to ensure that we're always inside the root of our application,
# no matter from which directory we'll run script
# thanks to it we can just enter `./scripts/run-tests.bash`
cd "${0%/*}/.."

# let's fake failing test for now 
echo "Running tests"
echo "............................" 
npm run test:ci-json
if [[ "$?" == 0 ]]; then
input="${0%/*}/../coverage/lcov-report/index.html"
while IFS= read -r line
do
   if [[ "$line" == *"strong"* ]]; then
    COVERAGE_NUMBER=$(echo $line | tr -dc '[0-9][0-9].[0-9][0-9]')
    INT_COVERAGE_NUMBER=${COVERAGE_NUMBER/\.*}
    ACTUAL_COVERAGE=$((INT_COVERAGE_NUMBER + 0))
        if [[ $ACTUAL_COVERAGE -gt 65 ]]; then
            echo "You have Coverage Above Prescribed Threshold"
            echo $ACTUAL_COVERAGE+"%"
            echo "Success!" && exit 0
        fi
    fi
done < "$input"
fi
echo "Please fix your test cases before commiting"
echo "Failed!" && exit 1
# example of commands for different languages
# eslint .         # JS code quality check
# npm test         # JS unit tests
# flake8 .         # python code quality check
# nosetests        # python nose 
# just put your usual test command here 