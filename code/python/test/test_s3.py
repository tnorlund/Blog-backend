import os
import pytest
from dynamo.data import S3Client

@pytest.mark.usefixtures( 's3_client', 's3_init' )
def test_init( bucket_name ):
  client = S3Client( bucket_name, 'us-west-1' )
  assert isinstance( client, S3Client )
  assert isinstance( client.bucketname, str )
  assert client.bucketname == bucket_name

@pytest.mark.usefixtures( 's3_client', 's3_init' )
def test_putObject( bucket_name ):
  file1 = open( 'test.txt', 'a' )
  file1.write( 'this is a test' )
  file1.close()
  client = S3Client( bucket_name, 'us-west-1' )
  client.putObject( '/test.txt', 'test.txt' )
  os.remove( 'test.txt' )

@pytest.mark.usefixtures( 's3_client', 's3_init' )
def test_listParquet( bucket_name ):
  file1 = open( 'test.parquet', 'a' )
  file1.write( 'this is a test' )
  file1.close()
  client = S3Client( bucket_name, 'us-west-1' )
  client.putObject( '/test.parquet', 'test.parquet' )
  objects = client.listParquet()
  assert isinstance( objects, list )
  assert all( isinstance( obj, str ) for obj in objects )
  assert len( objects ) == 1
  os.remove( 'test.parquet' )

@pytest.mark.usefixtures( 's3_client', 's3_init' )
def test_getObject( bucket_name ):
  file1 = open( 'test.parquet', 'a' )
  file1.write( 'this is a test' )
  file1.close()
  client = S3Client( bucket_name, 'us-west-1' )
  client.putObject( '/test.parquet', 'test.parquet' )
  result = client.getObject( '/test.parquet' )
  assert 'Body' in result.keys()
  body_read = result['Body'].read()
  assert body_read == bytes( 'this is a test', 'utf-8' )
  os.remove( 'test.parquet' )
