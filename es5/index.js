"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapQuery = exports.comparisonOperators = exports.mapRecord = void 0;
var airtable_1 = __importDefault(require("airtable"));
var valueStr = function (value) {
    var type = typeof value;
    switch (type) {
        case 'number':
            return value;
        case 'boolean':
            return value ? 1 : 0;
        default:
            return "'" + exports.mapQuery(value) + "'";
    }
};
var mapRecord = function (rec) { return (__assign({ id: rec.id }, rec.fields)); };
exports.mapRecord = mapRecord;
var feathersQueryToSelectOptions = function (query) {
    var _a;
    var selectOptions = {};
    var $limit = query.$limit, $sort = query.$sort, $select = query.$select, $skip = query.$skip;
    // For simple equality queries
    var operators = Object.keys(query).filter(function (queryParam) {
        return exports.comparisonOperators.includes(queryParam);
    });
    var equalityConditionals = Object.keys(query).filter(function (queryParam) { return queryParam.charAt(0) !== '$'; });
    if (operators.length > 0) {
        var filters = operators.map(function (key) {
            var _a;
            if (typeof query[key] === 'object') {
                return exports.mapQuery((_a = {}, _a[key] = query[key], _a));
            }
            return "{" + key + "} = " + valueStr(query[key]);
        });
        if (filters.length > 1) {
            selectOptions.filterByFormula = "AND(" + filters.join(',') + ")";
        }
        else {
            selectOptions.filterByFormula = filters.join('');
        }
    }
    else if (equalityConditionals.length > 0) {
        var filters = equalityConditionals.map(function (key) {
            var _a;
            if (typeof query[key] === 'object') {
                return exports.mapQuery((_a = {}, _a[key] = query[key], _a));
            }
            return "{" + key + "} = " + valueStr(query[key]);
        });
        if (filters.length > 1) {
            selectOptions.filterByFormula = "AND(" + filters.join(',') + ")";
        }
        else {
            selectOptions.filterByFormula = filters.join('');
        }
    }
    if ($sort) {
        selectOptions.sort = Object.keys($sort)
            .filter(function (key) { return key !== 'id'; })
            .map(function (key) {
            return {
                field: key,
                direction: $sort[key] > 0 ? 'asc' : 'desc'
            };
        });
    }
    if ($select) {
        selectOptions.fields = $select;
    }
    if ($limit) {
        selectOptions.maxRecords = parseInt($limit, 10);
    }
    if ($skip) {
        selectOptions.maxRecords = ((_a = selectOptions.maxRecords) !== null && _a !== void 0 ? _a : 0) + $skip;
    }
    return selectOptions;
};
exports.comparisonOperators = [
    '$ne',
    '$in',
    '$lt',
    '$lte',
    '$gt',
    '$gte',
    '$nin',
    '$in',
    '$or'
];
var mapQuery = function (queryParams) {
    var condtionals = [];
    var $or = queryParams === null || queryParams === void 0 ? void 0 : queryParams['$or'];
    if (typeof queryParams !== 'object') {
        return queryParams;
    }
    if ($or) {
        condtionals.push("OR(" + $or
            .filter(function (queryParam) {
            return ['$or', '$in'].includes(queryParam) ||
                typeof queryParam === 'object';
        })
            .map(function (queryParam) {
            return Object.keys(queryParam).map(function (key) {
                if (typeof queryParam[key] === 'object') {
                    return exports.mapQuery(queryParam);
                }
                else {
                    return "{" + key + "} = " + valueStr(exports.mapQuery(queryParam[key]));
                }
            });
        })
            .join(',') + ")");
    }
    else {
        // AND
        // @todo fix unecessary AND breaking query
        condtionals.push("" + Object.keys(queryParams)
            .filter(function (field) {
            return !exports.comparisonOperators.includes(field);
        })
            .map(function (field) {
            if (typeof queryParams[field] === 'object') {
                var _a = queryParams[field], $in = _a.$in, $nin = _a.$nin, $lt = _a.$lt, $lte = _a.$lte, $gt = _a.$gt, $gte = _a.$gte, $ne = _a.$ne;
                if ($in) {
                    var $ors = $in.map(function (param) {
                        var _a;
                        return _a = {}, _a[field] = "" + param, _a;
                    });
                    return exports.mapQuery({ $or: $ors });
                }
                else if ($nin) {
                    var $ors = $nin.map(function (param) {
                        var _a;
                        return _a = {}, _a[field] = "" + param, _a;
                    });
                    return "NOT(" + exports.mapQuery({ $or: $ors }) + ")";
                }
                else if ($lt) {
                    return "{" + field + "} < " + $lt;
                }
                else if ($lte) {
                    return "{" + field + "} <= " + $lte;
                }
                else if ($gt) {
                    return "{" + field + "} > " + $gt;
                }
                else if ($gte) {
                    return "{" + field + "} >= " + $gte;
                }
                else if ($ne) {
                    return "{" + field + "} != " + $ne;
                }
                else {
                    throw Error("Invalid Operator " + field);
                }
            }
            return "{" + field + "} = " + exports.mapQuery(queryParams[field]);
        })
            .join(','));
    }
    if (condtionals.length > 1) {
        return condtionals.join(',');
    }
    return condtionals.join('');
};
exports.mapQuery = mapQuery;
var AirtableService = /** @class */ (function () {
    function AirtableService(apiKey, baseId, tableName, options) {
        var airtable = new airtable_1.default(__assign({ apiKey: apiKey }, options));
        this.table = airtable.base(baseId).table(tableName);
    }
    AirtableService.prototype.find = function (params) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_b) {
                query = feathersQueryToSelectOptions((_a = params.query) !== null && _a !== void 0 ? _a : {});
                return [2 /*return*/, this.table
                        .select(query)
                        .all()
                        .then(function (arr) { return arr.map(exports.mapRecord); })];
            });
        });
    };
    AirtableService.prototype.get = function (id, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (id)
                    return [2 /*return*/, this.table.find(id).then(exports.mapRecord)];
                return [2 /*return*/, this.find(params !== null && params !== void 0 ? params : {}).then(function (res) {
                        var found = res === null || res === void 0 ? void 0 : res[0];
                        if (!found)
                            throw 'Not found';
                        return found;
                    })];
            });
        });
    };
    AirtableService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (Array.isArray(data)) {
                    return [2 /*return*/, this.table
                            .create(data.map(function (fields) { return ({ fields: fields }); }))
                            .then(function (arr) { return arr.map(exports.mapRecord); })];
                }
                else {
                    return [2 /*return*/, this.table.create(data).then(exports.mapRecord)];
                }
                return [2 /*return*/];
            });
        });
    };
    AirtableService.prototype.update = function (id, data, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (id) {
                    return [2 /*return*/, this.table.update(id, data).then(exports.mapRecord)];
                }
                else {
                    return [2 /*return*/, this.table
                            .select(params.query)
                            .all()
                            .then(function (arr) {
                            return _this.table
                                .update(arr.map(function (rec) { return ({
                                id: rec.id,
                                fields: data
                            }); }))
                                .then(function (arr) { return arr.map(exports.mapRecord); });
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    AirtableService.prototype.patch = function (id, data, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (id) {
                    return [2 /*return*/, this.table.update(id, data).then(exports.mapRecord)];
                }
                else {
                    return [2 /*return*/, this.table
                            .select(params.query)
                            .all()
                            .then(function (arr) {
                            return _this.table
                                .update(arr.map(function (rec) { return ({
                                id: rec.id,
                                fields: data
                            }); }))
                                .then(function (arr) { return arr.map(exports.mapRecord); });
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    AirtableService.prototype.remove = function (id, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (id) {
                    return [2 /*return*/, this.table.destroy(id).then(exports.mapRecord)];
                }
                else {
                    return [2 /*return*/, this.table
                            .select(params.query)
                            .all()
                            .then(function (arr) {
                            return Promise.all(arr.map(function (rec) {
                                return _this.table.destroy(rec.id).then(exports.mapRecord);
                            }));
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    return AirtableService;
}());
exports.default = AirtableService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNQSxzREFBK0I7QUFLL0IsSUFBTSxRQUFRLEdBQUcsVUFBQyxLQUFVO0lBQzNCLElBQU0sSUFBSSxHQUFHLE9BQU8sS0FBSyxDQUFBO0lBQ3pCLFFBQVEsSUFBSSxFQUFFO1FBQ2IsS0FBSyxRQUFRO1lBQ1osT0FBTyxLQUFLLENBQUE7UUFDYixLQUFLLFNBQVM7WUFDYixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckI7WUFDQyxPQUFPLE1BQUksZ0JBQVEsQ0FBQyxLQUFLLENBQUMsTUFBRyxDQUFBO0tBQzlCO0FBQ0YsQ0FBQyxDQUFBO0FBRU0sSUFBTSxTQUFTLEdBQUcsVUFDeEIsR0FBTSxJQUNnQyxPQUFBLFlBQ3RDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUNQLEdBQUcsQ0FBQyxNQUFNLEVBQ1osRUFIcUMsQ0FHckMsQ0FBQTtBQUxXLFFBQUEsU0FBUyxhQUtwQjtBQUVGLElBQU0sNEJBQTRCLEdBQUcsVUFBQyxLQUFZOztJQUNqRCxJQUFNLGFBQWEsR0FBZ0MsRUFBRSxDQUFBO0lBQzdDLElBQUEsTUFBTSxHQUE0QixLQUFLLE9BQWpDLEVBQUUsS0FBSyxHQUFxQixLQUFLLE1BQTFCLEVBQUUsT0FBTyxHQUFZLEtBQUssUUFBakIsRUFBRSxLQUFLLEdBQUssS0FBSyxNQUFWLENBQVU7SUFFL0MsOEJBQThCO0lBQzlCLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsVUFBVTtRQUNyRCxPQUFBLDJCQUFtQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7SUFBeEMsQ0FBd0MsQ0FD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