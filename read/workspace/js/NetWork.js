(function() {
	var Util = (function() {
		var prefix = 'html5_reader_'
		var StorageGetter = function(key) {

			//			        	if(localStorage.getItem(prefix + key)!=null){
			//			        		 return localStorage.getItem(prefix + key)
			//			        	}
			var kv = prefix + key
			if(kv) {
				return null
			}
			return localStorage.getItem(prefix + key)
		}
		var StorageSetter = function(key, val) {
			return localStorage.setItem(prefix + key, val)
		}
		var getBSONP = function(url, callback) {
			return $.jsonp({

				url: url,
				cache: true,
				callback: 'duokan_fiction_chapter',
				success: function(result) {

					var data = $.base64.decode(result);
					var json = decodeURIComponent(escape(data));
					callback(json);
				}

			})
		}
		return {
			getBSONP: getBSONP,
			StorageGetter: StorageGetter,
			StorageSetter: StorageSetter
		}

	})();

	var Dom = {

		top_nac: $('#top-nac'),
		buttom_nav: $('.buttom-nav'),
		nav_pannel_bk: $('.nav-pannel-bk'),
		nav_pannel: $('.nav-pannel'),
	}

	var Win = $(window)
	var Doc = $(document)
	var readerModel;
	var readerBaseFrame;
	var Platform;
	var RootContainer = $('#fiction_container');
	var initFontSize = Util.StorageGetter('font_size');
	initFontSize = parseInt(initFontSize)
	if(!initFontSize) {
		initFontSize = 14
	}
	RootContainer.css('font-size', initFontSize);

	var bg = Util.StorageGetter('background')
	if(!bg) {
		bg = '#E9DFC7'
	}
	RootContainer.css('background', bg)

	function main() {
		
		
		getUrlPlatform()
		//TODO 程序入口
		readerModel = ReaderModel();
		
		readerBaseFrame = ReaderBaseFrame(RootContainer)
		readerModel.init(function(data) {
			readerBaseFrame(data);
		});
		
		EvenHanlder();

	}

	function getUrlPlatform(){
		//正则表达式,以起始符或&为起始点+参数名+等于以非&起始的任意字符，以&或结束符为终止点
//	var reg = new RegExp("(^|&)" + 'Platform' + "=([^&]*)(&|$)");
	//substr返回一个以1为起始点的路径长度，实际上是去除了路径中的第一个？号字符
//	var r = window.location.search.substr(1).match(reg);
//	console.log(r[2])
	//r匹配的值是一个数组，值如下：
	//0: "templateId=a612d16cc90a4675ba08e0e911ef9add"
	//1: ""
	//2: "a612d16cc90a4675ba08e0e911ef9add"
	//3: ""
		var url = location.search;
//		console.log( var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');)
			if(url.indexOf("?") != -1){
				Platform = url.substr(url.indexOf("?Platform=")+10);
			}
			console.log(url)
	}


	function ReaderModel() {

		//todo   实现 实现和 实现和阅读器实现
		var Chapter_id
		var sum;
		var init = function(UIcallback) {

			getFirstionInfo(function() {
				
				getCurChapterContent(Chapter_id, function(data) {
					//todo....
					UIcallback && UIcallback(data);
				})
			})

		}
		var getFirstionInfo = function(callback) {
			$.get('data/chapter.json', function(data) {
				Chapter_id = Util.StorageGetter('cid')
				if(Chapter_id == null) {
					Chapter_id = 1
				}
				Chapter_id = data.chapters[Chapter_id].chapter_id;
				sum = data.chapters.length
				callback && callback();
			}, 'json');
		}

		var getCurChapterContent = function(chapter_id, callback) {
			console.log(chapter_id)
			$.get('data/data' + chapter_id + '.json', function(data) {

				if(data.result == 0) {
					var url = data.jsonp;
					Util.getBSONP(url, function(data) {

						callback && callback(data)

					});
				}
			}, 'json')
		}
		var perChapter = function(UIcallback) {

			Chapter_id = parseInt(Chapter_id, 10);
			if(Chapter_id == 0) {
				return;
			}
			Chapter_id -= 1
			getCurChapterContent(Chapter_id, UIcallback)
			Util.StorageSetter('cid', Chapter_id)
		}
		var nextChapter = function(UIcallback) {
			Chapter_id = parseInt(Chapter_id, 10);
			if(Chapter_id == sum) {
				return;
			}
			Chapter_id += 1
			getCurChapterContent(Chapter_id, UIcallback)
			Util.StorageSetter('cid', Chapter_id)
		}
		return {

			init: init,
			perChapter: perChapter,
			nextChapter: nextChapter
		}
	}

	function ReaderBaseFrame(container) {
		//todo ui
		function parse(jsonData) {
			var jsonObj = JSON.parse(jsonData);
			var html = '<h4>' + jsonObj.t + '</h4>'
			for(var i = 0; i < jsonObj.p.length; i++) {
				html += "<p>" + jsonObj.p[i] + '</p>';
			}
			return html;
		}
		return function(data) {

			container.html(parse(data));
		}
	}

	function EvenHanlder() {

		var isNight = false;

		$('#prev_button').click(function() {

			readerModel.perChapter(function(data) {
				readerBaseFrame(data);

			})
		})
		$('#next_button').click(function() {
			readerModel.nextChapter(function(data) {
				readerBaseFrame(data);
			})
		})

		$('#action_mid').click(function() {

			if(Dom.top_nac.css('display') == 'none') {
				Dom.top_nac.show()
				Dom.buttom_nav.show()
			} else {
				Dom.top_nac.hide()
				Dom.buttom_nav.hide()
				Dom.nav_pannel.hide()
				Dom.nav_pannel_bk.hide()
			}

		});

		$('.mulu-item-free').click(function() {

			// 背景切换
			if(isNight) {
				bg = '#000'
			} else {
				bg = '#fff'
			}
			RootContainer.css('background', bg);
			Util.StorageSetter('background', bg);
			isNight = !isNight
		});

		$('.font-size-button').click(function() {

			// 字号
			if(initFontSize < 20) {
				initFontSize += 1

			} else {
				initFontSize = 14
			}
			RootContainer.css('font-size', initFontSize);
			Util.StorageSetter('font_size', initFontSize);

		})
		$('.font-small-button').click(function() {
			if(initFontSize > 14) {
				initFontSize -= 1
				RootContainer.css('font-size', initFontSize);
				Util.StorageSetter('font_size', initFontSize);
			}
		});
		$('.mulu-item-two').click(function() {

			if(Dom.nav_pannel_bk.css('display') == 'none') {
				Dom.nav_pannel_bk.show();
				Dom.nav_pannel.show();
			} else {
				Dom.nav_pannel_bk.hide();
				Dom.nav_pannel.hide();

			}
		})

		$('.bk-container-current').click(function() {
			bg = '#fff'
			RootContainer.css('background', bg);

			Util.StorageSetter('background', bg);
		});

		$('.bk-container-current-black').click(function() {
			bg = '#FF83FA'
			RootContainer.css('background', bg);

			Util.StorageSetter('background', bg);

		});
		$('.mulu-item-one').click(function() {	
			console.log(Platform)
			if(Platform=="android"){
				Android.showToast("android-h5");	
			}else{
				window.location.href="ios://"
			}
			
		});
		$('.bk-container-current-red').click(function() {
			bg = '#CAFF70'
			RootContainer.css('background', bg);

			Util.StorageSetter('background', bg);
		});
		Win.scroll(function() {

			Dom.top_nac.hide();
			Dom.nav_pannel_bk.hide();
			Dom.nav_pannel.hide();
			Dom.buttom_nav.hide();
		});
	}

	main();
})();