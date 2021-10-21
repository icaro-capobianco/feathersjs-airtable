var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Airtable from 'airtable';
export const valueStr = (value) => {
    const type = typeof value;
    switch (type) {
        case 'number':
            return value;
        case 'boolean':
            return value ? 1 : 0;
        default:
            return `'${mapQuery(value)}'`;
    }
};
export const mapRecord = (rec) => (Object.assign({ id: rec.id }, rec.fields));
export const feathersQueryToSelectOptions = (query) => {
    var _a;
    const selectOptions = {};
    const { $limit, $sort, $select, $skip } = query;
    // For simple equality queries
    const operators = Object.keys(query).filter(queryParam => comparisonOperators.includes(queryParam));
    const equalityConditionals = Object.keys(query).filter(queryParam => queryParam.charAt(0) !== '$');
    if (operators.length > 0) {
        const filters = operators.map(key => {
            if (typeof query[key] === 'object') {
                return mapQuery({ [key]: query[key] });
            }
            return `{${key}} = ${valueStr(query[key])}`;
        });
        if (filters.length > 1) {
            selectOptions.filterByFormula = `AND(${filters.join(',')})`;
        }
        else {
            selectOptions.filterByFormula = filters.join('');
        }
    }
    else if (equalityConditionals.length > 0) {
        const filters = equalityConditionals.map(key => {
            if (typeof query[key] === 'object') {
                return mapQuery({ [key]: query[key] });
            }
            return `{${key}} = ${valueStr(query[key])}`;
        });
        if (filters.length > 1) {
            selectOptions.filterByFormula = `AND(${filters.join(',')})`;
        }
        else {
            selectOptions.filterByFormula = filters.join('');
        }
    }
    if ($sort) {
        selectOptions.sort = Object.keys($sort)
            .filter(key => key !== 'id')
            .map(key => {
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
export const comparisonOperators = [
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
export const mapQuery = (queryParams) => {
    const condtionals = [];
    const $or = queryParams === null || queryParams === void 0 ? void 0 : queryParams['$or'];
    if (typeof queryParams !== 'object') {
        return queryParams;
    }
    if ($or) {
        condtionals.push(`OR(${$or
            .filter((queryParam) => ['$or', '$in'].includes(queryParam) ||
            typeof queryParam === 'object')
            .map((queryParam) => {
            return Object.keys(queryParam).map(key => {
                if (typeof queryParam[key] === 'object') {
                    return mapQuery(queryParam);
                }
                else {
                    return `{${key}} = ${valueStr(mapQuery(queryParam[key]))}`;
                }
            });
        })
            .join(',')})`);
    }
    else {
        // AND
        // @todo fix unecessary AND breaking query
        condtionals.push(`${Object.keys(queryParams)
            .filter(field => {
            return !comparisonOperators.includes(field);
        })
            .map(field => {
            if (typeof queryParams[field] === 'object') {
                const { $in, $nin, $lt, $lte, $gt, $gte, $ne } = queryParams[field];
                if ($in) {
                    const $ors = $in.map((param) => {
                        return { [field]: `${param}` };
                    });
                    return mapQuery({ $or: $ors });
                }
                else if ($nin) {
                    const $ors = $nin.map((param) => {
                        return { [field]: `${param}` };
                    });
                    return `NOT(${mapQuery({ $or: $ors })})`;
                }
                else if ($lt) {
                    return `{${field}} < ${$lt}`;
                }
                else if ($lte) {
                    return `{${field}} <= ${$lte}`;
                }
                else if ($gt) {
                    return `{${field}} > ${$gt}`;
                }
                else if ($gte) {
                    return `{${field}} >= ${$gte}`;
                }
                else if ($ne) {
                    return `{${field}} != ${$ne}`;
                }
                else {
                    throw Error(`Invalid Operator ${field}`);
                }
            }
            return `{${field}} = ${mapQuery(queryParams[field])}`;
        })
            .join(',')}`);
    }
    if (condtionals.length > 1) {
        return condtionals.join(',');
    }
    return condtionals.join('');
};
export class AirtableService {
    constructor(table) {
        this.id = 'id';
        this.table = table;
    }
    find(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const query = feathersQueryToSelectOptions((_a = params.query) !== null && _a !== void 0 ? _a : {});
            return this.table
                .select(query)
                .all()
                .then(arr => arr.map(mapRecord));
        });
    }
    get(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id)
                return this.table.find(id).then(mapRecord);
            return this.find(params !== null && params !== void 0 ? params : {}).then(res => {
                const found = res === null || res === void 0 ? void 0 : res[0];
                if (!found)
                    throw 'Not found';
                return found;
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(data)) {
                return this.table
                    .create(data.map(fields => ({ fields })))
                    .then(arr => arr.map(mapRecord));
            }
            else {
                return this.table.create(data).then(mapRecord);
            }
        });
    }
    update(id, data, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id) {
                return this.table.update(id, data).then(mapRecord);
            }
            else {
                return this.table
                    .select(params.query)
                    .all()
                    .then(arr => this.table
                    .update(arr.map(rec => ({
                    id: rec.id,
                    fields: data
                })))
                    .then(arr => arr.map(mapRecord)));
            }
        });
    }
    patch(id, data, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id) {
                return this.table.update(id, data).then(mapRecord);
            }
            else {
                return this.table
                    .select(params.query)
                    .all()
                    .then(arr => this.table
                    .update(arr.map(rec => ({
                    id: rec.id,
                    fields: data
                })))
                    .then(arr => arr.map(mapRecord)));
            }
        });
    }
    remove(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id) {
                return this.table.destroy(id).then(mapRecord);
            }
            else {
                return this.table
                    .select(params.query)
                    .all()
                    .then(arr => Promise.all(arr.map(rec => this.table.destroy(rec.id).then(mapRecord))));
            }
        });
    }
}
export default (apiKey, options = {}) => {
    const airtable = new Airtable(Object.assign({ apiKey }, options));
    const service = (baseId, tableName) => new AirtableService(airtable.base(baseId).table(tableName));
    return {
        airtable,
        service
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBTUEsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBSS9CLE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQVUsRUFBRSxFQUFFO0lBQ3RDLE1BQU0sSUFBSSxHQUFHLE9BQU8sS0FBSyxDQUFBO0lBQ3pCLFFBQVEsSUFBSSxFQUFFO1FBQ2IsS0FBSyxRQUFRO1lBQ1osT0FBTyxLQUFLLENBQUE7UUFDYixLQUFLLFNBQVM7WUFDYixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckI7WUFDQyxPQUFPLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUE7S0FDOUI7QUFDRixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsQ0FDeEIsR0FBTSxFQUM2QixFQUFFLENBQUMsaUJBQ3RDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUNQLEdBQUcsQ0FBQyxNQUFNLEVBQ1osQ0FBQTtBQUVGLE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUU7O0lBQzVELE1BQU0sYUFBYSxHQUFnQyxFQUFFLENBQUE7SUFDckQsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEtBQUssQ0FBQTtJQUUvQyw4QkFBOEI7SUFDOUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FDeEQsbUJBQW1CLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUN4QyxDQUFBO0lBRUQsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxD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