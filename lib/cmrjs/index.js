import fs from 'fs';
import _ from 'lodash';
import request from 'request';
import { parseString } from 'xml2js';
import Logger from '../log';
import {
  validate,
  updateToken,
  getUrl,
  xmlParseOptions
} from './utils';

const log = new Logger('/lib/cmrjs/index.js');

async function searchConcept(type, searchParams, existingResults) {
  const limit = process.env.CMR_LIMIT || 100;
  const pageSize = process.env.CMR_PAGE_SIZE || 50;
  let pageNum = 1;

  if (searchParams.page_num) {
    pageNum = searchParams.page_num + 1;
  }

  // Recursively retrieve all the search results for collections or granules
  // Also, parse them from XML into native JS objects
  const qs = Object.assign(
    Object.assign({ page_size: pageSize }, searchParams),
    { page_num: pageNum }
  );

  const body = await new Promise((resolve, reject) => {
    request.get({
      url: getUrl('search') + type,
      qs: qs
    }, (err, resp) => {
      if (err) reject(err);
      resolve(resp);
    });
  });

  const str = await new Promise((resolve, reject) => {
    parseString(body, xmlParseOptions, (err, res) => {
      if (err) reject(err);

      if (res.errors) {
        const errorMessage = JSON.stringify(res.errors.error);
        throw new Error(errorMessage);
      }

      resolve(res);
    });
  });

  existingResults = existingResults.concat(str.results.references.reference || []);

  const servedSoFar = (
    ((qs.page_num - 1) * qs.page_size) +
    (str.results.references ? str.results.references.reference.length : 0)
  );
  const isThereAnotherPage = str.results.hits > servedSoFar;
  if (isThereAnotherPage && servedSoFar < limit) {
    return await searchConcept(type, qs, existingResults);
  }

  return existingResults.slice(0, limit);
}


export async function searchCollections(searchParams) {
  return await searchConcept('collection', searchParams, []);
}


export async function searchGranules(searchParams) {
  return await searchConcept('granule', searchParams, []);
}


async function ingestConcept(type, xml, identifierPath) {
  // Accept either an XML file, or an XML string itself
  let xmlString = xml;
  if (fs.existsSync(xml)) {
    xmlString = fs.readFileSync(xml, 'utf8');
  }

  let xmlObject = await new Promise((resolve, reject) => {
    parseString(xmlString, xmlParseOptions, (err, obj) => {
      if (err) reject(err);
      resolve(obj);
    });
  });

  log.debug('XML object parsed');
  const identifier = _.property(identifierPath)(xmlObject);
  const token = await updateToken();

  try {
    await validate(type, xmlString, identifier, token);
    log.debug('XML object is valid');

    log.debug('Pushing xml metadata to CMR');
    const response = await new Promise((resolve, reject) => {
      request.put({
        url: `${getUrl('ingest')}${type}s/${identifier}`,
        body: xmlString,
        headers: {
          'Echo-Token': token,
          'Content-type': 'application/echo10+xml'
        }
      }, (err, resp) => {
        if (err) reject(err);
        resolve(resp);
      });
    });
    log.debug('Metadata pushed to CMR.');

    xmlObject = await new Promise((resolve, reject) => {
      parseString(response.body, xmlParseOptions, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });

    if (xmlObject.errors) {
      throw new Error(
        `Failed to ingest, CMR error message: ${JSON.stringify(xmlObject.errors.error)}`
      );
    }

    return xmlObject;
  }
  catch (e) {
    log.error(e);
    log.error(e.stack);
    throw e;
  }
}


export async function ingestCollection(xml) {
  return await ingestConcept('collection', xml, 'Collection.DataSetId');
}


export async function ingestGranule(xml) {
  log.debug('Ingesting granule');
  return await ingestConcept('granule', xml, 'Granule.GranuleUR');
}


async function deleteConcept(type, identifier) {
  const token = await updateToken();
  const url = `${getUrl('ingest')}${type}/${identifier}`;

  const response = await new Promise((resolve, reject) => {
    request.delete({
      url: url,
      headers: {
        'Echo-Token': token,
        'Content-type': 'application/echo10+xml'
      }
    }, (err, resp) => {
      if (err) reject(err);
      resolve(resp);
    });
  });

  const xmlObject = await new Promise((resolve, reject) => {
    parseString(response.body, xmlParseOptions, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

  if (xmlObject.errors) {
    throw new Error(
      `Failed to delete, CMR error message: ${JSON.stringify(xmlObject.errors.error)}`
    );
  }

  return xmlObject;
}


export async function deleteCollection(datasetID) {
  return await deleteConcept('collection', datasetID);
}


export async function deleteGranule(granuleUR) {
  return await deleteConcept('granule', granuleUR);
}
