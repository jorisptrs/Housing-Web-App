import { SelectQueryBuilder } from "typeorm";
import { Min, Max, IsDefined } from "class-validator";
import { Request, Response } from "express";
import { Property } from "api-models/property";

export interface IQueryHelper<T> {
    /**
     * This is used for e.g. filtering, sorting, and paging on various API pages.
     * @param query 
     */
    apply(query: SelectQueryBuilder<T>): SelectQueryBuilder<T>;
}

/**
 * A query implementation supporting paging
 */
export class Paging<T> implements IQueryHelper<T> {
    @Min(1) @Max(100) @IsDefined()
    limit: number;
    offset: number = 0;

    /**
     * Applies the filters to a typeorm query
     * @param query
     * @returns query modified input query
     */
    public apply(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
        if (!this.limit) this.limit = 100; // default
        if (!this.offset) this.offset = 0;
        return query.skip(this.offset).take(this.limit);
    }
}

/**
 * Sends a response in json or csv depending on headers
 * @param res response to modify
 * @param type type of content
 * @param content content
 */
export async function sendCustom(res: Response, type: String, content: Object): Promise<void> {
    if (type == 'text/csv') {
        var jsonexport = require('jsonexport');
        jsonexport([content],function(err, csv) {
            if(err) return console.log(err);
            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);
        });
    } else {
        res.setHeader('content-type', 'application/json');
        res.json(content);
    }
}

/**
 * Converts csv to json if needed
 * @param req express request
 * @returns json formatted input
 */
export async function typeContent(req: Request | Request<{ propertyID: string }, {}, Property>): Promise<Object> {
    if (req.is('text/csv')) {
        var content = {}
        var split = req.body.toString().split('\n');
        var keys = split[0].split(',');
        var values = split[1].split(',');
        for (var i = 0; i<keys.length; i++) {
            console.log(keys[i])
            console.log(values[i])
            var unrolled = keys[i].split('.');
            if (unrolled.length == 1) {
                if (values[i] == 'true') content[unrolled[0]] = true;
                if (values[i] == 'false') content[unrolled[0]] = false;
                else content[unrolled[0]] = values[i];
                console.log(content[unrolled[0]])
            }
            else if (unrolled.length == 2) {
                if (!content[unrolled[0]]) content[unrolled[0]] = {};
                if (values[i] == 'true') content[unrolled[0]][unrolled[1]] = true;
                if (values[i] == 'false') content[unrolled[0]][unrolled[1]] = false;
                else content[unrolled[0]][unrolled[1]] = values[i];
            }
        }
        return content;
    } else {
        return req.body;
    }
}
