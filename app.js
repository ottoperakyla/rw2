(function () {

	var SUBREDDIT_PATH = 'http://www.reddit.com/r/',
	REDDITS_PATH = 'http://www.reddit.com/subreddits/popular.json',
	CONFIRM_DELETE = 'Are you sure?',
	redditTemplate = null,
	listItemTemplate = null,
	$redditList = $('#redditList'),
	$watchList = $('#watchList'),
	after = '',
	loading = false,
	activeReddits = [],
	controlsShowing = true,

	updateRedditListing = function (after) {
		var deferred = jQuery.Deferred(),
		url = after ? REDDITS_PATH + '?after=' + after : REDDITS_PATH

		console.log('loading', url)

		$.get(url, function (json) {
			var reddits = json.data.children

			reddits.forEach(function (reddit) {
				var details = reddit.data
		//		console.log(details)
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
			addReddits($watchList.children())		
			toggleControls()	
		})
	},

	addReddits = function (reddits) {
		if ($watchList.children().size() < 1) return

			var posts = []

		reddits.each(function (i, reddit) {

			if (activeReddits.indexOf(reddit.value) === -1) {
				getRedditPosts(reddit.value).then(function (redditData) {
					activeReddits.push(redditData.title)

					$('body').append(redditTemplate({title: redditData.title, posts: redditData.posts}))
				})
			} 

		})

		//toggleControls()
		/*
		$("#controls").slideUp()
		$("#show-controls").show()
		*/
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

	toggleControls = function () {
		controlsShowing = !controlsShowing
		$("#show-controls").text(controlsShowing ? 'Hide controls' : 'Show Controls')
		$("#controls").slideToggle()
	},

	addShowControlsListener = function () {
		$("#show-controls").click(function () {
			toggleControls()
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
				updateRedditListing(after).then(function (afterUrl) {
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

	setRedditsRefreshTimer = function () {

		setInterval(function () {
			loading = true

			$('.redditlist').each(function (i, redditList) {
				var reddit = $(redditList).attr('data-reddit'),
				$redditList = $(redditList)

				getRedditPosts(reddit).then(function (redditData) {
					$redditList.replaceWith(redditTemplate({title: redditData.title, posts: redditData.posts}))
					loading = false
				})

			})
		}, 1000 * 5)

	},

	addSaveRedditsListener = function () {
		$("#saveReddits").click(function () {
			if ($watchList.children().size() < 1) {
				localStorage.removeItem('reddits')
				return
			}

			var redditsToSave = []

			$watchList.children().each(function (i, reddit) {
				redditsToSave.push(reddit.value)
			})

			localStorage.reddits = JSON.stringify(redditsToSave)
		})
	},

	showLoadingSpinner = function () {
		//todo: do this
	},

	pollLoadingSpinner = function () {
		setInterval(function () {
			if (loading) {
				showLoadingSpinner()
			}
		}, 500)
	},

	addSavedReddits = function (savedReddits) {
		var reddits = JSON.parse(savedReddits)

		reddits.forEach(function(reddit) {
			$redditList.children().each(function(i, breddit) {
				if (breddit.value === reddit) {
					$(breddit).remove()
				}
			})

			$watchList.append(listItemTemplate({value: reddit, text: getRedditString(reddit)}))
		})

		addReddits($watchList.children())
		toggleControls()
	},

	addRemoveRedditListener = function () {
		$('body').click(function (event) {
			var $target = $(event.target)
			if ($target.hasClass('remove-reddit')) {
				console.log('remove', $target.attr('data-reddit'))
			}
		})
	},

	addRefreshListener = function () {
		$("#refresh").click(function () {
			window.location.reload()
		})
	},

	init = function () {
		getTemplate('listItem').then(function (template) {
			listItemTemplate = template

			updateRedditListing().then(function (afterUrl) {
				after = afterUrl
				addRedditListScrollListener()

				if (localStorage.reddits) {
					addSavedReddits(localStorage.reddits)
				}
			})

		})
		
		addListButtonListener()
		addShowControlsListener()
		addRemoveRedditsListener()
		addRedditAddListener()
		addSaveRedditsListener()
		addRemoveRedditListener()
		addRefreshListener()

		getTemplate('reddit')
		.then(function (template) {
			console.log(template)
			redditTemplate = template
			addGetRedditsListener()
		})

		//setRedditsRefreshTimer()
		pollLoadingSpinner()
	}

	init()

}())