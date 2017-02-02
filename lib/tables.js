'use strict';

export const collectionsTableName = process.env.COLLECTIONS_TABLE_NAME || 'cumulus-api-test2-dev-CollectionsTable';
export const datasetTableName = process.env.DATASET_TABLE_NAME || 'cumulus_datasets';
export const granulesTablePrefix = process.env.GRANULES_PREFIX || 'cumulus_granules_';
export const datapipelineTableName = process.env.DATAPIPELINE_TABLE_NAME || 'cumulus_datapipelines';
