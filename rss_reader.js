function create2d_array(array_size) {
	var arr = [];

	for (var i=0;i<array_size;i++)
		arr.push([]);
 
	return arr;
}

function init_bool_array(array_size){
	var arr = [];
	for(var i=0;i<array_size;i++)
		arr.push(false);

	return arr;
}

function init_int_array(array_size){
	var arr = [];
	for(var i=0;i<array_size;i++)
		arr.push(0);

	return arr;
}

function init_string_array(array_size){
	var arr = [];
	for(var i=0;i<array_size;i++)
		arr.push("");

	return arr;
}

var rss_feed_count = rss_urls.length;
var rss_feed_channel = 0;

var entry_count = init_int_array(rss_feed_count);
var entry_buffer = create2d_array(rss_feed_count);

var new_entries = init_bool_array(rss_feed_count)
var last_entry = init_string_array(rss_feed_count);

var request_interval_base = 5000;
var updateui_interval = 1000;

function rss_filter_template(rss_data, nth_entry){
	var entry_template = "";

	// Entry title:
	entry_template += 
		"<a class='entry_title' href='"+rss_data.link[0]._text+"'>\
			<span class='glyphicon glyphicon-menu-right'></span> "+rss_data.title[0]._text+"\
		</a>\
		<span class='panel-open-glyph glyphicon glyphicon-chevron-down'></span>";
	
	// Entry content:
	entry_template += 
		"<div class='panel panel-default'>\
			<a class='panel-close-glyph'><span class='pull-right glyphicon glyphicon-remove'></span></a>\
			<div class='panel-body'>"+rss_data.description[0]._text+"</div>\
			<div class='entry_num_marker'>#"+(nth_entry+1)+"</div>\
			<div class='entry_date'>"+getCurrentDate()+"</div>\
		</div>";

	return entry_template;
}

function getCurrentDate(){
	var date = new Date();
	var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

	return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+", "+weekday[date.getDay()]+"  "+date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
}

function updateUI(force_ui_update){
	if(!new_entries[rss_feed_channel] && !force_ui_update) return;

	// Update last time updated text:
	$(".last_time_updated").html(getCurrentDate());
	$(".entry_count").html(entry_count[rss_feed_channel]);

	$("#background-loading").hide();

	for(var i=0;i<entry_count[rss_feed_channel]; i++){
		var entry = $(entry_buffer[rss_feed_channel][i]);
		entry.hide();
		entry.append("<hr>");
		
		$(rss_containers[rss_feed_channel]).prepend(entry);
		entry.fadeIn('slow');
	}

	entry_buffer[rss_feed_channel] = [];

	$(".badge_"+rss_feed_channel).text("0");
	$(".badge_"+rss_feed_channel).hide();

	// Re-register events (Fix this)
	panel_close();
	panel_open();
	
	$("img").addClass('img-responsive text-center'); // Make all images responsive
	$("div> a > img").addClass("center-block"); // Align images to the center of the screen

	new_entries[rss_feed_channel]= false;
}

function get_channel_list(){
	// Add first channel 1st:
	var current_channel_name = rss_titles[rss_feed_channel];
	var build_str = "| Channel: <a style='font-weight: normal !important;' id='active_feed' onclick='channel_changed(); scroll_to_top();' data-target='#"+rss_containers_raw[rss_feed_channel]+", #"+rss_containers_raw[rss_feed_channel]+"_pill' href='#"+rss_containers_raw[rss_feed_channel]+"' data-toggle='tab' class='label label-success'>" + current_channel_name+"</a> | <span class='hidden-sm hidden-xs' id='other_feeds'>";

	// Now add all other channels:
	for(var i=0;i<rss_titles.length;i++)
		if(i==rss_feed_channel) continue;
		else
			build_str += "<a style='font-weight: normal !important;' onclick='channel_changed(); scroll_to_top();' data-target='#"+rss_containers_raw[i]+", #"+rss_containers_raw[i]+"_pill' href='#"+rss_containers_raw[i]+"' data-toggle='tab' class='label label-default'>"+rss_titles[i]+"</a> ";

	build_str+="</span>";
	return build_str;
}

function panel_close(){
	$(".panel-close-glyph").click(function(){
		$(this).parent().siblings('.panel-open-glyph').show();
		$(this).parent().slideUp();
	});
}

function panel_open(){
	$(".panel-open-glyph").click(function(){
		$(this).siblings(".panel").slideDown();
		$(this).hide();
	});
}

function get_last_time_updated(){
	var last_time = null;
	try{
		last_time = /(.+?),/.exec($("#entry_date"+rss_feed_channel).text())[1];
	}catch(err){}
	return last_time;
}

function channel_changed(){
	$("#background-loading").show();
	setTimeout(function(){ // Fix this! No delay should be used
		rss_feed_channel = parseInt($("#channel_chooser .active").attr("index"));
		update_title();
		updateUI(true);
	}, 400);
}

function handle_scroll(){
	$(window).scroll(function(){
		if($(document).scrollTop() > 50){
			$(".navbar").addClass("navbar-xs");
			$("#current_channel").html(get_channel_list());

			$("#to_the_top").show();

			$("#update_text").hide();
			$("#update_button").addClass("update_button_fixed");
		}
		else{
		
			$(".navbar").removeClass("navbar-xs");
			$("#current_channel").html("");

			$("#to_the_top").hide();

			$("#update_text").show();
			$("#update_button").removeClass("update_button_fixed");
		}
		 
	});
}

function scroll_to_top(){
	$("html, body").animate({ scrollTop: 0 }, "slow");
}

function update_title(){
	document.title = webpage_title_template+" | "+rss_titles[rss_feed_channel];
}

function calculate_request_interval(){
	// Calculate interval requests depending on how many feeds exist in order to improve performance and reduce the load on both the client and server
	var interval = request_interval_base + (Math.floor(rss_urls.length/1.75) * 1000);
	return interval;
}

function crossdomain_get(callback, data_to_send, options){
	$.ajax({
		type: "POST",
		url: "rss_service.php", // PROXY URL
		data: data_to_send,
		success: function(data){ callback(data, null, options); },
		error: function(error){ callback(null, error, options); }
	});
}

var toggle_list_to_req = 1;
function get_feedid_list_to_request(force_id){
	if(force_id != -1) return [{0:force_id}];

	var list_to_request = [];

	var list_size = 5;

	var start_limit = (rss_feed_channel-list_size < 0) ? 0 : rss_feed_channel-list_size;
	var end_limit = (rss_feed_channel+list_size > rss_titles.length) ? rss_titles.length : rss_feed_channel+list_size;
 	
	var loop_start = (toggle_list_to_req==1) ? start_limit : 0;
	var loop_end = (toggle_list_to_req==1) ? end_limit : rss_titles.length;

 	for(var i= loop_start; i<loop_end; i++){
		var obj={};
		obj[i] = rss_feed_ids[i];
		if(toggle_list_to_req==1 || (i<start_limit || i>end_limit))
			list_to_request.push(obj);
	}
	
	toggle_list_to_req = !toggle_list_to_req;
	
	// Use a list for the recently updated feeds


	return list_to_request;
}

function get_all_keyval(obj_array, key_or_val){
	var keys = [], vals = [];

	for(var i=0;i<obj_array.length;i++)
		if(key_or_val)
			keys.push(Object.keys(obj_array[i])[0]);
		else
			vals.push(obj_array[i][Object.keys(obj_array[i])[0]]);
	
	if(key_or_val) return keys;
	else return vals;
}

function get_all_last_entries(ids){
	//FIXME: REMOVE THIS FUNCTION WHEN THE TIME IS RIGHT
	/*var last_entries_list = [];

	for(var i = 0; i<ids.length;i++)
		last_entries_list.push(last_entry[ids[i]]);

	return last_entries_list;*/
}

// Improve this function:
function updateBuffers(force_id, updateUI_callback){
	$("#loading_indicator, #background-loading").show();

	var request_list = get_feedid_list_to_request(force_id);

	var request_list_db_id = get_all_keyval(request_list, false);
	var request_list_ui_id = get_all_keyval(request_list, true);

	crossdomain_get(
	
		function(data, error, options){
			console.log(data);
			$("#loading_indicator").hide();
			
			try{
				var json_arr = JSON.parse(data);
				
				for(var feed_id=0; feed_id<json_arr.length; feed_id++){
					if(json_arr[feed_id]['content'] == 'EMPTY_XML') continue;

					var json_content = xmlToJSON.parseString(json_arr[feed_id]['content']);
					
					var rss_data = json_content["rss"][0]["channel"][0].item;
					var first_entry_title = rss_data[0].title[0]._text;

					var ui_id = options[feed_id]; // Must be 0 indexed!
				
					if(last_entry[ui_id] !== first_entry_title){
						last_entry[ui_id] = first_entry_title;

						new_entries[ui_id] = true;

						for(var post_id=0; post_id<rss_data.length ; post_id++){
							entry_buffer[ui_id].push("<div class='entry_"+entry_count[ui_id]+"'>"+rss_filter_template(rss_data[post_id], entry_count[ui_id])+"</div>");
				    		entry_count[ui_id]++;
			    		}

				    	$(".badge_"+ui_id).text(parseInt($(".badge_"+ui_id).text()) + rss_data.length);
				    	$(".badge_"+ui_id).show();

				    	if(updateUI_callback) updateUI();
					}
				}
			}catch(err){/* No need for handling this at the moment */}
		}
		,{ proxy_mode: true, feed_ids: request_list_db_id /*, last_entry_list: get_all_last_entries(request_list_ui_id)*/ }, request_list_ui_id);
}

$(function(){
	
	updateBuffers(rss_feed_ids[0], true);
	// load 1st page from database first
	
	setTimeout(function(){
		// and NOW start updating automatically IF the user is on the 1st page
		setInterval(updateUI, updateui_interval);
		setInterval(function(){updateBuffers(-1, false);}, calculate_request_interval());
	
	},1);

	handle_scroll();
	update_title();

	$("#channel_chooser").click(function(){
		channel_changed();
	});

	$("#to_the_top").click(function(){
		scroll_to_top();
	});
});