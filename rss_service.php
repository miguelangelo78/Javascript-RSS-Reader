<?php
	// This script serves as proxy and also as a RSS loader from the database

	require('db_connect.php');
	header("Access-Control-Allow-Origin: *"); // Critical line

	function db_fetch_all_urls_by_id(&$ids){
		// Go to database and get all urls using the ids
		$url_array = array();

		$result = dbconnect()->query("SELECT url FROM rss_feeds_struct WHERE id IN (".implode(", ", $ids).")") or die(mysql_error());
		
		if($result->num_rows > 0)
			while($row = $result->fetch_assoc())
				array_push($url_array, $row['url']);
			
		return $url_array;
	}

	if(isset($_POST['proxy_mode']) && isset($_POST['feed_ids'])){
		$rss_block = array();

		if($_POST['proxy_mode'] == "true"){
			// Get all ID's sent from client, search all websites using this id's and return an array of 'objects' back to client
			$urls = db_fetch_all_urls_by_id($_POST['feed_ids']);
			
			for($i = 0; $i<count($urls); $i++)
				array_push($rss_block, array('content' => file_get_contents($urls[$i])));
			
			echo json_encode($rss_block);

		}elseif(isset($_POST['page']) && isset($_POST['page_size'])){
			// TODO: get all ID's sent from client, including the page he's in and the size of the page, fetch the data from the DATABASE, put it in an array and sent it back
			
		}
	}
?>