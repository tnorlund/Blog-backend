#!/usr/bin/env node
const entities = require( `./entities` )
const data = require( `./data` )

module.exports = { ...entities, ...data }