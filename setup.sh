#!/bin/bash
IMAGE=$( docker images | grep praise-setup )
if [ -z "$IMAGE" ]
then
  echo "Building setup image..."
  docker build -t praise-setup -q -f ./packages/setup/Dockerfile .
fi

docker run -it -v $(pwd):/usr/praise praise-setup