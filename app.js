(function () {

	var SUBREDDIT_PATH = 'http://www.reddit.com/r/',
			REDDITS_PATH = 'http://www.reddit.com/subreddits/popular.json',
			CONFIRM_DELETE = 'Are you sure?',
			redditTemplate = null,
			listItemTemplate = null,
			$redditList = $('#redditList'),
			$watchList = $('#watchList'),
			after = '',

	addRedditsToListing = function (after) {
		var deferred = jQuery.Deferred(),
				url = after ? REDDITS_PATH + '?after=' + after : REDDITS_PATH

		console.log('loading', url)

		$.get(url, function (json) {
			var reddits = json.data.children

			reddits.forEach(function (reddit) {
				var details = reddit.data
				console.log(details)
				$redditList.append(listItemTemplate({value: details.display_name, text: details.url}))
			})
	
			deferred.resolve(json.data.after)
		})

		return deferred.promise()
	},
			
	addListButtonListener = function () {
		$('button.list-control').click(function (event) {
			var id = event.target.id,
					getFrom = id === 'add' ? 'remove' : 'add',
					listToAdd = {
						add: $watchList,
						remove: $redditList
					}

			listToAdd[getFrom].children().each(function (i, reddit) {
				if (reddit.selected) {
					listToAdd[id].append(reddit)
				}
			})

		})
	},

	addGetRedditsListener = function () {
		$('#getReddits').click(function () {
			if ($watchList.children().size() < 1) return;

			addReddits($watchList.children())
			$("#controls").slideUp()
			$("#show-controls").show()
			
		})
	},

	addReddits = function (reddits) {
		var posts = []

		reddits.each(function (i, reddit) {
			getRedditPosts(reddit.value).then(function (redditData) {
				$('body').append(redditTemplate({title: redditData.title, posts: redditData.posts}))
			})
			
		})
	},

	getRedditPosts = function(reddit) {
		var deferred = jQuery.Deferred()

		$.get(SUBREDDIT_PATH + reddit + '.json', function (json) {
			var postsData = json.data.children,
					posts = []

			postsData.forEach(function (post) {
				var details = post.data
				console.log(details)
				posts.push({
					url: details.url,
					permalink: details.permalink,
					title: details.title,
					score: details.score
				})
			})

			deferred.resolve({title: reddit, posts: posts})
		})

		return deferred.promise()
	},

	addShowControlsListener = function () {
		$("#show-controls").click(function () {
			$(this).hide()
			$("#controls").slideDown()
		})
	},

	addRemoveRedditsListener = function () {
		$('#removeReddits').click(function () {

			if ($watchList.children().size() < 1) return;

			if (confirm(CONFIRM_DELETE)) {
				$watchList.children().each(function (i, reddit) {
					$redditList.append(reddit)
				})

				$('.redditlist').remove()
			}
		})
	},

	getRedditString = function (string) {
		var ret = string.indexOf('/r/') === - 1 ? '/r/' + string : string
		return !/\/$/.test(ret) ? ret + '/' : ret
	},

	addRedditAddListener = function () {
		$('#add-reddit').keydown(function (event) {
			if (event.keyCode === 13) {
				var that = this
				getTemplate('listItem').then(function (template) {
					$watchList.append(template({value: that.value, text: getRedditString(that.value)}))
				})
			}	
		})
	},

	addRedditListScrollListener = function () {
		var scrollFinished = false

		$redditList.scroll(function (event) {
			scrollFinished = (this.scrollHeight - this.scrollTop) === this.clientHeight

			if (scrollFinished) {
				addRedditsToListing(after).then(function (afterUrl) {
					after = afterUrl
				})
			}

		})
	},

	getTemplate = function (template) {
		var deferred = jQuery.Deferred()

		$.get('templates/' + template + '.html', function (raw) {
			deferred.resolve(Handlebars.compile(raw))
		})

		return deferred.promise()
	},

	init = function () {
		getTemplate('listItem').then(function (template) {
			listItemTemplate = template

			addRedditsToListing().then(function (afterUrl) {
				after = afterUrl
				addRedditListScrollListener()
			})

		})
		
		addListButtonListener()
		addShowControlsListener()
		addRemoveRedditsListener()
		addRedditAddListener()

		getTemplate('reddit')
		.then(function (template) {
			console.log(template)
			redditTemplate = template
			addGetRedditsListener()
		})
	}

	init()

}())