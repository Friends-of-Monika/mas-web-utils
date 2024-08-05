import { Octokit } from "octokit";
import { tokenize, type SimpleToken } from "./python";

const octokit = new Octokit();
const repoParam = {
	owner: "Monika-After-Story",
	repo: "MonikaModDev",
	ref: "master"
};

const regexpLookupPath = "Monika After Story/game/script-story-events.rpy";

export async function getNameRegexps() {
	const res = await octokit.rest.repos.getContent({
		...repoParam,
		path: regexpLookupPath,
		mediaType: { format: "raw" }
	});

	const script = res.data.toString();
	const tokens = await tokenize(script);

	const badNicknames = getListStringContents(tokens, "mas_bad_nickname_list");
	const goodNicknamesBase = getListStringContents(tokens, "mas_good_nickname_list_base");
	const goodNicknamesPlayerMod = getListStringContents(tokens, "mas_good_nickname_list_player_modifiers");
	const goodNicknamesMonikaMod = getListStringContents(tokens, "mas_good_nickname_list_monika_modifiers");
	const awkwardNicknames = getListStringContents(tokens, "mas_awkward_nickname_list");

	const toRegExp = (it: string) => new RegExp(it, "i");
	const bad = [...badNicknames.map(toRegExp), /badname/i];
	const playerGood = [...goodNicknamesBase, ...goodNicknamesPlayerMod].map(toRegExp);
	const monikaGood = [...goodNicknamesBase, ...goodNicknamesMonikaMod].map(toRegExp);
	const awkward = awkwardNicknames.map(toRegExp);
	return { bad, awkward, playerGood, monikaGood };
}

function getListStringContents(tokens: SimpleToken[], varName: string): string[] {
	const defIdx = tokens.findIndex((it) => it.type === 37 && it.token === varName);
	if (defIdx < 0) return [];
	const openIdx = tokens.slice(defIdx).findIndex((it) => it.type === 56);
	if (openIdx < 0) return [];
	const closeIdx = tokens.slice(defIdx).findIndex((it) => it.type === 57);
	if (closeIdx < 0) return [];
	// @prettier-ignore
	return tokens
		.slice(defIdx + openIdx, defIdx + openIdx + closeIdx)
		.filter((it) => it.type === 38)
		.map((it) =>
			"rb".includes(it.token.charAt(0))
				? it.token.substring(2, it.token.length - 1)
				: it.token.substring(1, it.token.length - 1)
		);
}

export function checkName(name: string, regExps: Record<string, RegExp[]>): [string, RegExp] | null {
	// @prettier-ignore
	const found = Object.entries(regExps)
		.map(([key, re]) => [key, re.find((it) => it.test(name))])
		.filter((it) => it[1]);
	if (found.length === 0) return null;
	return found[0] as [string, RegExp];
}
