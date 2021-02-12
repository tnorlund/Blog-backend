#!/bin bash

# Download all the required wheels
while read p; do
  curl -O "$p";
done < require.txt

# Unpack all of the wheels
for i in *.whl; do
  python3 -m wheel unpack "$i"
done

# Make the required folder structure

# Move the unpacked packages into the correct location
for i in */; do 
  for j in $(ls $i); do
    mv -f "$i/$j" ../python/lib/python3.8/site-packages
  done
done