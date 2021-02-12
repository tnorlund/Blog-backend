def event( ip, table_name ):
  return {
  "Records": [
    {
      "eventID": "6d0d4899c7a77eaad208b2b0ff951846",
      "eventName": "MODIFY",
      "eventVersion": "1.1",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-west-2",
      "dynamodb": {
        "ApproximateCreationDateTime": 1608053091,
        "Keys": {
          "SK": { "S": "#VISITOR" },
          "PK": { "S": f"VISITOR#{ ip }" }
        },
        "NewImage": {
          "Type": { "S": "visitor" },
          "NumberSessions": { "N": "6" },
          "SK": { "S": "#VISITOR" },
          "PK": { "S": f"VISITOR#{ ip }" }
        },
        "SequenceNumber": "40085300000000003642247411",
        "SizeBytes": 91,
        "StreamViewType": "NEW_IMAGE"
      },
      "eventSourceARN": "arn:aws:dynamodb:us-west-2:681647709217:table/" + \
        f"{ table_name }/stream/2020-12-07T03:47:26.281"
    },
    {
      "eventID": "f16dc2d0a70b839b910a1318f09c6925",
      "eventName": "INSERT",
      "eventVersion": "1.1",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-west-2",
      "dynamodb": {
        "ApproximateCreationDateTime": 1608053091,
        "Keys": {
          "SK": { "S": "VISIT#2020-12-16T17:23:30.877Z" },
          "PK": { "S": f"VISITOR#{ ip }" }
        },
        "NewImage": {
          "App": {
            "S": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) " + \
              "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 " + \
              "Safari/605.1.15"
          },
          "OS": { "S": "10.15.6" },
          "Device": { "S": "mac" },
          "DateVisited": { "S": "2020-12-16T17:23:30.877Z" },
          "DeviceType": { "S": "desktop" },
          "Webkit": { "S": "605.1.15" },
          "Type": { "S": "browser" },
          "Version": { "S": "14.0.2" },
          "SK": { "S": "VISIT#2020-12-16T17:23:30.877Z" },
          "Height": { "N": "1366" },
          "PK": { "S": f"VISITOR#{ ip }" },
          "DateAdded": { "S": "2020-12-16T17:24:46.688Z" },
          "Width": { "N": "1024" },
          "Browser": { "S": "safari" }
        },
        "SequenceNumber": "40085400000000003642247443",
        "SizeBytes": 401,
        "StreamViewType": "NEW_IMAGE"
      },
      "eventSourceARN": "arn:aws:dynamodb:us-west-2:681647709217:table/" + \
        f"{ table_name }/stream/2020-12-07T03:47:26.281"
    },
    {
      "eventID": "00e86f87d57568e99f5f40cbb4d9dc6b",
      "eventName": "INSERT",
      "eventVersion": "1.1",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-west-2",
      "dynamodb": {
        "ApproximateCreationDateTime": 1608053091,
        "Keys": {
          "SK": { "S": "SESSION#2020-12-16T17:23:30.877Z" },
          "PK": { "S": f"VISITOR#{ ip }" }
        },
        "NewImage": {
          "Type": { "S": "session" },
          "GSI2SK": { "S": "#SESSION" },
          "SK": { "S": "SESSION#2020-12-16T17:23:30.877Z" },
          "TotalTime": { "N": "7.454" },
          "GSI2PK": { "S": f"SESSION#{ ip }#2020-12-16T17:23:30.877Z" },
          "PK": { "S": f"VISITOR#{ ip }" },
          "AverageTime": { "N": "2.484666666666667" }
        },
        "SequenceNumber": "40085500000000003642247444",
        "SizeBytes": 222,
        "StreamViewType": "NEW_IMAGE"
      },
      "eventSourceARN": "arn:aws:dynamodb:us-west-2:681647709217:table/" + \
        f"{ table_name }/stream/2020-12-07T03:47:26.281"
    },
    {
      "eventID": "808a901c4ef33d8b0f97ba69cc61d500",
      "eventName": "INSERT",
      "eventVersion": "1.1",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-west-2",
      "dynamodb": {
        "ApproximateCreationDateTime": 1608053091,
        "Keys": {
          "SK": { "S": "VISIT#2020-12-16T17:23:30.877Z#/" },
          "PK": { "S": f"VISITOR#{ ip }" }
        },
        "NewImage": {
          "User": { "N": "0" },
          "Title": { "S": "Tyler Norlund" },
          "GSI2PK": { "S": f"SESSION#{ ip }#2020-12-16T17:23:30.877Z" },
          "Slug": { "S": "/" },
          "PreviousSlug": { "NULL": True },
          "Type": { "S": "visit" },
          "GSI1PK": { "S": "PAGE#/" },
          "GSI2SK": { "S": "VISIT#2020-12-16T17:23:30.877Z" },
          "GSI1SK": { "S": "VISIT#2020-12-16T17:23:30.877Z" },
          "SK": { "S": "VISIT#2020-12-16T17:23:30.877Z#/" },
          "TimeOnPage": { "N": "2.2680000000000002" },
          "NextTitle": { "S": "Website" },
          "PK": { "S": f"VISITOR#{ ip }" },
          "PreviousTitle": { "NULL": True },
          "NextSlug": { "S": "/projects/web" }
        },
        "SequenceNumber": "40085600000000003642247445",
        "SizeBytes": 368,
        "StreamViewType": "NEW_IMAGE"
      },
      "eventSourceARN": "arn:aws:dynamodb:us-west-2:681647709217:table/" + \
        f"{ table_name }/stream/2020-12-07T03:47:26.281"
    },
    {
      "eventID": "9371f29ab879c6d339caf668c7480e62",
      "eventName": "INSERT",
      "eventVersion": "1.1",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-west-2",
      "dynamodb": {
        "ApproximateCreationDateTime": 1608053091,
        "Keys": {
          "SK": { "S": "VISIT#2020-12-16T17:23:33.145Z#/projects/web" },
          "PK": { "S": f"VISITOR#{ ip }" }
        },
        "NewImage": {
          "User": { "N": "0" },
          "Title": { "S": "Website" },
          "GSI2PK": { "S": f"SESSION#{ ip }#2020-12-16T17:23:30.877Z" },
          "Slug": { "S": "/projects/web" },
          "PreviousSlug": { "S": "/" },
          "Type": { "S": "visit" },
          "GSI1PK": { "S": "PAGE#/projects/web" },
          "GSI2SK": { "S": "VISIT#2020-12-16T17:23:33.145Z" },
          "GSI1SK": { "S": "VISIT#2020-12-16T17:23:33.145Z" },
          "SK": { "S": "VISIT#2020-12-16T17:23:33.145Z#/projects/web" },
          "TimeOnPage": { "N": "3.5540000000000003" },
          "NextTitle": { "S": "Website" },
          "PK": { "S": f"VISITOR#{ ip }" },
          "PreviousTitle": { "S": "Tyler Norlund" },
          "NextSlug": { "S": "/projects/web" }
        },
        "SequenceNumber": "40085700000000003642247446",
        "SizeBytes": 422,
        "StreamViewType": "NEW_IMAGE"
      },
      "eventSourceARN": "arn:aws:dynamodb:us-west-2:681647709217:table/" + \
        f"{ table_name }/stream/2020-12-07T03:47:26.281"
    },
    {
      "eventID": "5df611a92e8d912aee4f7d5ae7914db5",
      "eventName": "INSERT",
      "eventVersion": "1.1",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-west-2",
      "dynamodb": {
        "ApproximateCreationDateTime": 1608053091,
        "Keys": {
          "SK": {
            "S": "VISIT#2020-12-16T17:23:38.331Z#/projects/web/analytics"
          },
          "PK": { "S": f"VISITOR#{ ip }" }
        },
        "NewImage": {
          "User": { "N": "0" },
          "Title": { "S": "Analytics" },
          "GSI2PK": { "S": f"SESSION#{ ip }#2020-12-16T17:23:30.877Z" },
          "Slug": { "S": "/projects/web/analytics" },
          "PreviousSlug": { "S": "/projects/web" },
          "Type": { "S": "visit" },
          "GSI1PK": { "S": "PAGE#/projects/web/analytics" },
          "GSI2SK": { "S": "VISIT#2020-12-16T17:23:38.331Z" },
          "GSI1SK": { "S": "VISIT#2020-12-16T17:23:38.331Z" },
          "SK": {
            "S": "VISIT#2020-12-16T17:23:38.331Z#/projects/web/analytics"
          },
          "TimeOnPage": { "NULL": True },
          "NextTitle": { "NULL": True },
          "PK": { "S": f"VISITOR#{ ip }" },
          "PreviousTitle": { "S": "Website" },
          "NextSlug": { "NULL": True }
        },
        "SequenceNumber": "40085800000000003642247447",
        "SizeBytes": 443,
        "StreamViewType": "NEW_IMAGE"
      },
      "eventSourceARN": "arn:aws:dynamodb:us-west-2:681647709217:table/" + \
        f"{ table_name }/stream/2020-12-07T03:47:26.281"
    },
    {
      "eventID": "acb0f8b453d27aa1b8185a3bd9e49040",
      "eventName": "INSERT",
      "eventVersion": "1.1",
      "eventSource": "aws:dynamodb",
      "awsRegion": "us-west-2",
      "dynamodb": {
        "ApproximateCreationDateTime": 1608053091,
        "Keys": {
          "SK": { "S": "VISIT#2020-12-16T17:23:36.699Z#/projects/web" },
          "PK": { "S": f"VISITOR#{ ip }" }
        },
        "NewImage": {
          "User": {  "N": "0" },
          "Title": { "S": "Website" },
          "GSI2PK": { "S": f"SESSION#{ ip }#2020-12-16T17:23:30.877Z" },
          "Slug": { "S": "/projects/web" },
          "PreviousSlug": { "S": "/projects/web" },
          "Type": { "S": "visit" },
          "GSI1PK": { "S": "PAGE#/projects/web" },
          "GSI2SK": { "S": "VISIT#2020-12-16T17:23:36.699Z" },
          "GSI1SK": { "S": "VISIT#2020-12-16T17:23:36.699Z" },
          "SK": { "S": "VISIT#2020-12-16T17:23:36.699Z#/projects/web" },
          "TimeOnPage": { "N": "1.6320000000000001" },
          "NextTitle": { "S": "Analytics" },
          "PK": { "S": f"VISITOR#{ ip }" },
          "PreviousTitle": { "S": "Website" },
          "NextSlug": { "S": "/projects/web/analytics" }
        },
        "SequenceNumber": "40085900000000003642247448",
        "SizeBytes": 440,
        "StreamViewType": "NEW_IMAGE"
      },
      "eventSourceARN": "arn:aws:dynamodb:us-west-2:681647709217:table/" + \
        f"{ table_name }/stream/2020-12-07T03:47:26.281"
    }
  ]
}
