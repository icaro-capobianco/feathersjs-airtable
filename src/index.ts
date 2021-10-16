import {
	ServiceMethods,
	Params as FeathersParams,
	Query,
	NullableId
} from '@feathersjs/feathers'
import Airtable from 'airtable'

export type InferRecordT<R> = R extends Airtable.Record<infer T> ? T : never

export const valueStr = (value: any) => {
	const type = typeof value
	switch (type) {
		case 'number':
			return value
		case 'boolean':
			return value ? 1 : 0
		default:
			return `'${mapQuery(value)}'`
	}
}

export const mapRecord = <R extends Airtable.Record<any>>(
	rec: R
): InferRecordT<R> & { id: string } => ({
	id: rec.id,
	...rec.fields
})

export const feathersQueryToSelectOptions = (query: Query) => {
	const selectOptions: Airtable.SelectOptions<any> = {}
	const { $limit, $sort, $select, $skip } = query

	// For simple equality queries
	const operators = Object.keys(query).filter(queryParam =>
		comparisonOperators.includes(queryParam)
	)

	const equalityConditionals = Object.keys(query).filter(
		queryParam => queryParam.charAt(0) !== '$'
	)

	if (operators.length > 0) {
		const filters = operators.map(key => {
			if (typeof query[key] === 'object') {
				return mapQuery({ [key]: query[key] })
			}
			return `{${key}} = ${valueStr(query[key])}`
		})

		if (filters.length > 1) {
			selectOptions.filterByFormula = `AND(${filters.join(',')})`
		} else {
			selectOptions.filterByFormula = filters.join('')
		}
	} else if (equalityConditionals.length > 0) {
		const filters = equalityConditionals.map(key => {
			if (typeof query[key] === 'object') {
				return mapQuery({ [key]: query[key] })
			}
			return `{${key}} = ${valueStr(query[key])}`
		})

		if (filters.length > 1) {
			selectOptions.filterByFormula = `AND(${filters.join(',')})`
		} else {
			selectOptions.filterByFormula = filters.join('')
		}
	}

	if ($sort) {
		selectOptions.sort = Object.keys($sort)
			.filter(key => key !== 'id')
			.map(key => {
				return {
					field: key,
					direction: $sort[key] > 0 ? 'asc' : 'desc'
				}
			})
	}

	if ($select) {
		selectOptions.fields = $select
	}

	if ($limit) {
		selectOptions.maxRecords = parseInt($limit, 10)
	}

	if ($skip) {
		selectOptions.maxRecords = (selectOptions.maxRecords ?? 0) + $skip
	}
	return selectOptions
}

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
]

export const mapQuery = (queryParams?: any): string => {
	const condtionals = []
	const $or = queryParams?.['$or']

	if (typeof queryParams !== 'object') {
		return queryParams
	}

	if ($or) {
		condtionals.push(
			`OR(${$or
				.filter(
					(queryParam: any) =>
						['$or', '$in'].includes(queryParam) ||
						typeof queryParam === 'object'
				)
				.map((queryParam: any) => {
					return Object.keys(queryParam).map(key => {
						if (typeof queryParam[key] === 'object') {
							return mapQuery(queryParam)
						} else {
							return `{${key}} = ${valueStr(
								mapQuery(queryParam[key])
							)}`
						}
					})
				})
				.join(',')})`
		)
	} else {
		// AND
		// @todo fix unecessary AND breaking query
		condtionals.push(
			`${Object.keys(queryParams)
				.filter(field => {
					return !comparisonOperators.includes(field)
				})
				.map(field => {
					if (typeof queryParams[field] === 'object') {
						const {
							$in,
							$nin,
							$lt,
							$lte,
							$gt,
							$gte,
							$ne
						} = queryParams[field]
						if ($in) {
							const $ors = $in.map((param: any) => {
								return { [field]: `${param}` }
							})
							return mapQuery({ $or: $ors })
						} else if ($nin) {
							const $ors = $nin.map((param: any) => {
								return { [field]: `${param}` }
							})
							return `NOT(${mapQuery({ $or: $ors })})`
						} else if ($lt) {
							return `{${field}} < ${$lt}`
						} else if ($lte) {
							return `{${field}} <= ${$lte}`
						} else if ($gt) {
							return `{${field}} > ${$gt}`
						} else if ($gte) {
							return `{${field}} >= ${$gte}`
						} else if ($ne) {
							return `{${field}} != ${$ne}`
						} else {
							throw Error(`Invalid Operator ${field}`)
						}
					}
					return `{${field}} = ${mapQuery(queryParams[field])}`
				})
				.join(',')}`
		)
	}

	if (condtionals.length > 1) {
		return condtionals.join(',')
	}
	return condtionals.join('')
}

export class AirtableService<
	D extends Airtable.FieldSet,
	T extends D & { id: string } = D & { id: string },
	Table extends Airtable.Table<T> = Airtable.Table<T>,
	Params extends FeathersParams = FeathersParams
> implements ServiceMethods<T> {
	table: Table

	constructor(
		table : Table
	) {
		this.table = table
	}

	async find(params: Params) {
		const query = feathersQueryToSelectOptions(params.query ?? {})
		return this.table
			.select(query)
			.all()
			.then(arr => arr.map(mapRecord))
	}

	async get(id: NullableId, params?: Params): Promise<T> {
		if (id) return this.table.find(id as string).then(mapRecord)
		return this.find(params ?? ({} as Params)).then(res => {
			const found = res?.[0]
			if (!found) throw 'Not found'
			return found
		})
	}

	async create<D extends Partial<T> | Partial<T>[]>(
		data: D
	): Promise<T | T[]> {
		if (Array.isArray(data)) {
			return this.table
				.create(data.map(fields => ({ fields })))
				.then(arr => arr.map(mapRecord))
		} else {
			return this.table.create(data as Partial<T>).then(mapRecord)
		}
	}

	async update(id: string | null, data: Partial<T>, params: Params) {
		if (id) {
			return this.table.update(id, data).then(mapRecord)
		} else {
			return this.table
				.select(params.query)
				.all()
				.then(arr =>
					this.table
						.update(
							arr.map(rec => ({
								id: rec.id,
								fields: data
							}))
						)
						.then(arr => arr.map(mapRecord))
				)
		}
	}
	async patch(id: string | null, data: Partial<T>, params: Params) {
		if (id) {
			return this.table.update(id, data).then(mapRecord)
		} else {
			return this.table
				.select(params.query)
				.all()
				.then(arr =>
					this.table
						.update(
							arr.map(rec => ({
								id: rec.id,
								fields: data
							}))
						)
						.then(arr => arr.map(mapRecord))
				)
		}
	}
	async remove(id: string | null, params: Params) {
		if (id) {
			return this.table.destroy(id).then(mapRecord)
		} else {
			return this.table
				.select(params.query)
				.all()
				.then(arr =>
					Promise.all(
						arr.map(rec =>
							this.table.destroy(rec.id).then(mapRecord)
						)
					)
				)
		}
	}
}

export default ( apiKey : string, options : Airtable.AirtableOptions = {} ) => {
	const airtable = new Airtable({ apiKey, ...options })
	const service = <T extends Airtable.FieldSet>( baseId : string, tableName : string ) => new AirtableService<T>( airtable.base(baseId).table(tableName) )
	return {
		airtable,
		service
	}
}
