// process.js
'use strict'
const {
  addLocationFromIP
} = require( `/opt/nodejs/index` )
console.log( `Loading function` )

/**
 * The Kinesis Firehose record.
 * @typedef {Object} Record
 * @property {string} recordId The unique ID of the Kinesis Firehose record.
 * @property {number} approximateArrivalTimestamp The UNIX epoch time the
 *   record was recorded.
 * @property {string} data The raw data of the record in Base64 format.
 */

/**
 * The Kinesis Firehose event.
 * @typedef {Object} Event
 * @property {string} invocationId - The unique ID of the Kinesis Firehose
 *   stream event.
 * @property {string} deliveryStreamArn - The ARN of the Kinesis Firehose
 *   stream.
 * @property {string} region - The AWS region the Kinesis Firehose is in.
 * @property {[Record]} records - The Firehose records stored in this buffer.
 */

/**
 * Processes the Kinesis Firehose stream.
 * @param {Event} event The Kinesis Stream event.
 * @param {Object} context The context of the Lambda Function's event.
 * @param {Function} callback The callback for the Lambda Function.
 */
exports.handler = async ( event, context, callback ) => {
  /** Number of valid entries found */
  let success = 0
  /** Number of invalid entries found */
  let failure = 0
  /** Number of dropped entries */
  let dropped = 0

  /** 
   * Process the list of records and transform them.
   *
   * Note that the object is a promise. Must promise all before returning the
   * values.
   */
  const output = event.records.map( async ( record ) => {
    /* Parse the Base64 format string into a UTF-8 format string */
    const entry = new Buffer.from( record.data, `base64` ).toString( `utf8` )
    try {
      /* Parse the UTF-8 string as a JSON */
      const data = JSON.parse( entry )
      /** When the record is an array parse the scroll locations into a single
       *  record.
       */
      if ( Array.isArray( data ) ) {
        const parsed_data = data.map( ( scroll ) => {
          if (
            scroll.id &&
            scroll.date &&
            scroll.title &&
            scroll.slug &&
            scroll.app &&
            scroll.height &&
            scroll.width &&
            typeof scroll.x == `number` &&
            typeof scroll.y == `number`
          ) {
            /* eslint-disable max-len */
            return `${ new Date().getTime() },\t${ scroll.id },\t${ scroll.date },\t${ scroll.title },\t${ scroll.slug },\t${ scroll.app },\t${ scroll.height },\t${ scroll.width },\t${ scroll.x },\t${ scroll.y }`
          }
        } ).join( `\n` ) + `\n`
        const payload = new Buffer.from(
          parsed_data, `utf8`
        ).toString( `base64` )
        success++
        return {
          recordId: record.recordId,
          result: 'Ok',
          data: payload
        }
      }
      /* When the JSON has these keys, add them to the S3 bucket */
      else if (
        data.id &&
        data.ip
      ) {
        await addLocationFromIP( process.env.TABLE_NAME, data.id, data.ip )
        dropped++
        return {
          recordId: record.recordId,
          result: 'Dropped',
          data: record.data
        }
      }
      else {
        /* Dropped event, notify and leave the record intact */
        dropped++;
        return {
          recordId: record.recordId,
          result: 'Dropped',
          data: record.data
        }
      }
    } catch( error ) {
      /* Failed event, notify the error and leave the record intact */
      console.log( `Failed event : ${ record.data }` )
      failure++
      return {
        recordId: record.recordId,
        result: `ProcessingFailed`,
        data: record.data
      }
    }
  } )
  /* eslint-disable max-len */
  console.log( `Processing completed.  Processed records ${output.length}.\n${ success } Successful\n${ dropped } Dropped\n${ failure } Failed` )
  callback( null, { records: await Promise.all( output ) } )
}