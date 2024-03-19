# api-client

A CLI-based API client. Like Postman, but without all the sign-in nonsense.

## Getting Started

1. Create `collections.json`
2. Create `environments.json`
3. `node index.js REQUEST_ID -e ENVIRONMENT`

## `collections.json`

### Reference

|      Property     |  Type  | Required | Default | Description                                                                    | Example                                                  |
|:-----------------:|:------:|:--------:|:-------:|--------------------------------------------------------------------------------|----------------------------------------------------------|
|                id | String | Required |    -    | Unique identifier for the request                                              | requestId1                                               |
|               url | String | Required |    -    | The request URL. Accepts variables.                                            | https://google.com                                       |
|              name | String | Optional |    -    | Display name for request                                                       | My Request                                               |
|            method | String | Optional |   GET   | The request method                                                             | POST                                                     |
|              body | Object | Optional |    -    | The request body (JSON)                                                        | { "username": "test@mail.com" }                          |
|           headers |  Array | Optional |    []   | The request headers (array of key-value pairs)                                 | [{ "key": "Content-Type", "value": "application/json" }] |
|         variables |  Array | Optional |    []   | List of variables to be used in requests (see [Variables](#variables)).        | [{ "key": "host", "value": "google.com" }]               |
|      dependencies |  Array | Optional |    []   | Requests to be executed before this one. List of request ids.                  | ["requestId1", "requestId2"]                             |
| cacheAsDependency | Number | Optional |    0    | If used as dependency, how long to cache the request response for, in seconds. | 3600                                                     |

### Example

This is the supported JSON structure:
```
[
  {
    "name": "Group Name",
    "requests": [
      {
        "id": "requestId",
        "name": "Request Name",
        "url": "google.com",
        "method": "GET",
        "headers": [
          {
            "key": "Header Name",
            "value": "header value"
          }
        ],
        "body": { ... }
      }
    ],
    "variables": [
      {
        "key": "myKey",
        "value": "myValue"
      }
    ]
  }
]
```
## `environments.json`

This is the supported JSON structure:
```
[
  {
    "id": "environmentId",
    "name": "Environment Name",
    "variables": [
      {
        "key": "myKey",
        "value": "myValue"
      }
    ]
  }
]
```

## Variables

Variables defined in environments or request groups can be used inside request URLs, headers and body. The syntax is `{{VARIABLE}}`.
Example:
```
// environments.json
[
  {
    ...
    "variables": [
      {
        "key": "protocol",
        "value": "https"
      },
      {
        "key": "host",
        "value": "google.com"
      }
    ]
  }
]
// collections.json
[
  {
    "id": "requestId",
    "name": "Request Name",
    "url": "{{protocol}}://{host}",
    "method": "GET",
  }
]
```

### Dependency result variables

Use $ as a prefix. E.g. `{{$0.myData.token}}`

### Code snippet variables

Use @ as a prefix. E.g. `{{@Date.now()}}`
This will execute provided string as JavaScript, use with caution.

## Dependencies

You can define requests as dependencies for other requests, and inject their response data. This is helpful e.g. for authentication prior to every request.

To access dependency response data you need to prefix your variable with $ and then use dot notation to access the data you want.
The dependency response data will always be an array since there can be multiple dependencies. Therefore you need to access the array's index first (based on the dependency order).

E.g. `{{$2.myData.helloWorld}}` will access `myData.helloWorld` from the third dependency response.

Full example:
```
[
  {
    "id": "authenticate",
    "name": "Authenticate",
    "url": "https://myWebsite.com/login",
    "method": "POST",
    "body": {
      "username": "myUsername",
      "password": "password123"
    }
  },
  {
    "id": "fetch-data",
    "name": "Fetch some data",
    "dependencies": ["authenticate"],
    "url": "https://myWebsite.com/data",
    "method": "GET",
    "headers": {
      "Authentication": "Bearer {{$0.data.authToken}}"
    }
  }
]
```

## Importing Postman data

It is possible to import data from Postman.
1. Export collection JSON files to /postmanData/collections
2. Export environmemt JSON files to /postmanData/environments
3. `node importPostmanData.js`