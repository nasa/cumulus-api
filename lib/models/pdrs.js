'use strict';

import pvl from 'pvl';
import { Manager } from './base';
import { PDRParsingError } from '../pdr';
import { pdr as pdrSchema } from '../schemas';


export class Pdr extends Manager {
  constructor() {
    super(process.env.PDRsTable, pdrSchema);
  }

  static buildRecord(pdrName, provider, originalUrl) {
    return {
      pdrName: pdrName,
      provider: provider,
      originalUrl: originalUrl,
      status: 'discovered',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      discoveredAt: Date.now()
    };
  }

  /**
   * Depending on the type of Error, this method might
   * generate a PDRD message for the providers
   *
   */
  async hasCompleted(pdrName, shortPan = true) {
    const values = {
      status: 'completed',
      isActive: false
    };

    // if shortPan set to true we generate a successful
    // shortPan
    if (shortPan) {
      // generate PDRD message
      const pan = pvl.jsToPVL(
        new pvl.models.PVLRoot()
               .add('MESSAGE_TYPE', new pvl.models.PVLTextString('SHORTPAN'))
               .add('DISPOSITION', new pvl.models.PVLTextString('SUCCESSFUL'))
               .add('TIME_STAMP', new pvl.models.PVLDateTime(new Date()))
      );

      values.PAN = pan;
      values.PANSent = false;
    }

    return this.update({ pdrName }, values);
  }

  /**
   * Depending on the type of Error, this method might
   * generate a PDRD message for the providers
   *
   */
  async hasFailed(key, err) {
    const error = typeof err === 'object' ? JSON.stringify(err) : err;
    const values = {
      status: 'failed',
      error: error,
      isActive: false
    };

    if (err instanceof PDRParsingError) {
      // generate PDRD message
      const pdrd = pvl.jsToPVL(
        new pvl.models.PVLRoot()
               .add('MESSAGE_TYPE', new pvl.models.PVLTextString('SHORTPDRD'))
               .add('DISPOSITION', new pvl.models.PVLTextString(err.message))
      );

      values.PDRD = pdrd;
      values.PDRDSent = false;
    }

    return this.update(key, values);
  }
}
