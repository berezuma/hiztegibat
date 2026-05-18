#!/bin/bash
#git pull
cd web/private

if [ "$1" == "build" ]; then
    ncc build ./build.ts    -o dist/build
fi

node dist/build/index.js

cd -
exit 0
