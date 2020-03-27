/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

const argscheck = require('cordova/argscheck');

    
const exec = require('cordova/exec');

    
const ContactError = require('./ContactError');

    
const Contact = require('./Contact');

    
const fieldType = require('./ContactFieldType');

    
const convertUtils = require('./convertUtils');

/**
* Represents a group of Contacts.
* @constructor
*/
var contacts = {
    fieldType,
    /**
     * Returns an array of Contacts matching the search criteria.
     * @param fields that should be searched
     * @param successCB success callback
     * @param errorCB error callback
     * @param {ContactFindOptions} options that can be applied to contact searching
     * @return array of Contacts matching search criteria
     */
    find(fields, successCB, errorCB, options) {
        argscheck.checkArgs('afFO', 'contacts.find', arguments);
        if (!fields.length) {
            if (errorCB) {
                errorCB(new ContactError(ContactError.INVALID_ARGUMENT_ERROR));
            }
        } else {
            // missing 'options' param means return all contacts
            options = options || { filter: '', multiple: true };
            const win = function(result) {
                const cs = [];
                for (let i = 0, l = result.length; i < l; i++) {
                    cs.push(convertUtils.toCordovaFormat(contacts.create(result[i])));
                }
                successCB(cs);
            };
            exec(win, errorCB, "Contacts", "search", [fields, options]);
        }
    },

    checkPermission(successCB, errorCB) {
        exec(successCB, errorCB, "Contacts", "checkPermission");
    },

    /**
     * This function picks contact from phone using contact picker UI
     * @returns new Contact object
     */
    pickContact (fields, successCB, errorCB, options) {

        argscheck.checkArgs('afFO', 'contacts.pick', arguments);

        const win = function (result) {
            // if Contacts.pickContact return instance of Contact object
            // don't create new Contact object, use current
            const contact = result instanceof Contact ? result : contacts.create(result);
            successCB(convertUtils.toCordovaFormat(contact));
        };
        exec(win, errorCB, "Contacts", "pickContact", [fields, options]);
    },

    /**
     * This function picks contact from phone using contact picker UI
     * @returns new Contact object
     */
    pickContacts (fields, successCB, errorCB, options) {

        argscheck.checkArgs('afFO', 'contacts.pick', arguments);

        const win = function (results) {
            results.map((result) => {
                // if Contacts.pickContact return instance of Contact object
                // don't create new Contact object, use current
                const contact = result instanceof Contact ? result : contacts.create(result);
                return convertUtils.toCordovaFormat(contact);
            });

            successCB(results);
        };
        exec(win, errorCB, "Contacts", "pickContact", [fields, options]);
    },

    /**
     * This function creates a new contact, but it does not persist the contact
     * to device storage. To persist the contact to device storage, invoke
     * contact.save().
     * @param properties an object whose properties will be examined to create a new Contact
     * @returns new Contact object
     */
    create(properties) {
        argscheck.checkArgs('O', 'contacts.create', arguments);
        const contact = new Contact();
        for (const i in properties) {
            if (typeof contact[i] !== 'undefined' && properties.hasOwnProperty(i)) {
                contact[i] = properties[i];
            }
        }
        return contact;
    }
};

module.exports = contacts;
