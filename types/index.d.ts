import { ServiceMethods, Params as FeathersParams, Query, NullableId } from '@feathersjs/feathers';
import Airtable from 'airtable';
export declare type InferRecordT<R> = R extends Airtable.Record<infer T> ? T : never;
export declare const valueStr: (value: any) => any;
export declare const mapRecord: <R extends Airtable.Record<any>>(rec: R) => InferRecordT<R> & {
    id: string;
};
export declare const feathersQueryToSelectOptions: (query: Query) => Airtable.SelectOptions<any>;
export declare const comparisonOperators: string[];
export declare const mapQuery: (queryParams?: any) => string;
export declare class AirtableService<D extends Airtable.FieldSet, T extends D & {
    id: string;
} = D & {
    id: string;
}, Table extends Airtable.Table<T> = Airtable.Table<T>, Params extends FeathersParams = FeathersParams> implements ServiceMethods<T> {
    table: Table;
    constructor(table: Table);
    find(params: Params): Promise<(T & {
        id: string;
    })[]>;
    get(id: NullableId, params?: Params): Promise<T>;
    create<D extends Partial<T> | Partial<T>[]>(data: D): Promise<T | T[]>;
    update(id: string | null, data: Partial<T>, params: Params): Promise<(T & {
        id: string;
    }) | (T & {
        id: string;
    })[]>;
    patch(id: string | null, data: Partial<T>, params: Params): Promise<(T & {
        id: string;
    }) | (T & {
        id: string;
    })[]>;
    remove(id: string | null, params: Params): Promise<(T & {
        id: string;
    }) | (T & {
        id: string;
    })[]>;
}
declare const _default: (apiKey: string, options?: Airtable.AirtableOptions) => {
    airtable: Airtable;
    service: <T extends import("airtable/lib/field_set").FieldSet>(baseId: string, tableName: string) => AirtableService<T, T & {
        id: string;
    }, Airtable.Table<T & {
        id: string;
    }>, FeathersParams>;
};
export default _default;
