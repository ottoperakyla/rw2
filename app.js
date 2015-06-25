var app = (function () {
	var app = {}

	var API_PATHS = {
		SUBREDDIT: 'http://www.reddit.com/r/'
	}

	var APP_MESSAGES = {
		CONFIRM_DELETE: 'Are you sure?'
	}

	var $redditList = $('#redditList')
	var $watchList = $('#watchList')

	var redditTemplate = null

	var addListButtonListener = function () {
		$('button.list-control').click(function (event) {
			var id = event.target.id

			var listToAdd = {
				add: $watchList,
				remove: $redditList
			}

			var getFrom = id === 'add' ? 'remove' : 'add'

			listToAdd[getFrom].children().each(function (i, reddit) {
				if (reddit.selected) {
					listToAdd[id].append(reddit)
				}
			})

		})
	}

	var addGetRedditsListener = function () {

		$('#getReddits').click(function () {
			if ($watchList.children().size() === 0) return;

			addReddits($watchList.children())
			$("#controls").slideUp()
			$("#show-controls").show()
			
		})

	}

	var addReddits = function (reddits) {
		var posts = []

		reddits.each(function (i, reddit) {
			getRedditPosts(reddit.value).then(function (redditData) {
				$('body').append(redditTemplate({title: redditData.title, posts: redditData.posts}))
			})
			
		})
	}

	var getRedditPosts = function(reddit) {
		var deferred = jQuery.Deferred()

		$.get(API_PATHS.SUBREDDIT + reddit + '.json', function (json) {
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
	}

	var addShowControlsListener = function () {
		$("#show-controls").click(function () {
			$(this).hide()
			$("#controls").slideDown()
		})
	}

	var addRemoveRedditsListener = function () {
		$('#removeReddits').click(function () {

			if ($watchList.children().size() === 0) return;

			if (confirm(APP_MESSAGES.CONFIRM_DELETE)) {
				$watchList.children().each(function (i, reddit) {
					$redditList.append(reddit)
				})

				$('.redditlist').remove()
			}
		})
	}

	var getRedditString = function (string) {
		var ret = string.indexOf('/r/') === - 1 ? '/r/' + string : string
		return !/\/$/.test(ret) ? ret + '/' : ret
	}

	var addRedditAddListener = function () {
		$('#add-reddit').keydown(function (event) {
			if (event.keyCode === 13) {
				var that = this
				getTemplate('listItem').then(function (template) {
					$watchList.append(template({value: that.value, text: getRedditString(that.value)}))
				})
			}	
		})
	}

/*
["domain", "banned_by", "media_embed", "subreddit", "selftext_html", "selftext", "likes", 
"suggested_sort", "user_reports", "secure_media", "link_flair_text", "id", "from_kind", "gilded", 
"archived", "clicked", "report_reasons", "author", "media", "score", "approved_by", "over_18", "hidden",
 "num_comments", "thumbnail", "subreddit_id", "edited", "link_flair_css_class", "author_flair_css_class",
  "downs", "secure_media_embed", "saved", "removal_reason", "stickied", "from", "is_self", "from_id",
   "permalink", "name", "created", "url", "author_flair_text", "title", "created_utc", "distinguished",
    "mod_reports", "visited", "num_reports", "ups"]
    */

    var getTemplate = function (template) {
    	var deferred = jQuery.Deferred()

    	$.get('templates/' + template + '.html', function (raw) {
    		deferred.resolve(Handlebars.compile(raw))
    	})

    	return deferred.promise()
    }

    app.init = function () {

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

    	console.log('testz')

    }

    return app
  }())

app.init()