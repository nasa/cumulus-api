## PDR Parser and Handler

This module performs a number of actions:

- **Discover PDRs:** Discover PDRs from an ingest location and Queue them for download
- **Parse PDR:** Reads from a Queue to download and parse the PDRs and add files for download
- **Download Granule Files:** Read the list of files to be downloaded from the queue and download them

### Discover PDRs

Process is started by invoking `discoverPdrHandler`. The `event` argument must include `collectionName`, otherwise the discover handler wouldn't know which ingest configuration to load.

### Parse PDRs

Process is started by invoking `parsePdrsHandler`. The `event` agument could include `numOfMessage` and `visiblityTimeout` as optional keys. `numOfMessage` determines the concurreny of the process.

The process polls a SQS queue and loops until terminated. `parsePdrHandler` calls `pollPdrQueue` which uses `parsePdr` to download and parse the PDRs.


### Download Granule Files
