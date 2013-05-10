<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<!DOCTYPE html>

<html>
<head id="Head1" runat="server">
	<meta name="viewport" content="width=device-width" />
	<title>Spiro</title>
	   
	<link href="~/Content/NakedObjects.css" rel="stylesheet" type="text/css" />
	<link href="~/Content/qunit.css" rel="stylesheet" type="text/css" />

</head>
<body style="cursor: auto;">
	
	<div class="page">
		<div id="header">
			<div id="title">
				<h1>Spiro - Single Page Interface for Restful Objects</h1>
			</div>
		</div>
		
		<div id="main"></div>	
			
	</div>

	<script type="text/javascript">
		var appPath = "http://mvc.nakedobjects.net:1081/RestDemo";
	</script>
	
	<script src="http://code.jquery.com/jquery-latest.js" type="text/javascript"></script>
    <script type="text/javascript" src="http://ajax.aspnetcdn.com/ajax/jQuery.ui/1.8.14/jQuery-ui.min.js"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/qunit.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/underscore.js") %>"></script>	
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/tags.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/backbone.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro-models.js") %>"></script>	
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro-classic.js") %>"></script>
</body>
</html>
