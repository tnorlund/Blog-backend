#!/bin bash
#
# Sets up the requirements for the Python Lambda Layer

if [ ! -d "../python" ]; then
  # Download all the required wheels
  while read p; do
    curl -O "$p" &> /dev/null;
  done < require.txt

  # Unpack all of the wheels
  for i in *.whl; do
    python3 -m wheel unpack "$i" &> /dev/null;
    rm $i;
  done

  # Make the required folder structure
  mkdir ../python;
  mkdir ../python/lib;
  mkdir ../python/lib/python3.8
  mkdir ../python/lib/python3.8/site-packages

  # Move the unpacked packages into the correct location
  for i in */; do 
    for j in $(ls $i); do
      mv -f "$i/$j" ../python/lib/python3.8/site-packages;
    done
    rm -rf $i
  done
fi
