<?php require('rss_data.php'); ?>

<html>
	<head>

		<title>RSS Reader</title>
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
		<link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" href="css/style.css">
		<link rel="stylesheet" href="css/glyphicons/css/font-awesome.css">
		<link rel="icon" type="image/ico" href="favicon.ico"> 
	</head>

	<body>
		<!-- NAVBAR -->
		<nav class='navbar navbar-inverse navbar-fixed-top'>
			<div class='container'>
				<div class='navbar-header'>
					
					<a href='index.php' class='navbar-brand'><i class="fa fa-rss"></i> RSS Reader</a>
					<p id='current_channel' class='navbar-text'></p>
					
				</div>
			</div>
		</nav> <!-- END NAVBAR -->

		<div id='background-loading' class='hidden-sm hidden-xs'>Loading feeds . . .</div>
		<div id='to_the_top'><span class='glyphicon glyphicon-arrow-up'></span></div>

		<div class='container'>
			<h3 style='text-shadow:1px 0px 0px #D9D9D9;display:inline'>Feeds</h3>
			<div id='update_button'  class='hidden-sm hidden-xs pull-right btn btn-primary btn-xs'  onclick='read_mode = false; updateBuffers(); updateUI(true);'>	
				<span class='glyphicon glyphicon-refresh'></span> 
				<span id='update_text'>Update feeds</span>
			</div>
		</div>

		<!-- ENTRY CONTAINER -->
		<div class='container'>
			<div style='display:none' id='loading_indicator'>Loading . . .</div>
			
			<ul id='channel_chooser' class='nav nav-tabs nav-pills'>
				<?php 
					for($i = 0; $i<count($feed_list); $i++)
						echo "<li id='".$feed_list[$i]['container_target']."_pill' index='".$i."' ".(($i==0) ? "class='active'" : "")."><a data-toggle='tab' href='#".$feed_list[$i]['container_target']."'>".$feed_list[$i]['title']."
					<span class='badge_".$i." tab-badge badge'>0</span></a></li>";
				?>
 			</ul> <!-- END NAV-TABS -->

			<div class='tab-content'>

					<!-- EACH PANEL IS A CHANNEL -->
					<?php
						for($i = 0; $i< count($feed_list); $i++){
					?>

							<div id="<?php echo $feed_list[$i]['container_target']; ?>" class="panel panel-primary tab-pane fade <?php if($i==0) echo 'in active'; ?>">
								<div class='panel-heading'>
								
									<div style='display:inline'>Last Updated: <span class='last_time_updated' id='entry_date<?php echo $i;?>'></span></div>
									<div style='float:right; display:inline'>Entry count: <span class='entry_count'></span></div>
									
								</div>
								<div class='panel-body' id="<?php echo $feed_list[$i]['container_target'].$container_content_suffix; ?>"></div>
							</div>
					<?php } ?>
					<!-- END CHANNEL PANEL -->

			</div> <!-- END TAB-CONTENT -->

		</div> <!-- END ENTRY CONTAINER -->


	</body>

		<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="xmlToJSON.js"></script>
		<script>
			var webpage_title_template = "RSS Reader";

			// This data is what determines the feeds available:
			var json = <?php echo get_rss_as_json(); ?>;
			var rss_containers = json.containers;
			var rss_urls = json.urls;
			var rss_titles = json.titles;
			var rss_feed_ids = json.ids;

			var rss_containers_raw = [];
			for(var i = 0; i<rss_containers.length;i++)
				rss_containers_raw.push(rss_containers[i].replace(/<?php echo $container_content_suffix; ?>|#/g,""));

		</script>
		<script type="text/javascript" src="rss_reader.js"></script>
</html>