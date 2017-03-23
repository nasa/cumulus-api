### Runner

This function runs as a service on AWS ECS and is responsible for staring ECS Tasks for granule processing.

It reads from the ProcessingQueue and starts an ECS Task for each message in the queue.

When the capacity of the ECS cluster is at maximum an no new tasks can be posted, the runner waits and repeats the task submission until the task is submitted.

This is the main bottleneck of Cumulus. When the cluster runs at full capacity, granules will have to wait here until space opens up.
