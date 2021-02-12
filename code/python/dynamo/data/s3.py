import boto3

class S3Client():
  '''A class to represent an S3 client.
  '''
  def __init__( self, bucketName, regionName = 'us-east-1' ):
    '''Constructs the necessary attributes for the S3 client object.

    Parameters
    ----------
    bucketName : str
      The name of the S3 bucket.
    regionName : str
      The AWS region to connect to.
    '''
    self.client = boto3.client( 's3', region_name = regionName )
    self.bucketname = bucketName

  def getObject( self, key ):
    '''Gets an object from the S3 bucket.

    Parameters
    ----------
    key : str
      The path and file name of the object in the S3 bucket.
    '''
    return self.client.get_object(
      Bucket = self.bucketname,
      Key = key
    )

  def putObject( self, key, file ):
    '''Puts an object from the S3 bucket.

    Parameters
    ----------
    key : str
      The path and file name of the object in the S3 bucket.
    '''
    self.client.upload_file(file, self.bucketname, key)

  def listParquet( self, prefix='/'):
    '''Lists the '.parquet' objects in a bucket.

    Parameters
    ----------
    prefix : str, optional
      The prefix of the '.parquet' file requested. (default is '/')

    Returns
    -------
    objects : list[ str ]
      The '.parquet' objects found in the bucket.
    '''
    # Use a list to store the objects in the bucket
    objects = []
    # Request the objects from the bucket.
    request = self.client.list_objects_v2(
      Bucket = self.bucketname,
      Delimiter = 'parquet',
      Prefix = prefix
    )
    # Append the files to the list of files
    objects += [ file['Prefix'] for file in request['CommonPrefixes'] ]
    objects.sort()
    # When there are over 1,000 objects, the request is truncated. The
    # continuation token is used to query the remaining objects from the
    # bucket.
    if request['IsTruncated']:
      while True:
        continuationToken = request['ContinuationToken']
        request = self.client.list_objects_v2(
          Bucket = self.bucketname,
          Delimiter = 'parquet',
          Prefix = prefix,
          ContinuationToken = continuationToken
        )
        objects += [ file['Prefix'] for file in request['CommonPrefixes'] ]
        objects.sort()
        # When the request is no longer truncated, the last of the objects have
        # been requested.
        if not request['IsTruncated']:
          break
    return objects
