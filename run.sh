#!/bin/bash

xhost +local:root

# Default values of arguments
ENTERYPOINT=0

# Loop through arguments and process them
# Taken from: https://pretzelhands.com/posts/command-line-flags
for arg in "$@"
do
  case $arg in
    --entrypoint)
    ENTERYPOINT=1
    shift # Remove
    ;;
  esac
done

if [ $ENTERYPOINT -eq 1 ]; then
	docker run --rm -it --entrypoint /bin/sh -p 3000:8080 --name mc-web-tools-container mc-web-tools:latest
else
	docker run --rm -p 3000:8080 --name mc-web-tools-container mc-web-tools:latest &
fi