import { ServiceMethods, Params as FeathersParams, NullableId } from '@feathersjs/feathers';
import Airtable from 'airtable';
import { QueryParams as AirtableQueryParams } from 'airtable/lib/query_params';
declare type InferRecordT<R> = R extends Airtable.Record<infer T> ? T : never;
export declare const mapRecord: <R extends Airtable.Record<any>>(rec: R) => InferRecordT<R> & {
    id: string;
};
export declare const comparisonOperators: string[];
export declare const mapQuery: (queryParams?: any) => string;
export default class AirtableService<D extends Airtable.FieldSet, T extends D & {
    id: string;
} = D & {
    id: string;
}, Table extends Airtable.Table<T> = Airtable.Table<T>, QueryParams extends AirtableQueryParams<T> = AirtableQueryParams<T>, Params extends FeathersParams = FeathersParams> implements ServiceMethods<T> {
    table: Table;
    constructor(apiKey: string, baseId: string, tableName: string, options?: Airtable.AirtableOptions);
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
export {};
