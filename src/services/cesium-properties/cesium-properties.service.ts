import { Injectable } from '@angular/core';
import { JsonMapper } from '../json-mapper/json-mapper.service';
import { Parse } from 'angular2parse';
import { ComputationCache } from '../computation-cache/computation-cache.service';

@Injectable()
export class CesiumProperties {
	private _assignersCache: Map<string, Function> = new Map<string, Function>();
	private _evaluatorsCache: Map<string, Function> = new Map<string, Function>();

	constructor(private _parser: Parse,
	            private _jsonMapper: JsonMapper) {
	}

	_compile(expression: string): Function {
		const cesiumDesc = {};
		const propsMap = new Map<string, any>();

		const resultMap = this._jsonMapper.map(expression);

		resultMap.forEach((resultExpression, prop) => propsMap.set(prop, {
			expression: resultExpression,
			get: this._parser.eval(resultExpression)
		}));

		const fnBody = 'const cesiumDesc={};for (let [propName, cesiumProp] of propsMap)cesiumDesc[propName ? ' +
			'propName : \'undefined\'] = cache.get(cesiumProp.expression.toString(), ' +
			'()=>propsMap.get(propName).get(context));return cesiumDesc;';
		const getFn = new Function('propsMap', 'cache', 'context', fnBody);

		return function evaluateCesiumProps(cache: ComputationCache, context: Object): any {
			return getFn(propsMap, cache, context);
		};
	}

	_build(expression: string): Function {
		let fnBody = ``;
		const resultMap = this._jsonMapper.map(expression);

		resultMap.forEach((value, prop) => fnBody += `dst['${prop}'] = src['${prop}'];`);

		fnBody += `return dst;`;
		const assignFn = new Function('dst', 'src', `${fnBody}`);

		return function assignCesiumProps(oldVal: any, newVal: any) {
			return assignFn(oldVal, newVal);
		};
	}

	createEvaluator(expression: string): Function {
		if (this._evaluatorsCache.has(expression)) {
			return this._evaluatorsCache.get(expression);
		}

		const evaluatorFn = this._compile(expression);
		this._evaluatorsCache.set(expression, evaluatorFn);

		return evaluatorFn;
	}

	createAssigner(expression: string): Function {
		if (this._assignersCache.has(expression)) {
			return this._assignersCache.get(expression);
		}

		const assignFn = this._build(expression);
		this._assignersCache.set(expression, assignFn);

		return assignFn;
	}

	stringifyExpression(expression: string) {
		if (expression[0] === '\'' && expression[expression.length - 1] === '\'') {
			// expression = expression.substring(0, expression.length-1);
			return `\`${expression}\``;
		}
		else {
			return `'${expression}'`;
		}
	}
}