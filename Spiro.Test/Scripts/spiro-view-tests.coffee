###
/// <reference path="apppath.js"/>
/// <reference path="jquery-1.7.2.js"/>
/// <reference path="underscore.js"/>
/// <reference path="backbone.js"/>
/// <reference path="jsrender.js"/>
/// <reference path="spiro-templates.js"/>
/// <reference path="spiro-models.js"/>
###


module "Spiro Classic View Tests"

waitForChange = (change, execute, count)	->
	count = count ? 1000 				
	setTimeout (-> if change() || count <= 0  then execute() else waitForChange change, execute, --count), 10


asyncTest "Home page view", -> 

	expect 11
	
	waitForChange (-> $(".nof-servicelist > .nof-menu").length >= 10), -> 
		services = $(".nof-servicelist > .nof-menu")
		equal services.length, 10, "services count"
		serviceNames = ["Customers", "Orders", "Products", "Employees", "Sales", "Special Offers", "Contacts", "Vendors", "Purchase Orders", "Work Orders"]
		for sn in serviceNames
			equal $(services).find(".nof-menuname").filter(-> $(this).text() == sn ).length, 1, sn 
		start()

asyncTest "Invoke no parm service action", -> 

	expect 2

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
		start()
	
	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "Action with params has elipsis", -> 

	expect 2
	equal $("form#RandomStore > div > button").text(), "Random Store", "Action without params has no elipsis"
	equal $("form#FindStoreByName > div > button").text(), "Find Store By Name...", "Action with params has elipsis"
	start()

asyncTest "Get dialog for parm service action", -> 

	expect 3

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 0, "no object view"
		equal $(".nof-actiondialog").length, 1, "action dialog"
		start()
	
	equal $(".nof-actiondialog").length, 0, "no action dialog"
	$("form#FindStoreByName > div > button").click()

asyncTest "Mandatory Parameter Indicators", -> 

	expect 5

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 0, "no object view"
		equal $(".nof-actiondialog").length, 1, "action dialog"
		equal $("#lastName span.nof-mandatory-field-indicator").text(), "*", "Last Name param has mandatory indicator"
		equal $("#firstName span.nof-mandatory-field-indicator").length, 0, "First Name param has no mandatory indicator"
		start()
	
	equal $(".nof-actiondialog").length, 0, "no action dialog"
	$("form#FindEmployeeByName > div > button").click()
	
asyncTest "Mandatory param left blank", -> 

	expect 5

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 0, "no object view"
		equal $(".nof-actiondialog").length, 1, "action dialog"

		input = $("#Name input")
		input.val ""
		$('.nof-ok').click()

		waitForChange (-> $("span.field-validation-error").length > 0), ->

			equal $(".nof-actiondialog").length, 1, "still in action dialog"
			equal $("span.field-validation-error").text(),"Mandatory", "Mandatory word next to param"
			start()
	
	equal $(".nof-actiondialog").length, 0, "no action dialog"
	$("form#FindStoreByName > div > button").click()

asyncTest "Invoke parm service action", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 0, "no object view"
		equal $(".nof-actiondialog").length, 1, "action dialog"

		input = $("#name input")
		input.val "roadway"
		$('.nof-ok').click()

		waitForChange (-> $(".nof-standalonetable").length > 0), -> 
			equal $(".nof-collection-table").length, 1, "Returns table"
			start()
	
	equal $(".nof-actiondialog").length, 0, "no action dialog"
	$("form#FindStoreByName > div > button").click()

asyncTest "view object", -> 

	expect 20

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
		equal $(".nof-objectview > .nof-menu").length, 1, "object menu"
		equal $(".nof-objectview .nof-menuitems > form").length, 7, "object menu items"
		equal $(".nof-objectview .nof-propertylist > .nof-property").length, 8, "object properties"

		for actionName in ["Create New Address", "Create New Contact", "Create New Order", "Search For Orders", "Last Order", "Open Orders", "Recent Orders"]
			equal $(".nof-objectview .nof-menuitems > form").find("button").filter(-> $(this).text() == actionName ).length, 1, actionName

		for propName in ["Store Name", "Demographics", "Sales Person", "Last Modified", "Account Number", "Addresses", "Contacts", "Sales Territory"]
			equal $(".nof-objectview .nof-propertylist > .nof-property").find("label").filter(-> $(this).text() == propName ).length, 1, propName

		start()
	
	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "edit object", -> 

	expect 34

	waitForChange (-> $("#main").children().length > 0), -> 
		
		equal $(".nof-objectview").length, 1, "object view" 
		equal $(".nof-objectedit").length, 0, "no object edit" 

		$('.nof-edit').click()

		waitForChange (-> $(".nof-save").length > 0), ->
			equal $(".nof-objectview").length, 0, "no object view"
			equal $(".nof-objectedit").length, 1, "object edit" 
			equal $(".nof-objectedit > .nof-menu").length, 0, "no object menu"	
			equal $(".nof-objectedit .nof-propertylist > .nof-property").length, 8, "object properties"

			for propName in ["Store Name", "Demographics", "Sales Person", "Last Modified", "Account Number", "Addresses", "Contacts", "Sales Territory"]
				equal $(".nof-objectedit .nof-propertylist > .nof-property").find("label").filter(-> $(this).text() == propName ).length, 1, propName

			# enabled and disabled fields 

			equal $("#Name > .nof-value :input").length, 1, "name input"
			equal $("#FormattedDemographics > .nof-value :input").length, 0, "demographics  input"
			equal $("#SalesPerson > .nof-value :input").length, 0, "sales person input"
			equal $("#ModifiedDate > .nof-value :input").length, 0, "modified date input"
			equal $("#AccountNumber > .nof-value :input").length, 0, "account number input"
			equal $("#Addresses > .nof-value :input").length, 0, "addresses input"
			equal $("#Contacts > .nof-value :input").length, 0, "contacts input"
			equal $("#SalesTerritory > .nof-value :input").length, 0, "sales territory input"

			# find menus 

			waitForChange (-> $(".nof-menu").length >= 2), ->

				equal $("#Name > .nof-object > .nof-menu").length, 0, "name menu"
				equal $("#FormattedDemographics > .nof-object > nof-menu").length, 0, "demographics  menu"
				equal $("#SalesPerson > .nof-object > .nof-menu").length, 1, "sales person menu"
				equal $("#ModifiedDate > .nof-object > .nof-menu").length, 0, "modified date menu"
				equal $("#AccountNumber > .nof-object > .nof-menu").length, 0, "account number menu"
				equal $("#Addresses > .nof-object > .nof-menu").length, 0, "addresses menu"
				equal $("#Contacts > .nof-object > .nof-menu").length, 0, "contacts menu"
				equal $("#SalesTerritory > .nof-object > .nof-menu").length, 1, "sales territory menu"

			# find menus submenus 
	
			waitForChange (-> $("#SalesPerson > .nof-object > .nof-menu > .nof-menuitems > .nof-submenu > .nof-submenuitems > .nof-action").length >= 3), ->
				equal $("#SalesPerson > .nof-object > .nof-menu > .nof-menuitems > .nof-submenu").filter( -> $(this).css('display') == 'block' ).length, 1, "sales person sub menu"	
				equal $("#SalesTerritory > .nof-object > .nof-menu > .nof-menuitems > .nof-submenu").filter( -> $(this).css('display') == 'block' ).length, 0, "sales territory sub menu"
				
				# find menus items 

				equal $("#SalesPerson > .nof-object > .nof-menu > .nof-menuitems > .nof-submenu > .nof-submenuitems > .nof-action").length, 3, "sales person sub menu items"	
		
				start()
	
	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "maximize/minimize object", -> 

	expect 8

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#SalesPerson .nof-maximize').click()

		waitForChange (-> $('#SalesPerson .nof-property').length >= 10), -> 
			equal $('#SalesPerson .nof-maximize').css('display'), 'none', "sales person max display"
			notEqual $('#SalesPerson .nof-minimize').css('display'), 'none', "sales person min display"

			equal $('#SalesPerson .nof-property').length, 10, "sales person properties"

			$('#SalesPerson .nof-minimize').click()

			waitForChange (-> $('#SalesPerson .nof-property').length == 0), -> 
				notEqual $('#SalesPerson .nof-maximize').css('display'), 'none', "sales person max display"
				equal $('#SalesPerson .nof-minimize').css('display'), 'none', "sales person min display"

				equal $('#SalesPerson .nof-property').length, 0, "sales no person properties"
				start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "maximize/minimize nested object", -> 

	expect 11

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#SalesPerson .nof-maximize').click()

		waitForChange (-> $('#SalesPerson .nof-property').length >= 10), -> 
			equal $('#SalesPerson .nof-maximize').css('display'), 'none', "sales person max display"
			notEqual $('#SalesPerson .nof-minimize').css('display'), 'none', "sales person min display"

			equal $('#SalesPerson .nof-property').length, 10, "sales person properties"

			$('#Employee .nof-maximize').click()

			waitForChange (->  $('#Employee .nof-property').length >= 17), -> 
				equal $('#Employee .nof-maximize').css('display'), 'none', "employee max display"
				notEqual $('#Employee .nof-minimize').css('display'), 'none', "employee min display"

				equal $('#Employee .nof-property').length, 17, "employee properties"
				
				$('#Employee .nof-minimize').click()

				waitForChange (->  $('#Employee .nof-property').length == 0), -> 
					notEqual $('#Employee .nof-maximize').css('display'), 'none', "employee max display"
					equal $('#Employee .nof-minimize').css('display'), 'none', "employee min display"

					equal $('#Employee .nof-property').length, 0, "employee no person properties"
					start()



	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()


asyncTest "list/table/summary collection", -> 

	expect 14

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#Addresses .nof-list').click()

		waitForChange (-> $('#Addresses tr').length > 0), -> 
			notEqual $('#Addresses .nof-summary').css('display'), 'none', "addresses summary display"
			equal $('#Addresses .nof-list').css('display'), 'none', "addresses list display"
			notEqual $('#Addresses .nof-table').css('display'), 'none', "addresses table display"

			ok $('#Addresses tr').length > 0, "addresses list display"

			$('#Addresses .nof-table').click()

			waitForChange (-> $('#Addresses tr').length > 1), -> 
				notEqual $('#Addresses .nof-summary').css('display'), 'none', "addresses summary display"
				notEqual $('#Addresses .nof-list').css('display'), 'none', "addresses list display"
				equal $('#Addresses .nof-table').css('display'), 'none', "addresses table display"

				ok $('#Addresses tr').length > 1, "addresses table display"

				$('#Addresses .nof-summary').click()

				waitForChange (-> $('#Addresses tr').length == 0), -> 
					equal $('#Addresses .nof-summary').css('display'), 'none', "addresses summary display"
					notEqual $('#Addresses .nof-list').css('display'), 'none', "addresses list display"
					notEqual $('#Addresses .nof-table').css('display'), 'none', "addresses table display"

					ok $('#Addresses tr').length == 0, "addresses summary display"

					start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "list/table/summary nested collection", -> 

	expect 16

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#SalesTerritory .nof-maximize').click()

		waitForChange (-> ($('#StateProvince .nof-list').length > 0) &&  ($('#StateProvince .nof-list').css('display') != 'none')), ->

			$('#StateProvince .nof-list').click()

			waitForChange (->  ($('#StateProvince .nof-list').css('display') == 'none') && ($('#StateProvince div.nof-collection-list > table > tbody >  tr:first > td').length > 0)), -> 
				notEqual $('#StateProvince .nof-summary').css('display'), 'none', "stateprovince summary display"
				equal $('#StateProvince .nof-list').css('display'), 'none', "stateprovince list display"
				notEqual $('#StateProvince .nof-table').css('display'), 'none', "stateprovince table display"

				ok $('#StateProvince div.nof-collection-list > table > tbody > tr').length > 0, "stateprovince list display tr"
				equal $('#StateProvince div.nof-collection-list > table > tbody > tr:first > td').length, 1, "stateprovince list display td"

				$('#StateProvince .nof-table').click()

				waitForChange (-> $('#StateProvince div.nof-collection-table > table > tbody > tr:nth(1) > td').length > 6), -> 
					notEqual $('#StateProvince .nof-summary').css('display'), 'none', "stateprovince summary display"
					notEqual $('#StateProvince .nof-list').css('display'), 'none', "stateprovince list display"
					equal $('#StateProvince .nof-table').css('display'), 'none', "stateprovince table display"

					ok $('#StateProvince div.nof-collection-table > table > tbody > tr').length > 1, "stateprovince table display tr"
					equal $('#StateProvince div.nof-collection-table > table > tbody > tr:nth(1) > td').length, 7, "stateprovince table display td"

					$('#StateProvince .nof-summary').click()

					waitForChange (-> $('#StateProvince tr').length == 0), -> 
						equal $('#StateProvince .nof-summary').css('display'), 'none', "stateprovince summary display"
						notEqual $('#StateProvince .nof-list').css('display'), 'none', "stateprovince list display"
						notEqual $('#StateProvince .nof-table').css('display'), 'none', "stateprovince table display"

						equal $('#StateProvince tr').length, 0, "stateprovince summary display"

						start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "reference link", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
		
		title = $('#SalesPerson a').text()
		$('#SalesPerson a').click()

		waitForChange (-> $('.nof-objectview > .nof-object').text() == title), ->
			equal $(".nof-objectview").length, 1, "object view"
			equal $('.nof-objectview > .nof-object').text(), title, "object title"
			start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()
	
asyncTest "reference link nested", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#SalesPerson .nof-maximize').click()

		waitForChange (-> $('#Employee a').text() != ""), -> 
			title = $('#Employee a').text()
			$('#Employee a').click()

			waitForChange (-> $('.nof-objectview > .nof-object').text() == title), -> 
				equal $(".nof-objectview").length, 1, "object view"
				equal $('.nof-objectview > .nof-object').text(), title, "object title"
				start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "list link", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#Addresses .nof-list').click()

		waitForChange (-> ($('#Addresses .nof-list').css('display') == 'none') && ($('.nof-collection-list .nof-object:first  a').text())), -> 
			link =  $('.nof-collection-list .nof-object:first  a')

			title = link.text()
			link.click()

			waitForChange (-> $('.nof-objectview > .nof-object').text() == title), -> 
				equal $(".nof-objectview").length, 1, "object view"
				equal $('.nof-objectview > .nof-object').text(), title, "object title"
				start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "list link nested", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#SalesTerritory .nof-maximize').click()

		waitForChange (-> ($('#StateProvince .nof-list').length > 0) && $('#SalesTerritory .nof-maximize').css('display') == 'none'), -> 

			$('#StateProvince .nof-list').click()

			waitForChange (->  ($('#StateProvince tr').length > 0) && ($('#StateProvince a:first').text() != "")), -> 

				title = $('#StateProvince a:first').text()
				$('#StateProvince a:first').click()

				waitForChange (-> $('.nof-objectview > .nof-object').text() == title), -> 
					equal $(".nof-objectview").length, 1, "object view"
					equal $('.nof-objectview > .nof-object').text(), title, "object title"
					start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "table link", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#Addresses .nof-table').click()

		waitForChange (-> $('.nof-collection-table .nof-object:first  a').text() != ""), -> 
			link =  $('.nof-collection-table .nof-object:first  a')

			title = link.text()
			link.click()

			waitForChange (-> $('.nof-objectview > .nof-object').text() == title), -> 
				equal $(".nof-objectview").length, 1, "object view"
				equal $('.nof-objectview > .nof-object').text(), title, "object title"
				start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "table link nested", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#SalesTerritory .nof-maximize').click()

		waitForChange (-> ($('#StateProvince .nof-table').length > 0) && $('#SalesTerritory .nof-maximize').css('display') == 'none'), -> 

			$('#StateProvince .nof-table').click()

			waitForChange (->  ($('#StateProvince tr').length > 0) && ($('#StateProvince a:first').text())), -> 
				link = $('#StateProvince a:first')

				title = link.text()
				link.click()

				waitForChange (-> $('.nof-objectview > .nof-object').text() == title), -> 
					equal $(".nof-objectview").length, 1, "object view"
					equal $('.nof-objectview > .nof-object').text(), title, "object title"
					start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "table ref link", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#Addresses .nof-table').click()

		waitForChange (-> $('.nof-collection-table .nof-object:last  a').text() != ""), -> 
			link =  $('.nof-collection-table .nof-object:last  a')

			title = link.text()
			link.click()

			waitForChange (-> $('.nof-objectview > .nof-object').text() == title), -> 
				equal $(".nof-objectview").length, 1, "object view"
				equal $('.nof-objectview > .nof-object').text(), title, "object title"
				start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "table ref link nested", -> 

	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		equal $(".nof-objectview").length, 1, "object view"
	
		$('#SalesTerritory .nof-maximize').click()

		waitForChange (-> ($('#StateProvince .nof-table').length > 0) && ($('#SalesTerritory .nof-maximize').css('display') == 'none')), -> 

			$('#StateProvince .nof-table').click()

			waitForChange (-> $('#StateProvince a:last').text() != ""), -> 
				link = $('#StateProvince a:last')

				title = link.text()
				link.click()

				waitForChange (-> $('.nof-objectview > .nof-object').text() == title), -> 
					equal $(".nof-objectview").length, 1, "object view"
					equal $('.nof-objectview > .nof-object').text(), title, "object title"
					start()

	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "successful scalar change and save", ->
	expect 4

	waitForChange (-> $("#main").children().length > 0), -> 
		
		equal $(".nof-objectview").length, 1, "object view" 
		equal $(".nof-objectedit").length, 0, "no object edit" 

		$('.nof-edit').click()

		waitForChange (-> $(".nof-save").length > 0), ->
			input = $("#Name input")
			oldName = input.val()
			newName = oldName + "saved"
			input.val newName

			$('.nof-save').click()

			waitForChange (-> $(".nof-objectview").length > 0), ->

				equal $("#Name > div.nof-value").text(), newName, "test changed name"

				start()
	
	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()

asyncTest "successful reference change and save", ->
	expect 7

	waitForChange (-> $("#main").children().length > 0), -> 
		
		equal $(".nof-objectview").length, 1, "object view" 
		equal $(".nof-objectedit").length, 0, "no object edit" 

		$('.nof-edit').click()

		waitForChange (-> $(".nof-save").length > 0), ->
			
			equal $("#SalesPerson > .nof-object > a").length, 1, "sales person link"

			# remove old value 

			$("#SalesPerson button.nof-remove").click()

			waitForChange (-> $("#SalesPerson > .nof-object > a").length == 0 && $("#SalesPerson button:contains('Random Sales Person')").length  == 1), ->

				equal $("#SalesPerson > .nof-object > a").length, 0, "no sales person link"

				# add random 

				$("#SalesPerson button:contains('Random Sales Person')").click()

				waitForChange (-> $("#SalesPerson > .nof-object > a").length > 0), ->

					equal $("#SalesPerson > .nof-object > a").length, 1, "sales person link"
					newName = $("#SalesPerson > .nof-object > a").text()

					$('.nof-save').click()

					waitForChange (-> $(".nof-objectview").length > 0), ->

						equal $("#SalesPerson > .nof-object > a").text(), newName, "test changed sales person"
						start()
	
	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()	

asyncTest "Mandatory field indication in object edit", ->
	expect 6

	waitForChange (-> $(".nof-objectview").length > 0), -> 
		
		equal $(".nof-objectview").length, 1, "object view" 
		equal $(".nof-objectedit").length, 0, "no object edit" 
		equal $("span.nof-mandatory-field-indicator").length, 0, "No mandatory field indicators in object View"

		$('.nof-edit').click()

		waitForChange (-> $(".nof-save").length > 0), ->

			equal $("#Name span.nof-mandatory-field-indicator").text(), "*", "Name field has mandatory indicator"
			equal $("#Color span.nof-mandatory-field-indicator").length, 0, "Color field has no mandatory indicator"
			start()
	
	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomProduct > div > button").click()


asyncTest "attempt save with empty mandatory field", ->
	expect 6

	waitForChange (-> $("#main").children().length > 0), -> 
		
		equal $(".nof-objectview").length, 1, "object view" 
		equal $(".nof-objectedit").length, 0, "no object edit" 

		$('.nof-edit').click()

		waitForChange (-> $(".nof-save").length > 0), ->

			input = $("#Name input")
			input.val ""
			$('.nof-save').click()

			waitForChange (-> $("span.field-validation-error").length > 0), ->

				equal $(".nof-objectedit").length, 1, "still edit view" 
				equal $(".nof-objectview").length, 0, "not object view" 
				equal $("span.field-validation-error").text(),"Mandatory", "Mandatory word next to field"
				start()
	
	equal $(".nof-objectview").length, 0, "no object view"
	$("form#RandomStore > div > button").click()	
