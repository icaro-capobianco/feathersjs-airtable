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
exports.AirtableService = exports.mapQuery = exports.comparisonOperators = exports.feathersQueryToSelectOptions = exports.mapRecord = exports.valueStr = void 0;
var airtable_1 = __importDefault(require("airtable"));
var valueStr = function (value) {
    var type = typeof value;
    switch (type) {
        case 'number':
            return value;
        case 'boolean':
            return value ? 1 : 0;
        default:
            return "'" + (0, exports.mapQuery)(value) + "'";
    }
};
exports.valueStr = valueStr;
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
                return (0, exports.mapQuery)((_a = {}, _a[key] = query[key], _a));
            }
            return "{" + key + "} = " + (0, exports.valueStr)(query[key]);
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
                return (0, exports.mapQuery)((_a = {}, _a[key] = query[key], _a));
            }
            return "{" + key + "} = " + (0, exports.valueStr)(query[key]);
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
exports.feathersQueryToSelectOptions = feathersQueryToSelectOptions;
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
                    return (0, exports.mapQuery)(queryParam);
                }
                else {
                    return "{" + key + "} = " + (0, exports.valueStr)((0, exports.mapQuery)(queryParam[key]));
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
                    return (0, exports.mapQuery)({ $or: $ors });
                }
                else if ($nin) {
                    var $ors = $nin.map(function (param) {
                        var _a;
                        return _a = {}, _a[field] = "" + param, _a;
                    });
                    return "NOT(" + (0, exports.mapQuery)({ $or: $ors }) + ")";
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
            return "{" + field + "} = " + (0, exports.mapQuery)(queryParams[field]);
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
    function AirtableService(table) {
        this.id = 'id';
        this.table = table;
    }
    AirtableService.prototype.find = function (params) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_b) {
                query = (0, exports.feathersQueryToSelectOptions)((_a = params.query) !== null && _a !== void 0 ? _a : {});
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
exports.AirtableService = AirtableService;
exports.default = (function (apiKey, options) {
    if (options === void 0) { options = {}; }
    var airtable = new airtable_1.default(__assign({ apiKey: apiKey }, options));
    var service = function (baseId, tableName) { return new AirtableService(airtable.base(baseId).table(tableName)); };
    return {
        airtable: airtable,
        service: service
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNQSxzREFBK0I7QUFJeEIsSUFBTSxRQUFRLEdBQUcsVUFBQyxLQUFVO0lBQ2xDLElBQU0sSUFBSSxHQUFHLE9BQU8sS0FBSyxDQUFBO0lBQ3pCLFFBQVEsSUFBSSxFQUFFO1FBQ2IsS0FBSyxRQUFRO1lBQ1osT0FBTyxLQUFLLENBQUE7UUFDYixLQUFLLFNBQVM7WUFDYixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckI7WUFDQyxPQUFPLE1BQUksSUFBQSxnQkFBUSxFQUFDLEtBQUssQ0FBQyxNQUFHLENBQUE7S0FDOUI7QUFDRixDQUFDLENBQUE7QUFWWSxRQUFBLFFBQVEsWUFVcEI7QUFFTSxJQUFNLFNBQVMsR0FBRyxVQUN4QixHQUFNLElBQ2dDLE9BQUEsWUFDdEMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQ1AsR0FBRyxDQUFDLE1BQU0sRUFDWixFQUhxQyxDQUdyQyxDQUFBO0FBTFcsUUFBQSxTQUFTLGFBS3BCO0FBRUssSUFBTSw0QkFBNEIsR0FBRyxVQUFDLEtBQVk7O0lBQ3hELElBQU0sYUFBYSxHQUFnQyxFQUFFLENBQUE7SUFDN0MsSUFBQSxNQUFNLEdBQTRCLEtBQUssT0FBakMsRUFBRSxLQUFLLEdBQXFCLEtBQUssTUFBMUIsRUFBRSxPQUFPLEdBQVksS0FBSyxRQUFqQixFQUFFLEtBQUssR0FBSyxLQUFLLE1BQVYsQ0FBVTtJQUUvQyw4QkFBOEI7SUFDOUIsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxVQUFVO1FBQ3JELE9BQUEsMkJBQW1CLENBQUMsUUFBUSxDQUFD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