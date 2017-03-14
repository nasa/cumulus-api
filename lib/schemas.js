'use strict';

// step definition
const step = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Recipe Step Definition',
  type: 'object',
  properties: {
    name: {
      title: 'Recipe Name',
      type: 'string'
    },
    config: {
      title: 'Recipe Configuration',
      type: 'object',
      additionalProperties: true
    }
  },
  required: [
    'name',
    'config'
  ]
};

// fileType definition
const fileType = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Granule File Type',
  type: 'object',
  patternProperties: {
    '^[a-zA-Z\\d]+$': {
      title: 'File Type Configuration',
      type: 'object',
      properties: {
        regex: {
          title: 'Regex',
          type: 'string'
        },
        access: {
          title: 'Access Level',
          type: 'string',
          enum: ['private', 'protected', 'public']
        },
        source: {
          title: 'File source',
          type: 'string',
          enum: ['sips', 'cumulus']
        }
      }
    }
  }
};

// fileName Defintion (used in granule record)
const fileName = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'FileName Object',
  description: 'Used in a Granule Record',
  type: 'object',
  patternProperties: {
    '^[a-zA-Z\\d\\W]+$': {
      originalFile: {
        type: 'string'
      },
      stagingFile: {
        type: 'string'
      },
      archivedFile: {
        type: 'string'
      }
    }
  }
};

// granule definition
const granuleDefinition = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Granule Definition Object',
  description: 'Describes what constitutes a granule',
  type: 'object',
  properties: {
    granuleId: {
      title: 'Granule ID Validation Regex',
      description: 'This is used to validate an extracted granule ID',
      type: 'string'
    },
    granuleIdExtraction: {
      title: 'Granule ID Extraction Regex',
      description: 'This is used to extract the granule ID from filenames',
      type: 'string'
    },
    files: fileType,
    needForProcessing: {
      title: 'Files Required for Processing to Start',
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: [
    'granuleId',
    'files'
  ]
};

// recipe definition
const recipe = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Recipe for collections',
  type: 'object',
  properties: {
    order: {
      title: 'Order of Recipe Steps',
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  patternProperties: {
    // matches everything other than order
    '^(?!.*order).*[a-zA-Z\\d]+$': {
      type: 'object',
      properties: {
        config: {
          title: 'Step Configuration',
          type: 'object'
        }
      },
      required: [
        'config'
      ]
    }
  },
  additionalProperties: false,
  uniqueProperties: true,
  required: [
    'order'
  ]
};

// Collection Record Definition
export const collection = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Collection Object',
  description: 'Cumulus-api Collection Table schema',
  type: 'object',
  properties: {
    collectionName: {
      title: 'Collection Name',
      type: 'string'
    },
    granuleDefinition: granuleDefinition,
    cmrProvider: {
      title: 'CMR Provider, e.g. CUMULUS',
      type: 'string'
    },
    providers: {
      title: 'Providers',
      description: 'Provider names associated with this collection',
      type: 'array',
      items: {
        type: 'string'
      }
    },
    recipe: recipe,
    status: {
      title: 'Status',
      type: 'string',
      enum: ['ingesting', 'stopped'],
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'number'
    },
    changedBy: {
      type: 'string'
    }
  },
  required: [
    'collectionName',
    'granuleDefinition',
    'recipe',
    'createdAt',
    'updatedAt'
  ]
};

// Granule Record Schema
export const granule = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Granule Object',
  type: 'object',
  properties: {
    granuleId: {
      title: 'Granule ID',
      type: 'string'
    },
    collectionName: {
      type: 'string'
    },
    pdrName: {
      type: 'string'
    },
    conceptId: {
      type: 'string'
    },
    status: {
      type: 'string',
      enum: ['ingesting', 'processing', 'archiving', 'cmr', 'completed', 'failed'],
    },
    cmrConceptId: {
      type: 'string'
    },
    files: fileType,
    recipe: recipe,
    readyForProcess: {
      type: 'number'
    },
    processedAt: {
      type: 'number'
    },
    pushedToCMRAt: {
      type: 'number'
    },
    archivedAt: {
      type: 'number'
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'number'
    }
  },
  required: [
    'granuleId',
    'status',
    'collectionName',
    'pdrName',
    'recipe',
    'createdAt',
    'updatedAt'
  ]
};

// Invoke Record Schema
export const invoke = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Invoke Record Object',
  type: 'object',
  properties: {
    collectionName: {
      type: 'string'
    },
    invokeSchedule: {
      type: 'string'
    },
    invokedAt: {
      type: 'number'
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'number'
    }
  }
};

// PDR Record Schema
export const pdr = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'PDR Record Object',
  type: 'object',
  properties: {
    pdrName: {
      title: 'PDR Name',
      type: 'string'
    },
    provider: {
      title: 'Provider Name',
      type: 'string'
    },
    isActive: {
      type: 'boolean'
    },
    status: {
      type: 'string',
      enum: ['discovered', 'parsed', 'completed', 'failed']
    },
    address: {
      type: 'string'
    },
    originalUrl: {
      type: 'string'
    },
    completedAt: {
      type: 'number'
    },
    parsedAt: {
      type: 'number'
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'number'
    }
  },
  required: [
    'pdrName',
    'provider',
    'status',
    'originalUrl',
    'createdAt',
    'updatedAt'
  ]
};

// Payload Schema (payload is the message sent to dispatcher)
export const payload = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Payload object',
  type: 'object',
  properties: {
    previousStep: {
      type: 'number'
    },
    nextStep: {
      type: 'number'
    },
    granuleRecord: {

    }
  }
};

// Provider Schema => the model keeps information about each ingest location
export const provider = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Provider Object',
  description: 'Keep the information about each ingest endpoint',
  type: 'object',
  properties: {
    name: {
      title: 'Title',
      description: 'A title for the provider record',
      type: 'string',
      pattern: '^([\\w\\d_\\-]*)$'
    },
    providerName: {
      title: 'Provider, e.g. MODAPS',
      description: 'Name of the SIP',
      type: 'string'
    },
    protocol: {
      title: 'Protocol',
      type: 'string',
      enum: ['http', 'ftp']
    },
    host: {
      title: 'Host',
      type: 'string'
    },
    path: {
      title: 'Path to the PDR/files folder',
      type: 'string'
    },
    config: {
      title: 'Configuration',
      type: 'object',
      properties: {
        username: {
          type: 'string'
        },
        password: {
          type: 'string'
        },
        port: {
          type: 'string'
        }
      }
    },
    status: {
      title: 'Status',
      type: 'string',
      enum: ['ingesting', 'stopped', 'failed'],
    },
    isActive: {
      title: 'Is Active?',
      type: 'boolean'
    },
    regex: {
      type: 'object',
      patternProperties: {
        '^([\\S]*)$': {
          type: 'string'
        }
      }
    },
    lastTimeIngestedAt: {
      title: 'Last Time Ingest from the Provider',
      type: 'number'
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'number'
    }
  },
  required: [
    'name', 'providerName', 'protocol', 'host', 'path',
    'isActive', 'status', 'createdAt', 'updatedAt'
  ]
};

