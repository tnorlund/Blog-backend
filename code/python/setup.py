import setuptools

with open("README.md", "r", encoding="utf-8") as fh:
  long_description = fh.read()

setuptools.setup(
  name="dynamo", # Replace with your own username
  version="0.0.1",
  author="Tyler Norlund",
  author_email="tnorlund@icloud.com",
  description="A package used for accessing the DynamoDB table",
  long_description=long_description,
  long_description_content_type="text/markdown",
  url="https://github.com/tnorlund/aws-analytics",
  packages=setuptools.find_packages(),
  classifiers=[
    "Programming Language :: Python :: 3.6",
    "Programming Language :: Python :: 3.7",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
  ],
  python_requires='>=3.6',
  install_requires=[ 'numpy', 'pandas', 'boto3', 'botocore', 'pyarrow' ],
  extras_require={ 'testing': [ 'pytest', 'moto', 'pytest-pylint' ] },
)
