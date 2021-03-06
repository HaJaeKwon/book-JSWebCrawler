var client = require('cheerio-httpcli');
var request = require('request');
var urlType = require('url');
var fs = require('fs');
var path = require('path');

var LINK_LEVEL = 3;
var TARGET_URL = "http://nodejs.jp/nodejs.org_ja/docs/v0.10/api/";
var list = {};

downloadRec(TARGET_URL, 0);

function downloadRec(url, level) {
	if(level >= LINK_LEVEL) return;

	// 이미 다운받은 페이지는 무시
	if(list[url]) return;
	list[url] = true;

	// 외부 페이지는 무시
	var us = TARGET_URL.split("/");
	us.pop();
	var base = us.join("/");
	if(url.indexOf(base) < 0) return;

	client.fetch(url, {}, function(err, $, res) {
		$("a").each(function(idx) {
			var href = $(this).attr('href');
			if (!href) return;
		
			href = urlType.resolve(url, href);

			// '#' 이후를 무시(a.html#aa 와 a.html#bb 는 같다)
			href = href.replace(/\#.+$/, "");
			downloadRec(href, level + 1);
		});

		if (url.substr(url.length-1, 1) == '/') {
			url += "index.html";
		}
		var savepath = url.split("/").slice(2).join("/");
		checkSaveDir(savepath);
		console.log(savepath);
		fs.writeFileSync(savepath, $.html());
	});
}

function checkSaveDir(fname) {
	var dir = path.dirname(fname);

	var dirlist = dir.split("/");
	var p = "";
	for (var i in dirlist) {
		p += dirlist[i] + "/";
		if(!fs.existsSync(p)) {
			fs.mkdirSync(p);
		}
	}
}
