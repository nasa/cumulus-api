'use strict';

import { handle } from 'cumulus-common/response';

function list(event, cb) {
   return cb(null, {
  "queues": [{
    "name": "cumulus-api-lpdaac-dev-DispatcherFailedQueue",
    "messagesAvailable": 2,
    "messagesInFlight": 0
  }, {
    "name": "cumulus-api-lpdaac-dev-GranulesQueue",
    "messagesAvailable": 2,
    "messagesInFlight": 0
  }],
  "ecsInstances": [{
    "instanceId": "i-0c3f43f3ab0cbc2c9",
    "cpuAvailable": 2033,
    "memoryAvailable": 7474,
    "runningTasksCount": 2
  }, {
    "instanceId": "i-0c3f4234cbc2c9",
    "cpuAvailable": 1033,
    "memoryAvailable": 5474,
    "runningTasksCount": 10
  }],
  "tasks": [{
    "id": "20b71d43-9dda-4778-8af9-b5f463aaf682",
    "taskDefinition": "cumulus-api-lpdaac-discoverPdrsTaskDefinition-1BW7FAS8ZTPN1:1",
    "lastStatus": "RUNNING",
    "desiredStatus": "RUNNING",
    "startedBy": "N/A"
  }, {
    "id": "20b71d43-9dda-4778-8af9-b5f463aaf682",
    "taskDefinition": "cumulus-api-lpdaac-discoverPdrsTaskDefinition-1BW7FAS8ZTPN1:1",
    "lastStatus": "RUNNING",
    "desiredStatus": "RUNNING",
    "startedBy": "N/A"
  }, {
    "id": "20b71d43-9dda-4778-8af9-b5f463aaf682",
    "taskDefinition": "cumulus-api-lpdaac-discoverPdrsTaskDefinition-1BW7FAS8ZTPN1:1",
    "lastStatus": "RUNNING",
    "desiredStatus": "RUNNING",
    "startedBy": "N/A"
  }],
  "services": [{
    "serviceName": "cumulus-api-lpdaac-ingestGranulesECSService-OA81E4Y0CV5O",
    "status": "ACTIVE",
    "taskDefinition": "cumulus-api-lpdaac-discoverPdrsTaskDefinition-1BW7FAS8ZTPN1:1",
    "desiredTasks": 1,
    "runningTasks": 1
  }, {
    "serviceName": "cumulus-api-lpdaac-ingestGranulesECSService-OA81E4Y0CV5O",
    "status": "ACTIVE",
    "taskDefinition": "cumulus-api-lpdaac-discoverPdrsTaskDefinition-1BW7FAS8ZTPN1:1",
    "desiredTasks": 1,
    "runningTasks": 1
  }, {
    "serviceName": "cumulus-api-lpdaac-ingestGranulesECSService-OA81E4Y0CV5O",
    "status": "ACTIVE",
    "taskDefinition": "cumulus-api-lpdaac-discoverPdrsTaskDefinition-1BW7FAS8ZTPN1:1",
    "desiredTasks": 1,
    "runningTasks": 1
  }]
});
}

export function handler(event, context) {
  handle(event, context, true, (cb) => {
    list(event, cb);
  });
}

