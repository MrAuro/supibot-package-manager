module.exports = {
	Name: "knowyourmeme",
	Aliases: ["kym"],
	Author: "supinic",
	Cooldown: 30000,
	Description: "Gets a smol description of a meme from KnowYourMeme, it's just the summary.",
	Flags: ["mention","non-nullable","pipe"],
	Params: null,
	Whitelist_Response: null,
	Static_Data: null,
	Code: (async function knowYourMeme (context, ...args) {
		if (args.length === 0) {
			return {
				reply: "No search term provided!"
			};
		}
	
		const searchHTML = await sb.Got("FakeAgent", {
			url: "https://knowyourmeme.com/search",
			searchParams: new sb.URLParams().set("q", args.join(" ")).toString(),
			responseType: "text"
		}).text();
	
		const $search = sb.Utils.cheerio(searchHTML);	
		const firstLink = $search(".entry_list a").first().attr("href");
		if (!firstLink) {
			return {
				reply: "No result found for given search term!"
			};
		}
		
		const detailHTML = await sb.Got("FakeAgent", {
			prefixUrl: "https://knowyourmeme.com",
			url: firstLink,
			responseType: "text"
		}).text();
	
		const $detail = sb.Utils.cheerio(detailHTML);
		const summary = $detail("#entry_body h2#about").first().next().text();
		if (!summary) {
			return {
				reply: "No summary found for given meme!"
			};
		}
	
		const link = `https://knowyourmeme.com${firstLink}`;
		return {
			reply: `${link} ${summary}`
		};
	}),
	Dynamic_Description: null
};