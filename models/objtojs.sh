#!/bin/bash
./quads-to-triangles.sh $1 "t.$1"
./gen-normals "t.$1" "n.t.$1"
cat "n.t.$1" | sed -E -e "s/nan/0.0/g" > "nan.n.t.$1"
./obj-to-js.py -i "nan.n.t.$1" -o $2

rm "t.$1" "n.t.$1" "nan.n.t.$1"
