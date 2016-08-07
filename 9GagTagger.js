/**
* 9gag Tagger
* Steps to execute this code:
* 0. Make sure you read all the instructions before executing the code
* 1. Load the post you want to tag people on
* 2. Open the browser's Developer Tools (Chrome, Opera, Firefox, Vivaldi: F12) or equivalent
* 3. Copy and paste all this code into the console and hit ENTER (Ctrl+A selects it all)
* 4. Hit any reply button or focus any text area
* 5. The code will select three random people from the NAMES list, excluding people that already
*    commented on the post, were tagged or were inside the NAMES_OPTED_OUT list, and generate the
*    reply to tag them, like this:
*    @RANDOM_NAME1 @RANDOM_NAME2 @RANDOM_NAME3 CURRENT/TOTAL AFTER_TAG_TEXT
* 6. After each time you hit the Post button, the code will generate the next comment and put
*    it right below the one you just posted, so you only have to keep pressing the Post button until
*    you tag everybody (or run out of comments)
*/
/**
* string List of the usernames to tag (either with or without the at sign) separated by spaces (not
* commas, not new lines, not anything besides spaces), such as:
* 'reversegiftag01 reversegiftag02 reversegiftag03 reversegiftag04'
*/
var names = 'reversegiftag01 reversegiftag02 reversegiftag03 reversegiftag04';
/**
* string List of the usernames that opted out of being tagged (either with or without the at sign)
* separated by spaces, such as:
* 'reversegiftag05 reversegiftag06 reversegiftag07 reversegiftag08'
*/
var namesOptedOut = 'reversegiftag05 reversegiftag06 reversegiftag07 reversegiftag08';
/**
* string Text which will be printed at the end of every tag comment, such as:
* 'You were tagged here because you asked me to'
*/
var afterTagText = 'You were tagged here because you asked me to';
/**
* array Texts that are easy to use once the code is loaded, you can use them with this code:
* setAfterTagText(X) //Where X stands for the number between brackets
*/
var afterTagTexts = [];
afterTagTexts[0] = '| I\'m a zombie, I won\'t check notifications';

/**
* NOTE: From this point onwards no modification/reading is necessary!
*/
var scriptName = '9gag Tagger';
console.info(scriptName+' started');
var internalName = scriptName.replace(/ /g,'');
var localStorageMissingNamesKey = internalName+'MissingNames';
var current = 0;
var id = '';
var lastComment = null;
var list = {};
var listArray = [];
var replyButton = null;
var requestsForMoreComments = 0;
var total = 0;
var millisecondsToRetryLoadingComments = 1;
var millisecondsToRetryBuildingReplies = 20;
console.info('Loading all comments...');
if(typeof interval !== 'undefined'){
	clearInterval(interval);
}
var interval = setInterval(loadAllComments,millisecondsToRetryLoadingComments);
function buildNextReply(){
	if(document.activeElement.tagName=='TEXTAREA' && document.activeElement.value.indexOf('/')<0){
		id = 'textareaid'+current;
		document.activeElement.id = id;
		var hideEverythingElse = (replyButton===null);
		replyButton = document.activeElement.parentElement.parentElement.parentElement.parentElement.parentElement.previousSibling.getElementsByClassName('badge-reply-trigger');
		replyButton = replyButton[replyButton.length-1];
		if(hideEverythingElse){
			document.getElementById('sidebar').style.display = 'none';
			document.getElementById('individual-post').style.display = 'none';
			document.getElementsByClassName('badge-sticky-subnav-static')[0].style.display = 'none';
			document.getElementsByTagName('footer')[0].style.display = 'none';
			document.getElementById('jsid-sticky-button').style.display = 'none';
			var comments = document.getElementsByClassName('comment-entry badge-comment');
			for(var commentIndex in comments){
				if(comments[commentIndex] != replyButton.parentElement.parentElement.parentElement.parentElement){
					comments[commentIndex].style.display = 'none';
				}
			}
		}
		var errorElements = document.getElementsByClassName('notice-message error');
		if(errorElements.length == 0){
			var sublist = [];
			while(sublist.length!=3 && listArray.length){
				sublist.push(listArray.splice(Math.floor((Math.random()*listArray.length)),1));
			}
			while(sublist.length && sublist.length!=3){
				sublist.push(sublist[0]);
			}
			if(sublist.length){
				lastComment = '@'+sublist.join(' @')+' '+(current++)+'/'+total+(afterTagText?' '+afterTagText:'');
			}else{
				localStorageManager('remove',localStorageMissingNamesKey);
				console.info('THAT\'S ALL, FOLKS!');
				lastComment = 'All the tagging process is over!\n'+new Array(1001).join(' ');
				document.activeElement.style.height = '200px';
				clearInterval(interval);
			}
		}else{
			var missingNames = listArray.concat(lastComment.split(/[0-9]/)[0].trim().split('@')).sort().join(' ').replace(/ +/g,' ');
			errorElements[0].innerHTML += ' - Maybe you want to <a href="http://9gag.com/logout" target="_blank">log out</a>, <a href="http://9gag.com/login" target="_blank">log in</a> with a different account and then <a href="'+document.location.href.split('?')[0].split('#')[0]+'">reload this post</a> and re do the code steps to continue tagging<br/><hr/>Names missing:<br/><input onclick="select()" value="'+missingNames+'"/>';
			if(localStorageManager('save',localStorageMissingNamesKey,missingNames)){
				errorElements[0].innerHTML += '<hr/>Missing names were saved in LocalStorage, just in case';
			}else{
				errorElements[0].innerHTML += '<hr/>Copy the names missing before leaving this page!';
			}
		}
		document.activeElement.value = lastComment;
		document.activeElement.style.backgroundColor = 'lightgreen';
	}else if(replyButton && !document.getElementById(id)){
		if(replyButton.parentElement.parentElement.parentElement.parentElement.className != 'comment-entry badge-comment'){
			replyButton.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
		}
		replyButton.click();
	}
}
function loadAllComments(){
	var button = document.getElementsByClassName('badge-load-more-trigger')[0];
	var indicator = document.getElementsByClassName('badge-loading-indicator')[0];
	if(button||indicator){
		if(!indicator){
			var grand2father = button.parentElement.parentElement.parentElement;
			var first = false;
			if(!grand2father.childrenCount){
				first = true;
				grand2father.childrenCount = grand2father.children.length;
			}
			if(first || grand2father.childrenCount!=grand2father.children.length){
				grand2father.childrenCount = grand2father.children.length;
				console.info('Loading comments '+(++requestsForMoreComments)+'...');
				button.click();
			}else{
				button.remove();
			}
		}
	}else{
		button = document.getElementsByClassName('collapsed-comment')[0];
		if(button){
			if(!button.className.match(/loading/)){
				var grandfather = button.parentElement.parentElement;
				var first = false;
				if(!grandfather.childrenCount){
					first = true;
					grandfather.childrenCount = grandfather.children.length;
				}
				if(first || grandfather.childrenCount!=grandfather.children.length){
					grandfather.childrenCount = grandfather.children.length;
					console.info('Loading replies '+(++requestsForMoreComments)+'...');
					button.click();
				}else{
					button.remove();
				}
			}
		}else{
			console.info('Done loading comments. Reviewing username list...');
			clearInterval(interval);
			var namesAlreadyHere = '';
			var commentators = document.getElementsByClassName('username badge-author-name badge-normal');
			for(var commentatorIndex in commentators){
				var userName = commentators[commentatorIndex].innerText;
				if(userName){
					namesAlreadyHere += ' '+userName;
				}
			}
			var comments = document.getElementsByClassName('content badge-content');
			for(var commentIndex in comments){
				var text = comments[commentIndex].innerText;
				if(text){
					var matches = comments[commentIndex].innerText.trim().match(/@[^ ]+/g);
					if(matches){
						namesAlreadyHere += ' '+matches.splice(0,3).join(' ');
					}
				}
			}
			names = names.replace(/@/g,' ').replace(/ +/g,' ').trim().split(' ');
			namesOptedOut = namesOptedOut.replace(/@/g,' ').replace(/ +/g,' ').trim().split(' ');
			var listOptedOut = {};
			for(var namesOptedOutIndex in namesOptedOut){
				listOptedOut[namesOptedOut[namesOptedOutIndex]] = true;
			}
			for(var nameIndex in names){
				if(listOptedOut[names[nameIndex]]){
					console.info(names[nameIndex]+' opted out, but is still on main list');
					names.splice(nameIndex,1);
				}
			}
			namesAlreadyHere = namesAlreadyHere.replace(/@/g,' ').replace(/ +/g,' ').trim().split(' ');
			var listAlreadyHere = {};
			for(var namesAlreadyHereIndex in namesAlreadyHere){
				listAlreadyHere[namesAlreadyHere[namesAlreadyHereIndex]] = true;
			}
			var localStorageMissing = localStorageManager('get',localStorageMissingNamesKey).split(' ');
			for(var nameIndex in names){
				if(listAlreadyHere[names[nameIndex]] || (localStorageMissing[0]&&localStorageMissing.indexOf(names[nameIndex])==-1)){
					current++;
				}else{
					list[names[nameIndex]] = true;
				}
				total++;
			}
			var peopleAlreadyHere = current;
			var currentModulo3 = current%3;
			var totalModulo3 = total%3;
			current = Math.ceil(current/3)+1;
			total = Math.ceil(total/3);
			if(['10','20','12'].indexOf(currentModulo3+''+totalModulo3) >= 0){
				total++;
			}
			listArray = Object.keys(list);
			if(listArray.length){
				if(peopleAlreadyHere){
					console.info(peopleAlreadyHere+' name(s) already here! Count starts in '+current);
				}else{
					console.info('No one from the list was here');
				}
				console.info('Username list ready. Hit the reply button of a comment or click on a text area to start tagging...');
				if(afterTagTexts.length){
					console.info('After Tag Texts available:\n\tIndex\tText');
					for(var afterTagTextIndex in afterTagTexts){
						console.info('\t'+afterTagTextIndex+'\t'+afterTagTexts[afterTagTextIndex]);
					}
					console.info('You can set any of those by executing:\nsetAfterTagText(X) //Where X stands for the index you want to use');
				}
				interval = setInterval(buildNextReply,millisecondsToRetryBuildingReplies);
			}else{
				console.info('Everybody\'s tagged here');
			}
		}
	}
}
function localStorageManager(type,id,data){
	try{
		var test = 'test_'+new Date().getTime();
		localStorage.setItem(test,test);
		localStorage.removeItem(test);
		if(type == 'save'){
			localStorage.setItem(id,data);
		}else if(type == 'remove'){
			localStorage.removeItem(id);
		}else if(type == 'get'){
			return (localStorage.getItem(id)||'');
		}
		return true;
	}catch(error){
		if(type == 'get'){
			return '';
		}
		return false;
	}
}
function setAfterTagText(afterTagTextIndex){
	if(afterTagTexts[afterTagTextIndex]){
		afterTagText = afterTagTexts[afterTagTextIndex];
		console.info('You\'re now using the text:\n'+afterTagTexts[afterTagTextIndex]);
	}else{
		console.info(afterTagTextIndex+' index doesn\'t exist (or is blank) on the afterTagTexts array');
	}
}
