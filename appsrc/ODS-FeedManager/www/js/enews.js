// ---------------------------------------------------------------------------
function myPost(frm_name, fld_name, fld_value) {
  createHidden(frm_name, fld_name, fld_value);
  document.forms[frm_name].submit();
}

// ---------------------------------------------------------------------------
function myTags(fld_value)
{
  createHidden('F1', 'tag', fld_value);
  doPost ('F1', 'pt_tags');
}

// ---------------------------------------------------------------------------
//
function submitEnter(myForm, myButton, e) {
  var keycode;
  if (window.event)
    keycode = window.event.keyCode;
  else
    if (e)
      keycode = e.which;
    else
      return true;
  if (keycode == 13) {
    if (myButton != '') {
      doPost (myForm, myButton);
      return false;
    } else
      document.forms[myForm].submit();
  }
  return true;
}

// ---------------------------------------------------------------------------
function getObject(id, doc) {
  if (doc == null)
    doc = document;
  if (doc.all)
    return doc.all[id];
  return doc.getElementById(id);
}

// ---------------------------------------------------------------------------
function confirmAction(confirmMsq, form, txt, selectionMsq) {
  if (anySelected (form, txt, selectionMsq))
    return confirm(confirmMsq);
  return false;
}

// ---------------------------------------------------------------------------
function selectAllCheckboxes (form, btn, txt) {
  for (var i = 0; i < form.elements.length; i++) {
    var obj = form.elements[i];
    if (obj != null && obj.type == "checkbox" && !obj.disabled && obj.name.indexOf (txt) != -1) {
      if (btn.value == 'Select All')
        obj.checked = true;
      else
        obj.checked = false;
    }
  }
  if (btn.value == 'Select All')
    btn.value = 'Unselect All';
  else
    btn.value = 'Select All';
  btn.focus();
}

// ---------------------------------------------------------------------------
function anySelected (form, txt, selectionMsq) {
  if ((form != null) && (txt != null)) {
    for (var i = 0; i < form.elements.length; i++) {
      var obj = form.elements[i];
      if (obj != null && obj.type == "checkbox" && obj.name.indexOf (txt) != -1 && obj.checked)
        return true;
    }
    if (selectionMsq != null)
      alert(selectionMsq);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
function coloriseTable(id) {
  if (document.getElementsByTagName) {
    var table = document.getElementById(id);
    if (table != null) {
      var rows = table.getElementsByTagName("tr");
      for (i = 0; i < rows.length; i++) {
        rows[i].className = "td_row" + (i % 2);;
      }
    }
  }
}

// ---------------------------------------------------------------------------
function trim(sString) {
  while (sString.substring(0,1) == ' ')
    sString = sString.substring(1, sString.length);

  while (sString.substring(sString.length-1, sString.length) == ' ')
    sString = sString.substring(0,sString.length-1);

  return sString;
}

// ---------------------------------------------------------------------------
function clickNode(obj) {
  var nodes = obj.parentNode.childNodes;
  for (var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    if (node.tagName == 'A')
      if (node.innerHTML != null) {
        if (node.innerHTML.indexOf('<IMG') == 0)
           return node.onclick();
        if (node.innerHTML.indexOf('<img') == 0)
           return node.onclick();
      }
  }
}

// ---------------------------------------------------------------------------
function clickNode2(obj)
{
  var nodes = obj.parentNode.childNodes;
  for (var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    if (node.tagName == 'A')
      if (node.onclick)
        return node.onclick();
  }
}

// ---------------------------------------------------------------------------
function loadIFrame(id, domainID, accountID, flag, mode)
{
  if (flag == null)
    flag = 'r1';
  if (mode == null)
    mode = 'channel';
  if (mode != 'p') {
    readObject('feed_'+id, flag, document);
    flagObject('image_'+id, flag, document);
    showCount(document);
  }
  var sid = '';
  if (document.forms['F1'].elements['sid'])
    sid = document.forms['F1'].elements['sid'].value;
  var realm = '';
  if (document.forms['F1'].elements['realm'])
    realm = document.forms['F1'].elements['realm'].value;
  var URL = 'view.vspx?sid='+sid+'&realm='+realm+'&fid='+id+'&did='+domainID+'&aid='+accountID+'&f='+flag+'&m='+mode;
  document.getElementById('feed_content').innerHTML = '<iframe src="'+URL+'" style="margin: -2px 0px 0px 0px;" width="100%" height="100%" frameborder="0" scrolling="auto" hspace="0" vspace="0" marginwidth="0" marginheight="0"></iframe>';
}

// ---------------------------------------------------------------------------
function loadFromIFrame(id, domainID, accountID, flag, mode) {
  if (flag == null)
    flag = 'r1';
  if (mode == null)
    mode = 'channel';
  readObject('feed_'+id, flag, parent.document);
  flagObject('image_'+id, flag, parent.document);
  showCount(parent.document);
  var sid = '';
  if (document.forms['F1'].elements['sid'])
    sid = document.forms['F1'].elements['sid'].value;
  var realm = '';
  if (document.forms['F1'].elements['realm'])
    realm = document.forms['F1'].elements['realm'].value;
  var URL = 'view.vspx?sid='+sid+'&realm='+realm+'&fid='+id+'&did='+domainID+'&aid='+accountID+'&f='+flag+'&m='+mode;
  parent.document.getElementById('feed_content').innerHTML = '<iframe src="'+URL+'" style="margin: -2px 0px 0px 0px;" width="100%" height="100%" frameborder="no" scrolling="auto" hspace="0" vspace="0" marginwidth="0" marginheight="0"></iframe>';
}

// ---------------------------------------------------------------------------
function readObject(id, flag, doc) {
  if (doc == null)
    doc = document;
  if (flag == null)
    flag = 'r0';
  var c = getObject(id, doc);
  if (c) {
    if (flag == 'r0')
      if (c.className == 'read')
        c.className = 'unread';
    if (flag == 'r1')
      if (c.className == 'unread')
        c.className = 'read';
  }
}

// ---------------------------------------------------------------------------
function flagObject(id, flag, doc) {
  if (doc == null)
    doc = document;
  var c = getObject(id, doc);
  if (c) {
    if (flag == 'f0')
      if (c.innerHTML != '')
        c.innerHTML = '';
    if (flag == 'f1')
      if (c.innerHTML == '')
        c.innerHTML = '<img src="image/flag.gif" border="0"/>';
  }
}

// ---------------------------------------------------------------------------
function showCount(doc) {
  if (doc == null)
    doc = document;
  var countAll = 0;
  var countUnread = 0;
  var links = doc.links;
  for (var i=0; i<links.length; i++) {
    if (links[i].id.indexOf('feed_') != -1) {
      countAll += 1;
      if (links[i].className == 'unread')
        countUnread += 1;
    }
  }
  var c = getObject('feed_count', doc);
  if (c)
    if (c.innerHTML != (countAll+' ('+countUnread+')'))
      c.innerHTML = countAll+' ('+countUnread+')';
}

// ---------------------------------------------------------------------------
function addOption (form, text_name, box_name) {
  var box = form.elements[box_name];
  if (box) {
    var text = form.elements[text_name];
    if (text) {
      text.value = trim(text.value);
      if (text.value == '')
        return;
    	for (var i=0; i<box.options.length; i++)
		    if (text.value == box.options[i].value)
		      return;
	    box.options[box.options.length] = new Option(text.value, text.value, false, true);
	    sortSelect(box);
	    text.value = '';
	  }
	}
}

// ---------------------------------------------------------------------------
function deleteOption (form, box_name) {
  var box = form.elements[box_name];
  if (box)
	  box.options[box.selectedIndex] = null;
}

// ---------------------------------------------------------------------------
function composeOptions (form, box_name, text_name) {
  var box = form.elements[box_name];
  if (box) {
    var text = form.elements[text_name];
    if (text) {
		  text.value = '';
    	for (var i=0; i<box.options.length; i++)
    	  if (text.value == '')
		      text.value = box.options[i].value;
		    else
		      text.value = text.value + '\n' + box.options[i].value;
	  }
	}
}

// ---------------------------------------------------------------------------
function showTag(tag)
{
  createHidden2(parent.document, 'F1', 'tag', tag);
  parent.document.forms['F1'].submit();
}

// ---------------------------------------------------------------------------
//
// sortSelect(select_object)
//   Pass this function a SELECT object and the options will be sorted
//   by their text (display) values
//
// ---------------------------------------------------------------------------
function sortSelect(box)
{
	var o = new Array();
	for (var i=0; i<box.options.length; i++)
		o[o.length] = new Option( box.options[i].text, box.options[i].value, box.options[i].defaultSelected, box.options[i].selected) ;

	if (o.length==0)
	  return;

	o = o.sort(function(a,b) {
                      			if ((a.text+"") < (b.text+"")) { return -1; }
                      			if ((a.text+"") > (b.text+"")) { return 1; }
                      			return 0;
			                     }
		        );

	for (var i=0; i<o.length; i++)
		box.options[i] = new Option(o[i].text, o[i].value, o[i].defaultSelected, o[i].selected);
}

// ---------------------------------------------------------------------------
//
function showTab(tab, tabs)
{
  for (var i = 1; i <= tabs; i++) {
    var div = document.getElementById(i);
    if (div != null) {
      var divTab = document.getElementById('tab_'+i);
      if (i == tab) {
        var divNo = document.getElementById('tabNo');
        divNo.value = tab;
        div.style.visibility = 'visible';
        div.style.display = 'block';
        if (divTab != null) {
          divTab.className = "tab activeTab";
          divTab.blur();
        };
      } else {
        div.style.visibility = 'hidden';
        div.style.display = 'none';
        if (divTab != null)
          divTab.className = "tab";
      }
    }
  }
}

// ---------------------------------------------------------------------------
//
function initTab(tabs, defaultNo)
{
  var divNo = document.getElementById('tabNo');
  var tab = defaultNo;
  if (divNo != null) {
    var divTab = document.getElementById('tab_'+divNo.value);
    if (divTab != null)
      tab = divNo.value;
  }
  showTab(tab, tabs);
}

// ---------------------------------------------------------------------------
//
function windowShow(sPage, width, height)
{
  if (width == null)
    width = 500;
  if (height == null)
    height = 420;
  sPage = sPage + '&sid=' + document.forms[0].elements['sid'].value + '&realm=' + document.forms[0].elements['realm'].value;
  win = window.open(sPage, null, "width="+width+",height="+height+",top=100,left=100,status=yes,toolbar=yes,menubar=yes,scrollbars=yes,resizable=yes");
  win.window.focus();
}

// ---------------------------------------------------------------------------
//
function rowSelect(obj)
{
  var submitMode = false;
  if (window.document.F1.elements['src'])
    if (window.document.F1.elements['src'].value.indexOf('s') != -1)
      submitMode = true;
  if (submitMode)
    if (window.opener.document.F1)
      if (window.opener.document.F1.elements['submitting'])
        return false;
  var closeMode = true;
  if (window.document.F1.elements['dst'])
    if (window.document.F1.elements['dst'].value.indexOf('c') == -1)
      closeMode = false;
  var singleMode = true;
  if (window.document.F1.elements['dst'])
    if (window.document.F1.elements['dst'].value.indexOf('s') == -1)
      singleMode = false;

  var s2 = (obj.name).replace('b1', 's2');
  var s1 = (obj.name).replace('b1', 's1');

  var myRe = /^(\w+):(\w+);(.*)?/;
  var params = window.document.forms['F1'].elements['params'].value;
  var myArray;
  while(true) {
    myArray = myRe.exec(params);
    if (myArray == undefined)
      break;
    if (myArray.length > 2)
      if (window.opener.document.F1)
        if (window.opener.document.F1.elements[myArray[1]]) {
          if (myArray[2] == 's1')
            if (window.opener.document.F1.elements[myArray[1]])
              rowSelectValue(window.opener.document.F1.elements[myArray[1]], window.document.F1.elements[s1], singleMode, submitMode);
          if (myArray[2] == 's2')
            if (window.opener.document.F1.elements[myArray[1]])
              rowSelectValue(window.opener.document.F1.elements[myArray[1]], window.document.F1.elements[s2], singleMode, submitMode);
        }
    if (myArray.length < 4)
      break;
    params = '' + myArray[3];
  }
  if (submitMode) {
    window.opener.createHidden('F1', 'submitting', 'yes');
    window.opener.document.F1.submit();
  }
  if (closeMode)
    window.close();
}

// ---------------------------------------------------------------------------
//
function rowSelectValue(dstField, srcField, singleMode)
{
  if (singleMode) {
    dstField.value = srcField.value;
  } else {
    if (dstField.value.indexOf(srcField.value) == -1) {
      if (dstField.value == '') {
        dstField.value = srcField.value;
      } else {
        dstField.value = dstField.value + ', ' + srcField.value;
      }
    }
  }
}

// ---------------------------------------------------------------------------
//
// Hiddens functions
//
// ---------------------------------------------------------------------------
function createHidden(frm_name, fld_name, fld_value) {
  createHidden2(document, frm_name, fld_name, fld_value);
}

// ---------------------------------------------------------------------------
//
function createHidden2(doc, frm_name, fld_name, fld_value)
{
  var hidden;

  if (doc.forms[frm_name]) {
    hidden = doc.forms[frm_name].elements[fld_name];
    if (hidden == null) {
      hidden = doc.createElement("input");
      hidden.setAttribute("type", "hidden");
      hidden.setAttribute("name", fld_name);
      hidden.setAttribute("id", fld_name);
      doc.forms[frm_name].appendChild(hidden);
    }
    hidden.value = fld_value;
  }
}

// ---------------------------------------------------------------------------
//
// Menu functions
//
// ---------------------------------------------------------------------------
function menuMouseIn(a, b)
{
  if (b != undefined) {
    while (b.parentNode) {
      b = b.parentNode;
      if (b == a)
        return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
//
function menuMouseOut(event)
{
  var current, related;

  if (window.event) {
    current = this;
    related = window.event.toElement;
  } else {
    current = event.currentTarget;
    related = event.relatedTarget;
  }

  if ((current != related) && !menuMouseIn(current, related))
    current.style.visibility = "hidden";
}

// ---------------------------------------------------------------------------
//
function menuPopup(button, menuID)
{
  if (document.getElementsByTagName && !document.all)
    document.all = document.getElementsByTagName("*");
  if (document.all) {
    for (var i = 0; i < document.all.length; i++) {
      var obj = document.all[i];
      if (obj.id.search('menuAction') != -1) {
        obj.style.visibility = 'hidden';
        if (browser.isIE) {
          obj.onmouseout = menuMouseOut;
        } else {
          obj.addEventListener("mouseout", menuMouseOut, true);
        }
      }
    }
  }

  button.blur();
  var div = document.getElementById(menuID);
  if (div.style.visibility == 'visible') {
    div.style.visibility = 'hidden';
  } else {
    x = button.offsetLeft;
    y = button.offsetTop + button.offsetHeight;
    div.style.left = x - 2 + "px";
    div.style.top  = y - 1 + "px";
    div.style.visibility = 'visible';
  }
  return false;
}

// ---------------------------------------------------------------------------
//
function urlParams(mask)
{
  var S = '';
  var form = document.forms['F1'];

  for (var i = 0; i < form.elements.length; i++) {
    var obj = form.elements[i];
    if ((obj.name.indexOf (mask) != -1) && (((obj.type == "checkbox") && (obj.checked)) || (obj.type != "checkbox")))
      S += '&' + form.elements[i].name + '=' + encodeURIComponent(form.elements[i].value);
  }
  return S;
}

// ---------------------------------------------------------------------------
//
function showObject(id)
{
  var obj = document.getElementById(id);
  if (obj != null) {
    obj.style.display="";
    obj.visible = true;
  }
}

// ---------------------------------------------------------------------------
//
function hideObject(id)
{
  var obj = document.getElementById(id);
  if (obj != null) {
    obj.style.display="none";
    obj.visible = false;
  }
}

// ---------------------------------------------------------------------------
//
function initRequest()
{
	var xmlhttp = null;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) { }

  if (xmlhttp == null) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) { }
  }

  // Gecko / Mozilla / Firefox
  if (xmlhttp == null)
    xmlhttp = new XMLHttpRequest();

  return xmlhttp;
}

// ---------------------------------------------------------------------------
//
var timer = null;

function resetState()
{
	var xmlhttp = initRequest();
	xmlhttp.open("GET", URL + "?mode=reset" + urlParams("sid") + urlParams("realm"), false);
	xmlhttp.onreadystatechange = function() {
	  if (xmlhttp.readyState == 4) {
      var item = xmlhttp.responseXML.getElementsByTagName("message")[0];
      var message = item.firstChild.nodeValue;

			if (message == 0) {
        var idiv = window.document.getElementById("progressText");
        idiv.innerHTML = "<b>New subscription</b>";
			} else {
        var idiv = window.document.getElementById("progressText");
        idiv.innerHTML = "<b>Previous subscription</b>";
			}
	  }
	}
	xmlhttp.setRequestHeader("Pragma", "no-cache");
  xmlhttp.send(null);
}

// ---------------------------------------------------------------------------
//
function initState()
{
	document.getElementById("btn_Subscribe").disabled=true;

	// reset state
	resetState();

	var xmlhttp = initRequest();
	xmlhttp.open("POST", URL, true);
	xmlhttp.onreadystatechange = function() {
	  if (xmlhttp.readyState == 4) {}
	}
	xmlhttp.setRequestHeader("Pragma", "no-cache");
  xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	xmlhttp.send("mode=init" + urlParams("sid") + urlParams("realm") + urlParams("cb_item") + urlParams("$_"));
	//hideObject("feedsDiv");
	hideObject("feeds");
  createProgressBar();
	if (timer == null)
		timer = setTimeout("checkState()", 1000);
}

// ---------------------------------------------------------------------------
//
function checkState()
{
	var xmlhttp = initRequest();
	xmlhttp.open("GET", URL + "?mode=state" + urlParams("sid") + urlParams("realm"), true);
	xmlhttp.onreadystatechange = function() {
	  if (xmlhttp.readyState == 4) {
      var item = xmlhttp.responseXML.getElementsByTagName("message")[0];
      var message = item.firstChild.nodeValue;
      showProgress(message);
			if (message < 100) {
				document.getElementById("btn_Subscribe").disabled=true;
			  setTimeout("checkState()", 1000);
			} else {
			  timer = null;
			}
	  }
	}
	xmlhttp.setRequestHeader("Pragma", "no-cache");
	xmlhttp.send("");
}

var size=40;
var increment = 100/size;

// create the progress bar
//
function createProgressBar()
{
  var centerCellName;
  var tableText = "";
  for (x = 0; x < size; x++) {
    tableText += "<td id=\"progress_" + x + "\" width=\"10\" height=\"20\" bgcolor=\"blue\"/>";
    if (x == (size/2)) {
      centerCellName = "progress_" + x;
    }
  }
  var idiv = window.document.getElementById("progress");
  idiv.innerHTML = "<table with=\"200\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tr>" + tableText + "</tr></table>";
  centerCell = window.document.getElementById(centerCellName);
}

// show the current percentage
//
function showProgress(percentage)
{
  var percentageText = "";
  if (percentage < 10) {
    percentageText = "&nbsp;" + percentage;
  } else {
    percentageText = percentage;
  }
  centerCell.innerHTML = "<font color=\"white\">" + percentageText + "%</font>";
  var tableText = "";
  for (x = 0; x < size; x++) {
    var cell = window.document.getElementById("progress_" + x);
    if ((cell) && percentage/x < increment) {
      cell.style.backgroundColor = "blue";
    } else {
      cell.style.backgroundColor = "red";
    }
  }
}