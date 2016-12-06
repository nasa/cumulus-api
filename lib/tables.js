'use strict';

export const datasetTableName = process.env.DATASET_TABLE_NAME || 'cumulus_datasets';
export const granulesTablePrefix = process.env.GRANULES_PREFIX || 'cumulus_granules_';
export const datapipelineTableName = process.env.DATAPIPELINE_TABLE_NAME || 'cumulus_datapipelines';
