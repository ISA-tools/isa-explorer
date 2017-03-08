import Papa from 'papaparse';
import { zip, zipObject, find, isArray, pick } from 'lodash';
import {
    ONTOLOGY_SOURCE_REFERENCE, INVESTIGATION, STUDY, INVESTIGATION_PUBLICATIONS, INVESTIGATION_CONTACTS,
    STUDY_DESIGN_DESCRIPTORS, STUDY_PUBLICATIONS, STUDY_FACTORS, STUDY_ASSAYS, STUDY_PROTOCOLS, STUDY_CONTACTS,
    DATA_RECORDS, DATA_RECORD_URI, DATA_RECORD_ACCESSION, DATA_REPOSITORY, DATA_RECORDS_SEPARATOR
 } from '../utils/constants';

function findLine(collection, term) {
    return find(collection, item => {
        return item[0] === term;
    });
}

/**
 * @class
 * @name ISATab
 * @private{Object} _investigation
 * @private{Object} _study
 */
export default class ISATab {

    /**
     * @constructor
     * @param{string} investigation
     */
    constructor(investigationCSVString) {
        const { data: parsed } = Papa.parse(investigationCSVString);
        const investigationIdx = parsed.findIndex(el => el[0] === INVESTIGATION);
        let currStudyIdx = parsed.findIndex(el => el[0] === STUDY);
        const ontologyIdx = parsed.findIndex(el => el[0] === ONTOLOGY_SOURCE_REFERENCE);
        parsed.splice(0, ontologyIdx); //throw out the top comments
        this.parseOntologySourceReference(parsed.splice(0, investigationIdx - ontologyIdx));
        this.parseInvestigation(parsed.splice(0, currStudyIdx - investigationIdx));
        while(currStudyIdx > -1) {
            const nextStudyIdx = parsed.slice(1).map(el => el[0]).indexOf(STUDY),
                studyChunk = nextStudyIdx > -1 ? parsed.splice(0, nextStudyIdx) : parsed;
            this.parseStudy(studyChunk);
            currStudyIdx = nextStudyIdx;
        }
    }

    get investigation() {
        return this._investigation;
    }

    /*
    set investigation(investigationCSVString) {
        if (isEmpty(parsed.error)) {
            this._investigation = parsed.data;
        }
        else {
            throw new Error('The provided investigation file is malformed and could not be parsed');
        }
    } */

    get study() {
        return this._study;
    }

    //TODO implement this!!
    parseOntologySourceReference(ontologySourceReferenceArr) {
        return {};
    }

    parseInvestigation(investigationArr) {
        investigationArr.splice(0, 1); // remove first iten
        const publicationIdx = investigationArr.indexOf(el => el[0] === INVESTIGATION_PUBLICATIONS);
        const contactsIdx = investigationArr.indexOf(el => el[0] == INVESTIGATION_CONTACTS);
        const investigation = {};
        for (const item of investigationArr.slice(0, publicationIdx)) {
            investigation[item[0]] = item.slice(1);
        }
        const publications = [], publicationsArr = zip(...investigationArr.slice(publicationIdx+1, contactsIdx));
        for (let i = 1; i < publicationsArr.length; i++) {
            publications.push(zipObject(publicationsArr[0], publicationsArr[i]));
        }
        investigation.publications = publications;
        const contacts = [], contactsArr = zip(...investigationArr.slice(contactsIdx+1));
        for (let i = 1; i < publicationsArr.length; i++) {
            contacts.push(zipObject(contactsArr[0], contactsArr[i]));
        }
        investigation.contacts = contacts;
        this._investigation = investigation;

    }

    /**
     * @method
     * @name parseStudy
     * @param{Array} studyArr
     * @description parse an array containing the study as parsed from the CSV investigation file and converts it into a study object that is stored into the
                    array of studies within the investigation property of the class instance
     */
    parseStudy(studyArr) {
        if (!this._investigation) {
            return;
        }
        if (!isArray(this._investigation.studies)) {
            this._investigation.studies = [];
        }
        // fin the index for each study section
        const study = {}, idxObj = {}, studyProperties = [STUDY_DESIGN_DESCRIPTORS, STUDY_PUBLICATIONS, STUDY_FACTORS, STUDY_ASSAYS, STUDY_PROTOCOLS, STUDY_CONTACTS];
        for (const elem of studyProperties) {
            idxObj[elem] = studyArr.map(el => el[0]).indexOf(elem);
        }
        // populate the study header/non-nested properties
        for (const item of studyArr.slice(1, idxObj[STUDY_DESIGN_DESCRIPTORS])) {
            if (item.length > 1) {
                study[item[0]] = item[1];
            }
        }
        // populate data records into an array of objects
        const dataRecordsKeys = [DATA_RECORD_ACCESSION, DATA_RECORD_URI, DATA_REPOSITORY], dataRecordsArr = [], dataRecords =[];
        for (const prop of dataRecordsKeys) {
            dataRecordsArr.push(study[prop].split(DATA_RECORDS_SEPARATOR));
            // delete study[prop];
        }
        for (const dataRecordValues of zip(...dataRecordsArr)) {
            dataRecords.push(zipObject(dataRecordsKeys, dataRecordValues));
        }
        study[DATA_RECORDS] = dataRecords;
        // populate all the subsections into nested objects
        for (let i = 0; i < studyProperties.length; i++) {
            const property = [], propertyArr = zip(...studyArr.slice(idxObj[studyProperties[i]]+1, idxObj[studyProperties[i+1]]));
            for (let j = 1; j < propertyArr.length; j++) {
                property.push(zipObject(propertyArr[0], propertyArr[j]));
            }
            study[studyProperties[i]] = property;
        }
        this._investigation.studies.push(study);
    }

    /**
     * @method
     * @name addSamplesToStudy
     * @param{string} study file containing the list of samples
     * @param{Integer/String} study (name or index)
     * @description assing the samples, as read from the study file to the corresponding study object. The study can be specified either by name or
     *              by index in the investigation array (TODO implement study name support!!)
     */
    addSamplesToStudy(studyCSVString, studyRef = 0) {
        const study = this._investigation.studies[studyRef], samples = [],
            parsed = Papa.parse(studyCSVString);
        if (parsed.errors.lengt) {
            return;
        }
        const samplesArr = parsed.data;
        for (let i = 1; i < samplesArr.length; i++) {
            samples.push(zipObject(samplesArr[0], samplesArr[i]));
        }
        study.samples = samples;
    }


}
