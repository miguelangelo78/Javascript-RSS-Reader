<?php

function dbconnect(){
	$conn = new mysqli("localhost", "root", "", "rss_reader_database");
	if($conn->connect_error)
		die("Database connection failed! ".$conn->connect_error);
	else return $conn;
}

?>