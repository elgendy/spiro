<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<!DOCTYPE html>

<html>
<head id="Head1" runat="server">
	<meta name="viewport" content="width=device-width" />
	<title>Spiro</title>
	  
	<link href="~/Content/qunit.css" rel="stylesheet" type="text/css" />

</head>
<body style="cursor: auto;">
	
	<div class="page">
		<div id="header">
			<div id="title">
				<h1>Spiro - QUnit Tests</h1>
			</div>
		</div>
		
		<div id="main"></div>	
			
	</div>

	<h1 id="qunit-header">Spiro QUnit Tests</h1>
    <h2 id="qunit-banner"></h2>
    <h2 id="qunit-userAgent"></h2>
    <ol id="qunit-tests"></ol>

	<script type="text/javascript">
	    var appPath = "http://mvc.nakedobjects.net:1081/RestDemo";
	</script>
	
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/qunit.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/modernizr-2.6.2.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/jquery-2.0.3.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/jquery-ui-1.10.2.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/underscore.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/handlebars.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/backbone.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/burry.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/backbone.cachingSync.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.shims.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.helpers.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.backbone.helpers.js") %>"></script>
	<script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.test.js") %>"></script>
</body>
</html>