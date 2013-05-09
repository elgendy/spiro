<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<!DOCTYPE html>

<html>
<head id="Head1" runat="server">
	<meta name="viewport" content="width=device-width" />
	<title>Spiro</title>
	   
	
</head>
<body style="cursor: auto;">
	
	<div class="page">
		<div id="header">
			<div id="title">
				<h1>Spiro - Modern</h1>
			</div>
		</div>
		
		<div id="main"></div>	
			
	</div>
        
    <script id="action-template" type="text/x-template">
        <button id="action" class="action"></button>  
    </script>
    ​
    <script id="object-template" type="text/x-template">
        <h2 id ="object-title"></h2>
        <div class="actions"/> 
        <div> 
            <button class="down">Down</button>
            <button class="up">Up</button>
        </div> 
        <div> 
            <button class="back">Back</button>
            <button class="forward">Forward</button>
        </div>    
    </script>​

	<script type="text/javascript">
		var appPath = "http://mvc.nakedobjects.net:1081/RestDemo";
	</script>
	
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/jquery-1.7.2.js") %>"></script>	  
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/underscore.js") %>"></script>	
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.tags.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/backbone.js") %>"></script> 
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/backbone.stickit.js") %>"></script> 
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/burry.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/backbone.cachingSync.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.js") %>"></script>	
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.helpers.js") %>"></script>	
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.modern.presentations.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.modern.presentations.stickit.js") %>"></script>		
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.modern.js") %>"></script>

    
</body>
</html>
