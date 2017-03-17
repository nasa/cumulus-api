### Dispatcher

This lambda function is the most important element of Cumulus processing pipeline.

It is responsible for deciding the sequence of steps in each pipeline and starting each step along the way.

The function also updates the database with the latest information about each Granules processing.
