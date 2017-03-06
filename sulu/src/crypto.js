'use strict';

const forge = require('node-forge');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');


function generateKeyPair() {
  const rsa = forge.pki.rsa;
  console.log('Generating keys. It might take a few seconds!');
  return rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
}

function uploadKeyPair(bucket, stack, stage, profile, cb) {
  profile = profile || 'default';
  const credentials = new AWS.SharedIniFileCredentials({ profile: profile });
  AWS.config.credentials = credentials;

  const pki = forge.pki;
  const keyPair = generateKeyPair();
  console.log('Keys Generated');

  const s3 = new AWS.S3();

  // upload the private key
  const privateKey = pki.privateKeyToPem(keyPair.privateKey);
  const params1 = {
    Bucket: bucket,
    Key: `${stack}-${stage}/crypto/private.pem`,
    ACL: 'private',
    Body: privateKey
  };

  // upload the public key
  const publicKey = pki.publicKeyToPem(keyPair.publicKey);
  const params2 = {
    Bucket: bucket,
    Key: path.join(`${stack}-${stage}`, `/crypto/public.pub`),
    ACL: 'private',
    Body: publicKey
  };

  s3.putObject(params1).promise()
    .then(() => s3.putObject(params2).promise())
    .then(() => {
      console.log('keys uploaded to S3');

      // save public key to local folder
      const p = path.join(process.cwd(), `config/${stack}-${stage}.pub`);
      fs.writeFileSync(p, publicKey);
      console.log(`Public key saved to ${p}`);
      return cb(null, keyPair.publicKey);
    })
    .catch(e => cb(e));
}

module.exports.uploadKeyPair = uploadKeyPair;
