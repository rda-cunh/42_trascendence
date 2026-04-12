#!/usr/bin/env bash

set -e
#shell opt enable nullable if not found
shopt -s nullglob
TESTS=( *_API.sh )

test_execution(){
	for test in ${TESTS[@]}
	do
		echo "Running $test"
		./"$test"
	done

}

test_execution 
