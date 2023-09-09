# api-client

A CLI-based API client. Like Postman, but without all the sign-in nonsense.

## Getting Started

1. Create `collections.json`
2. Create `environments.json`
3. `node index.js REQUEST_ID -e ENVIRONMENT`

## `collections.json`

This is the supported JSON structure:
```
[
  {
    "name": "Group Name",
    "requests": [
      {
        "id": "requestId",
        "name": "Request Name",
        "url": "google.com,
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
    "values": [
      {
        "key": "myKey",
        "value": "myValue"
      }
    ]
  }
]
```

## Importing Postman data

It is possible to import data from Postman.
1. Export collection JSON files to /postmanData/collections
2. Export environmemt JSON files to /postmanData/environments
3. `node importPostmanData.js`