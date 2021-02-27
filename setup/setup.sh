#!/bin bash
#
# Sets up the requirements for the Python Lambda Layer

if ( ! test -f "../python.zip" ) || ( ! test -f "../nodejs.zip" ); then
  echo "Creating NodeJS Lambda Layer"
  cd ../code
  zip -r ../nodejs.zip nodejs &> /dev/null;
  cd ../setup 
  echo "Creating Python Lambda Layer"
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

  echo 'Looking at what is here'
  ls .

  # Move the unpacked packages into the correct location
  for i in $(ls -d */); do 
    for j in $(ls $i); do
      mv -f "$i/$j" ../python/lib/python3.8/site-packages;
    done
    rm -rf $i
  done

  # Build the python library
  cd ../code/python;
  python3 setup.py bdist_wheel &> /dev/null;
  cd dist/;
  python3 -m wheel unpack dynamo-0.0.1-py3-none-any.whl &> /dev/null;
  cp -r dynamo-0.0.1/dynamo ../../../python/lib/python3.8/site-packages;
  cp -r dynamo-0.0.1/dynamo-0.0.1.dist-info ../../../python/lib/python3.8/site-packages;
  cd ../../../;
  zip -r python.zip ./python &> /dev/null;
  # Clean up
  rm -rf python;
  rm -rf code/python/build;
  rm -rf code/python/dist;
  rm -rf code/python/dynamo.egg-info;
else
  echo "Lambda Layers already exist"
fi
