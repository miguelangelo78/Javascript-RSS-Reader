<?php
	require('db_connect.php');
	
	function fetch_rss_feeds_struct(){
		$rss_grid_data = array();
		$result = dbconnect()->query("SELECT id, title, container_target, url FROM rss_feeds_struct WHERE enabled='1'") or die(mysql_error());

		if($result->num_rows > 0)
			while($row = $result->fetch_assoc())
				array_push($rss_grid_data, $row);	
		
		return $rss_grid_data;
	}
	
	$container_content_suffix = "_content";
	$feed_list = fetch_rss_feeds_struct();
	
	function get_rss_as_json(){
		global $feed_list, $container_content_suffix;

		$containers_array = array();
		$urls_array = array();
		$titles_array = array();
		$ids_array = array();

		for($i=0; $i<count($feed_list); $i++){
			array_push($ids_array, $feed_list[$i]['id']);
			array_push($containers_array, "#".$feed_list[$i]['container_target'].$container_content_suffix);
			array_push($urls_array, $feed_list[$i]['url']);
			array_push($titles_array, $feed_list[$i]['title']);
		}

		return json_encode(array('ids' => $ids_array,'containers' => $containers_array, 'urls' => $urls_array, 'titles' => $titles_array));
	}
?>