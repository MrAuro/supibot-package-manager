module.exports = {
	Name: "youtubesearch",
	Aliases: ["ys"],
	Author: "supinic",
	Cooldown: 10000,
	Description: "Searches Youtube for video(s) with your query. Only a certain amount of uses are available daily.",
	Flags: ["mention","non-nullable","pipe"],
	Params: null,
	Whitelist_Response: null,
	Static_Data: (() => ({
		threshold: 2000,
		getClosestPacificMidnight: () => {
			const now = new sb.Date().discardTimeUnits("m", "s", "ms");
			const result = now.clone().discardTimeUnits("h").addHours(9);
	
			if (now.hours >= 9) {
				result.addDays(1);
			}
	
			return result;
		}
	})),
	Code: (async function youtubeSearch (context, ...args) {
		const { getClosestPacificMidnight, threshold } = this.staticData;
		const query = args.join(" ");

		if (!query) {
			return {
				success: false,
				reply: `No query provided!`,
				cooldown: 5000
			};
		}

		let searchAmountToday = await this.getCacheData("search-amount-today");
		let cacheRecordExists = true;
		if (!searchAmountToday) {
			cacheRecordExists = false;
			searchAmountToday = 0;
		}

		searchAmountToday++;

		if (searchAmountToday >= threshold) {
			const when = sb.Utils.timeDelta(getClosestPacificMidnight());
			return {
				success: false,
				reply: `No more YouTube searches available today! Reset happens at midnight Pacific Time, which is ${when}.`
			};
		}
	
		const track = await sb.Utils.searchYoutube(
			query,
			sb.Config.get("API_GOOGLE_YOUTUBE"),
			{ single: true }
		);

		if (cacheRecordExists) {
			await this.setCacheData("search-amount-today", searchAmountToday, {
				keepTTL: true
			});
		}
		else {
			await this.setCacheData("search-amount-today", searchAmountToday, {
				expiresAt: getClosestPacificMidnight()
			});
		}
		
		if (!track) {
			return {
				success: false,
				reply: "No videos found for that query!",
				cooldown: {
					length: this.Cooldown,
					user: context.user.ID,
					channel: null,
					platform: null
				}
			};
		}
		else {
			return {
				reply: `https://youtu.be/${track.ID}`,
				cooldown: {
				length: this.Cooldown,
					user: context.user.ID,
					channel: null,
					platform: null
				}
			};
		}
	}),
	Dynamic_Description: null
};