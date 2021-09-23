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
const valueStr = (value) => {
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
const feathersQueryToSelectOptions = (query) => {
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
export default class AirtableService {
    constructor(apiKey, baseId, tableName, options) {
        const airtable = new Airtable(Object.assign({ apiKey }, options));
        this.table = airtable.base(baseId).table(tableName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBTUEsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBSy9CLE1BQU0sUUFBUSxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7SUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxLQUFLLENBQUE7SUFDekIsUUFBUSxJQUFJLEVBQUU7UUFDYixLQUFLLFFBQVE7WUFDWixPQUFPLEtBQUssQ0FBQTtRQUNiLEtBQUssU0FBUztZQUNiLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyQjtZQUNDLE9BQU8sSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQTtLQUM5QjtBQUNGLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxDQUN4QixHQUFNLEVBQzZCLEVBQUUsQ0FBQyxpQkFDdEMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQ1AsR0FBRyxDQUFDLE1BQU0sRUFDWixDQUFBO0FBRUYsTUFBTSw0QkFBNEIsR0FBRyxDQUFDLEtBQVksRUFBRSxFQUFFOztJQUNyRCxNQUFNLGFBQWEsR0FBZ0MsRUFBRSxDQUFBO0lBQ3JELE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxLQUFLLENBQUE7SUFFL0MsOEJBQThCO0lBQzlCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQ3hELG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FDeEMsQ0FBQTtJQUVELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQ3JELFVBQVUs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