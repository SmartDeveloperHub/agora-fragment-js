/*

    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      This file is part of the Smart Developer Hub Project:
        http://www.smartdeveloperhub.org/
      Center for Open Middleware
            http://www.centeropenmiddleware.com/
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      Copyright (C) 2015 Center for Open Middleware.
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at
                http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
     limitations under the License.
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
*/

'use strict';

var config = require('./config.json');
var request = require("request");
var syncRequest = require('sync-request');
var rdfstore = require('rdfstore');
// var sparql_parser = require('sparqljs').Parser;

var generate_error = function generate_error (c) {
    return {
        "status": "ERROR",
        "component": c
    };
};

exports.get_fragment = function get_fragment (gp, callback) {
    var http_path = config.services.fragmenter.url + ":" +
        config.services.fragmenter.port + config.services.fragmenter.path +
        config.services.fragmenter.query_param + '{';
    var gpe = '';
    if (typeof gp === 'string') {
        gpe += gp;
    }
    else if (Array.isArray(gp)) {
        for (var i = 0; i < gp.length; i++) {
            gpe += gp[i] + ". ";
        }
    }
    else {
        throw new Error("(get_fragment) gp param error");
    }
    http_path += encodeURIComponent(gpe) + '}';
    try {
        request(http_path, function (error, response, body) {
            if (error) {
                // TODO
                callback(error);
            } else {
                if (response.statusCode == 200) {
                    var res = {
                        "status": "OK",
                        "fragment": body.toString('utf-8')
                    };
                    callback(res);
                } else {
                    // TODO
                    callback(response.statusCode);
                }
            }
        });
    }
    catch (err) {
        throw new Error("(get_fragment) GET: " + http_path);
    }
};

/* var get_patterns_from_query = function get_patterns_from_query (query) {
 try {
 var parsed = new sparql_parser().parse(query);
 var bgps = parsed.where;
 var patterns = [];
 for (var i = 0; i < bgps.length; i++) {
 if (bgps[i].type === 'bgp') {
 for (var j = 0; j < bgps[i].triples.length; j++) {
 var t = '';
 if (bgps[i].triples[j].subject.indexOf("http") >= 0) {
 t += '<' + bgps[i].triples[j].subject + '> ';
 }
 else {
 t += bgps[i].triples[j].subject + ' ';
 }
 if (bgps[i].triples[j].predicate.indexOf("http") >= 0) {
 t += '<' + bgps[i].triples[j].predicate + '> ';
 }
 else {
 t += bgps[i].triples[j].predicate + ' ';
 }
 if (bgps[i].triples[j].object.indexOf("http") >= 0) {
 t += '<' + bgps[i].triples[j].object + '>';
 }
 else {
 t += bgps[i].triples[j].object;
 }
 patterns.push(t);
 }
 }
 }
 return {
 "status": "OK",
 "patterns": patterns
 }
 }
 catch (err) {
 return generate_error("SPARQL Parse");
 }
 };*/

exports.get_results_from_fragment = function get_results_from_fragment(fg, q, callback) {
    rdfstore.create(function(err, store) {
        if(err) {
            throw new Error("(get_results_from_fragment)create: " + err);
        }
        else {
            // Cuando no hay conexion con la plataforma, este load peta sin poder ser capturado ni nada...
            store.load(config.headers.Accept, fg, function (err, results) {
                if (err) {
                    throw new Error("(get_results_from_fragment)load: " + err);
                }
                else {
                    store.execute(q, function (err, results) {
                        if (err) {
                            throw new Error("(get_results_from_fragment)execute: " + err);
                        }
                        else {
                            callback({
                                "status": "OK",
                                "results": results
                            });
                        }
                    });
                }
            });
        }
    });
};

// module.exports.get_results_from_query = function get_results_from_query(query, callback) {
/*var get_results_from_query = function get_results_from_query(query, callback) {
 var p = get_patterns_from_query(query);
 if (p.status === "ERROR") {
 callback(p);
 }
 else {
 var fg = get_fragment(p.patterns);
 get_results_from_fragment(fg, query, function(e) {
 callback(e);
 });
 }
 };*/
