'use strict';

module.exports.datasetTableName = process.env.DATASET_TABLE_NAME || 'cumulus_datasets';
module.exports.granulesTablePrefix = process.env.GRANULES_PREFIX || 'cumulus_granules_';
module.exports.datapipelineTableName = process.env.DATAPIPELINE_TABLE_NAME || 'cumulus_datapipelines';
