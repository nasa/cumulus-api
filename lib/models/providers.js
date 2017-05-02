'use strict';

import forge from 'node-forge';
import { Manager } from './base';
import { S3 } from '../aws-helpers';
import { provider as providerSchema } from '../schemas';

export class Provider extends Manager {
  constructor() {
    super(process.env.ProvidersTable, providerSchema);
    this.removeAdditional = 'all';
  }

  async encryptPassword(password) {
    // Download the publickey
    const pki = forge.pki;
    const pub = await S3.get(
      process.env.internal,
      `${process.env.StackName}-${process.env.Stage}/crypto/public.pub`
    );

    const publicKey = pki.publicKeyFromPem(pub.Body.toString());
    return publicKey.encrypt(password);
  }

  async decryptPassword(password) {
    const pki = forge.pki;
    const priv = await S3.get(
      process.env.internal,
      `${process.env.StackName}-${process.env.Stage}/crypto/private.pem`
    );

    const privateKey = pki.privateKeyFromPem(priv.Body.toString());
    return privateKey.decrypt(password);
  }

  async create(items) {
    if (items instanceof Array) {
      for (const item of items) {
        if (!item.regex) {
          item.regex = {};
        }
      }
    }
    else {
      items.regex = {};
    }

    // encrypt the password
    if (items.config && items.config.password) {
      items.config.password = await this.encryptPassword(items.config.password);
    }

    return super.create(items);
  }

  async addRegex(name, granuleIdExtraction, collectionName) {
    const params = {
      TableName: this.tableName,
      Key: { name: name },
      UpdateExpression: 'SET regex.#collectionName = :value',
      ExpressionAttributeNames: {
        '#collectionName': collectionName
      },
      ExpressionAttributeValues: {
        ':value': granuleIdExtraction
      },
      ReturnValues: 'ALL_NEW'
    };

    const response = await this.dynamodb.update(params).promise();
    return response.Attributes;
  }

  async removeRegex(name, collectionName) {
    const params = {
      TableName: this.tableName,
      Key: { name: name },
      UpdateExpression: 'REMOVE regex.#collectionName',
      ExpressionAttributeNames: {
        '#collectionName': collectionName
      },
      ReturnValues: 'ALL_NEW'
    };

    const response = await this.dynamodb.update(params).promise();
    return response.Attributes;
  }

  /**
   * Sets the PDR record to active and updates status to ingesting
   *
   */
  async restart(name) {
    return this.update(
      { name: name },
      { status: 'ingesting', isActive: true },
      ['error'] // keys to delete
    );
  }
}
