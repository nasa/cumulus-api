'use strict';

// step definition
const step = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Recipe Step Definition',
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    config: {
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
      type: 'object',
      properties: {
        regex: {
          type: 'string'
        },
        access: {
          type: 'string'
        },
        source: {
          type: 'string'
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
      type: 'string'
    },
    granuleIdExtraction: {
      type: 'string'
    },
    files: {
      $ref: '#/definitions/fileType'
    },
    needForProcessing: {
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

// ingest definition
const ingest = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'ingest object',
  type: 'object',
  properties: {
    type: {
      type: 'string'
    },
    config: {
      type: 'object',
      properties: {
        host: {
          type: 'string'
        },
        username: {
          type: 'string'
        },
        password: {
          type: 'string'
        }
      }
    },
    invokingSchedule: {
      type: 'string'
    }
  },
  required: [
    'type',
    'config'
  ]
};

// recipe definition
const recipe = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Recipe for collections',
  type: 'object',
  properties: {
    order: {
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
      type: 'string'
    },
    granuleDefinition: {
      $ref: '#/definitions/granuleDefinition'
    },
    ingest: {
      $ref: '#/definitions/ingest'
    },
    recipe: {
      $ref: '#/definitions/recipe'
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
  ],
  definitions: {
    granuleDefinition: granuleDefinition,
    ingest: ingest,
    recipe: recipe,
    fileType: fileType,
    step: step
  }
};

// Granule Record Schema
export const granule = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Granule Object',
  type: 'object',
  properties: {
    granuleId: {
      type: 'string'
    },
    collectionName: {
      type: 'string'
    },
    pdrName: {
      type: 'string'
    }
    conceptId: {
      type: 'string'
    },
    status: {
      enum: ['ingesting', 'processing', 'archiving', 'cmr', 'completed', 'failed'],
    },
    files: {
      $ref: '#/definitions/fileName'
    },
    recipe: {
      $ref: '#/definitions/recipe'
    },
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
  ],
  definitions: {
    fileName: fileName,
    recipe: recipe,
    step: step
  }
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
      type: 'string'
    },
    status: {
      enum: ['discovered', 'parsed', 'processing', 'completed'],
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
  },
  definitions: {
    granules: granule,
    fileName: fileName,
    recipe: recipe,
    step: step
  }
};

if (require.main === module) {
  console.log(JSON.stringify(collection));
}
