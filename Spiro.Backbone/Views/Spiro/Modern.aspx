<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<!DOCTYPE html>

<html>
<head id="Head1" runat="server">
    <meta name="viewport" content="width=device-width" />
    <title>Spiro</title>

    <link href="~/Content/spiro-modern.css" rel="stylesheet" type="text/css" />
    <link href="~/Content/themes/base/jquery.ui.datepicker.css" rel="stylesheet" type="text/css" />
    <link href="~/Content/themes/base/jquery.ui.theme.css" rel="stylesheet" type="text/css" />
    <link href="~/Content/themes/base/jquery.ui.core.css" rel="stylesheet" type="text/css" />
</head>

<body style="cursor: auto;" class="spiro">

    <%-- Main defines the static structure of the page into which sections of html are dynamically inserted. The format of the
        inserted html is defined in spiro.modern.presentations.handlebars.templates --%>
    <div id="main">
        <div class="object-view ">
            <div class="header">
                <div class="title"></div>
                <div class="type"></div>
                <div class="messages"></div>
            </div>
            <div class="properties-pane"></div>
            <div class="actions-pane"></div>
            <div class="dialog-pane"></div>
            <div class="collection-pane"></div>
            <div class="object-pane"></div>
            <div class="app-bar">
                <a class="home icon-home" title="Home" />
                <a class="back icon-arrow-left-3" title="Back" />
                <a class="forward icon-arrow-right-3" title="Forward" />
                <a class="refresh icon-loop disabled" title="Refresh" />
                <a class="edit icon-pencil" title="Edit" />
                <a class="help icon-help disabled" title="Help" />
                <a style="display: none" /> <%--Temporary workaround for curious bug in some browsers whereby last link in the app-bar is rendered in multiple places--%>
            </div>
        </div>
    </div>

    <script type="text/javascript">
        var appPath = "http://mvc.nakedobjects.net:1081/RestDemo";
    </script>

<%--    Colour definitions & Mappings.  Here you may specifiy the colour(s) for any object type in your model.  Where a
    type is not specified in this map, Spiro will assign a colour to that type, arbitrarily but consistently --%>
    <script type="text/javascript">
        var colourMap = {
            "AdventureWorksModel.CustomerRepository": { "backgroundColor": "redLight" },
            "AdventureWorksModel.Store": { "backgroundColor": "red" },
            "AdventureWorksModel.Individual": { "backgroundColor": "red" },

            "AdventureWorksModel.OrderRepository": { "backgroundColor": "green" },
            "AdventureWorksModel.SalesOrderHeader": { "backgroundColor": "greenDark" },
            "AdventureWorksModel.SalesOrderDetail": { "backgroundColor": "green" },

            "AdventureWorksModel.ProductRepository": { "backgroundColor": "orange" },
            "AdventureWorksModel.Product": { "backgroundColor": "orangeDark" },
            "AdventureWorksModel.ProductInventory": { "backgroundColor": "orange" },
            "AdventureWorksModel.ProductReview": { "backgroundColor": "orange" },
            "AdventureWorksModel.ProductModel": { "backgroundColor": "yellow" },
            "AdventureWorksModel.ProductCategory": { "backgroundColor": "redLight" },
            "AdventureWorksModel.ProductSubCategory": { "backgroundColor": "red" },

            "AdventureWorksModel.EmployeeRepository": { "backgroundColor": "blue" },
            "AdventureWorksModel.Employee": { "backgroundColor": "blueDark" },
            "AdventureWorksModel.EmployeePayHistory": { "backgroundColor": "blue" },
            "AdventureWorksModel.EmployeeDepartmentHistory": { "backgroundColor": "blue" },

            "AdventureWorksModel.SalesRepository": { "backgroundColor": "purple" },
            "AdventureWorksModel.SalesPerson": { "backgroundColor": "purple" },

            "AdventureWorksModel.SpecialOfferRepository": { "backgroundColor": "pink" },
            "AdventureWorksModel.SpecialOffer": { "backgroundColor": "pinkDark" },
            "AdventureWorksModel.ContactRepository": { "backgroundColor": "teal" },
            "AdventureWorksModel.Contact": { "backgroundColor": "teal" },
            "AdventureWorksModel.VendorRepository": { "backgroundColor": "greenDark" },
            "AdventureWorksModel.Vendor": { "backgroundColor": "greenDark" },
            "AdventureWorksModel.PurchaseOrderRepository": { "backgroundColor": "grayDark" },
            "AdventureWorksModel.PurchaseOrder": { "backgroundColor": "grayDark" },
            "AdventureWorksModel.WorkOrderRepository": { "backgroundColor": "orangeDark" },
            "AdventureWorksModel.WorkOrder": { "backgroundColor": "orangeDark" },
            "AdventureWorksModel.OrderContributedActions": { "backgroundColor": "darkBlue", "foregroundColor": "darkBlue" },
            "AdventureWorksModel.CustomerContributedActions": { "backgroundColor": "darkBlue", "foregroundColor": "darkBlue" }
        };
        
        var defaultColourArray = [
            { "foregroundColor": "white", "backgroundColor": "blue" }, //0
            { "foregroundColor": "white", "backgroundColor": "blueLight" }, //1
            { "foregroundColor": "white", "backgroundColor": "blueDark" }, //2
            { "foregroundColor": "white", "backgroundColor": "green" }, //3
            { "foregroundColor": "white", "backgroundColor": "greenLight" }, //4
            { "foregroundColor": "white", "backgroundColor": "greenDark" }, //5
            { "foregroundColor": "white", "backgroundColor": "red" }, //6
            { "foregroundColor": "white", "backgroundColor": "yellow"}, //7
            { "foregroundColor": "white", "backgroundColor": "orange"}, //8
            { "foregroundColor": "white", "backgroundColor": "orange"}, //9
            { "foregroundColor": "white", "backgroundColor": "orangeDark"}, //10
            { "foregroundColor": "white", "backgroundColor": "pink"}, //11
            { "foregroundColor": "white", "backgroundColor": "pinkDark"}, //12
            { "foregroundColor": "white", "backgroundColor": "purple"}, //13
            { "foregroundColor": "white", "backgroundColor": "grayDark"}, //14
            { "foregroundColor": "white", "backgroundColor": "magenta"}, //15
            { "foregroundColor": "white", "backgroundColor": "teal"}, //16
            { "foregroundColor": "white", "backgroundColor": "redLight"} //17
        ];

        var defaultColour = { "foregroundColor": "white", "backgroundColor": "darkBlue", "borderColor": "blue" };
    </script>
    
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
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.modern.presentations.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.modern.presentations.handlebars.templates.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.modern.presentations.handlebars.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.modern.js") %>"></script>

</body>
</html>
