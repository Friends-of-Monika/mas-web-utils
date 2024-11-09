import { Octokit } from "octokit";
import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
// @ts-expect-error because package is built with untyped JS
import { parse } from "json-source-map";
import { getCache, setCache } from "./localCache";

const octokit = new Octokit();
const repoParam = {
	owner: "Friends-of-Monika",
	repo: "MAS-Sprite-Schema",
	ref: "master"
};

const ajv = new Ajv({ allowUnionTypes: true, allErrors: true, allowMatchingProperties: true });
const schemaCache: Record<string, ValidateFunction<unknown>> = {};

type AcsTypeAll = 0 | 1 | 2;
type AcsType<AcsT extends AcsTypeAll> = AcsT extends 0 ? { type: AcsT; split: boolean } : { type: AcsT };

function getSchemaName(acs: AcsType<AcsTypeAll>): string {
	switch (acs.type) {
		case 0:
			return acs.split ? "acs-split.schema.json" : "acs.schema.json";
		case 1:
			return "hair.schema.json";
		case 2:
			return "clothes.schema.json";
	}
}

async function getCacheSchema(acs: AcsType<0 | 1 | 2>): Promise<ValidateFunction<unknown>> {
	const name = getSchemaName(acs);

	const hit = schemaCache[name];
	if (hit !== undefined) return hit;

	const json = await getSchemaText(name);
	const schema = ajv.compile(JSON.parse(json));
	schemaCache[name] = schema;
	return schema;
}

async function getSchemaText(name: string): Promise<string> {
	const cachedSchema = getCache<string>("schema_schemaText");
	if (cachedSchema != null) return cachedSchema;

	const res = await octokit.rest.repos.getContent({
		...repoParam,
		path: name,
		mediaType: { format: "raw" }
	});

	const text = res.data.toString();
	setCache("schema_schemaText", text, 3600e3);
	return text;
}

export async function validate(rawJson: string) {
	let json: unknown;
	try {
		json = JSON.parse(rawJson);
	} catch (e: unknown) {
		throw new JsonSyntaxError(e as SyntaxError);
	}

	if (json === null || typeof json !== "object" || !("type" in json))
		throw new TypeError(`JSON must have a root object and have "type" property`);
	if (!(typeof json.type === "number")) throw new TypeError(`JSON must have "type" property with number value`);
	if (![0, 1, 2].includes(json.type)) throw new TypeError(`JSON must have 0, 1 or 2 as "type" value`);

	// @ts-expect-error because above 'includes' check is sufficient but unnoticed by ts
	const type: AcsType<AcsTypeAll> = { type: json.type };
	if (json.type === 0) Object.assign(type, { split: "arm_split" in json });

	const validateSchema = await getCacheSchema(type);
	const passed = validateSchema(json);
	if (passed === true) return;
	throw new ValidationError(validateSchema.errors);
}

export function getJsonSourceMap(json: string): object {
	return parse(json);
}

export class JsonSyntaxError extends Error {
	private static readonly errorRe = /^JSON\.parse: (.*) at line (\d+) column (\d+)/g;
	private readonly _what: string;
	private readonly _where: [number, number];

	public constructor(error: SyntaxError) {
		super(error.message, { cause: error });
		const [message, line, column] = JsonSyntaxError.extractData(error.message);
		this._what = message;
		this._where = [line, column];
	}

	private static extractData(message: string): [string, number, number] {
		const search = this.errorRe.exec(message);
		this.errorRe.lastIndex = 0; // reset regex
		if (!search?.length) throw new TypeError(`failed to extract position from error message: ${message}`);
		return [search[1], +search[2] - 1, +search[3] - 1];
	}

	public get what(): string {
		return this._what;
	}

	public get where(): [number, number] {
		return this._where;
	}
}

export class ValidationError extends Error {
	private readonly _errors: ErrorObject[];

	public constructor(errors: ErrorObject[] | null | undefined) {
		super("JSON file violates the schema");
		this._errors = errors ?? [];
	}

	public get errors() {
		return this._errors;
	}
}
