
/*
/// <reference path="apppath.js"/>
/// <reference path="jquery-1.7.2.js"/>
/// <reference path="underscore.js"/>
/// <reference path="backbone.js"/>
/// <reference path="jsrender.js"/>
/// <reference path="spiro-templates.js"/>
/// <reference path="spiro-models.js"/>
*/


(function() {
  var waitForChange;

  module("Spiro Classic View Tests");

  waitForChange = function(change, execute, count) {
    count = count != null ? count : 1000;
    return setTimeout((function() {
      if (change() || count <= 0) {
        return execute();
      } else {
        return waitForChange(change, execute, --count);
      }
    }), 10);
  };

  asyncTest("Home page view", function() {
    expect(11);
    return waitForChange((function() {
      return $(".nof-servicelist > .nof-menu").length >= 10;
    }), function() {
      var serviceNames, services, sn, _i, _len;
      services = $(".nof-servicelist > .nof-menu");
      equal(services.length, 10, "services count");
      serviceNames = ["Customers", "Orders", "Products", "Employees", "Sales", "Special Offers", "Contacts", "Vendors", "Purchase Orders", "Work Orders"];
      for (_i = 0, _len = serviceNames.length; _i < _len; _i++) {
        sn = serviceNames[_i];
        equal($(services).find(".nof-menuname").filter(function() {
          return $(this).text() === sn;
        }).length, 1, sn);
      }
      return start();
    });
  });

  asyncTest("Invoke no parm service action", function() {
    expect(2);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      return start();
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("Action with params has elipsis", function() {
    expect(2);
    equal($("form#RandomStore > div > button").text(), "Random Store", "Action without params has no elipsis");
    equal($("form#FindStoreByName > div > button").text(), "Find Store By Name...", "Action with params has elipsis");
    return start();
  });

  asyncTest("Get dialog for parm service action", function() {
    expect(3);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 0, "no object view");
      equal($(".nof-actiondialog").length, 1, "action dialog");
      return start();
    });
    equal($(".nof-actiondialog").length, 0, "no action dialog");
    return $("form#FindStoreByName > div > button").click();
  });

  asyncTest("Mandatory Parameter Indicators", function() {
    expect(5);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 0, "no object view");
      equal($(".nof-actiondialog").length, 1, "action dialog");
      equal($("#lastName span.nof-mandatory-field-indicator").text(), "*", "Last Name param has mandatory indicator");
      equal($("#firstName span.nof-mandatory-field-indicator").length, 0, "First Name param has no mandatory indicator");
      return start();
    });
    equal($(".nof-actiondialog").length, 0, "no action dialog");
    return $("form#FindEmployeeByName > div > button").click();
  });

  asyncTest("Mandatory param left blank", function() {
    expect(5);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      var input;
      equal($(".nof-objectview").length, 0, "no object view");
      equal($(".nof-actiondialog").length, 1, "action dialog");
      input = $("#Name input");
      input.val("");
      $('.nof-ok').click();
      return waitForChange((function() {
        return $("span.field-validation-error").length > 0;
      }), function() {
        equal($(".nof-actiondialog").length, 1, "still in action dialog");
        equal($("span.field-validation-error").text(), "Mandatory", "Mandatory word next to param");
        return start();
      });
    });
    equal($(".nof-actiondialog").length, 0, "no action dialog");
    return $("form#FindStoreByName > div > button").click();
  });

  asyncTest("Invoke parm service action", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      var input;
      equal($(".nof-objectview").length, 0, "no object view");
      equal($(".nof-actiondialog").length, 1, "action dialog");
      input = $("#name input");
      input.val("roadway");
      $('.nof-ok').click();
      return waitForChange((function() {
        return $(".nof-standalonetable").length > 0;
      }), function() {
        equal($(".nof-collection-table").length, 1, "Returns table");
        return start();
      });
    });
    equal($(".nof-actiondialog").length, 0, "no action dialog");
    return $("form#FindStoreByName > div > button").click();
  });

  asyncTest("view object", function() {
    expect(20);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      var actionName, propName, _i, _j, _len, _len1, _ref, _ref1;
      equal($(".nof-objectview").length, 1, "object view");
      equal($(".nof-objectview > .nof-menu").length, 1, "object menu");
      equal($(".nof-objectview .nof-menuitems > form").length, 7, "object menu items");
      equal($(".nof-objectview .nof-propertylist > .nof-property").length, 8, "object properties");
      _ref = ["Create New Address", "Create New Contact", "Create New Order", "Search For Orders", "Last Order", "Open Orders", "Recent Orders"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        actionName = _ref[_i];
        equal($(".nof-objectview .nof-menuitems > form").find("button").filter(function() {
          return $(this).text() === actionName;
        }).length, 1, actionName);
      }
      _ref1 = ["Store Name", "Demographics", "Sales Person", "Last Modified", "Account Number", "Addresses", "Contacts", "Sales Territory"];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        propName = _ref1[_j];
        equal($(".nof-objectview .nof-propertylist > .nof-property").find("label").filter(function() {
          return $(this).text() === propName;
        }).length, 1, propName);
      }
      return start();
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("edit object", function() {
    expect(34);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      equal($(".nof-objectedit").length, 0, "no object edit");
      $('.nof-edit').click();
      return waitForChange((function() {
        return $(".nof-save").length > 0;
      }), function() {
        var propName, _i, _len, _ref;
        equal($(".nof-objectview").length, 0, "no object view");
        equal($(".nof-objectedit").length, 1, "object edit");
        equal($(".nof-objectedit > .nof-menu").length, 0, "no object menu");
        equal($(".nof-objectedit .nof-propertylist > .nof-property").length, 8, "object properties");
        _ref = ["Store Name", "Demographics", "Sales Person", "Last Modified", "Account Number", "Addresses", "Contacts", "Sales Territory"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          propName = _ref[_i];
          equal($(".nof-objectedit .nof-propertylist > .nof-property").find("label").filter(function() {
            return $(this).text() === propName;
          }).length, 1, propName);
        }
        equal($("#Name > .nof-value :input").length, 1, "name input");
        equal($("#FormattedDemographics > .nof-value :input").length, 0, "demographics  input");
        equal($("#SalesPerson > .nof-value :input").length, 0, "sales person input");
        equal($("#ModifiedDate > .nof-value :input").length, 0, "modified date input");
        equal($("#AccountNumber > .nof-value :input").length, 0, "account number input");
        equal($("#Addresses > .nof-value :input").length, 0, "addresses input");
        equal($("#Contacts > .nof-value :input").length, 0, "contacts input");
        equal($("#SalesTerritory > .nof-value :input").length, 0, "sales territory input");
        waitForChange((function() {
          return $(".nof-menu").length >= 2;
        }), function() {
          equal($("#Name > .nof-object > .nof-menu").length, 0, "name menu");
          equal($("#FormattedDemographics > .nof-object > nof-menu").length, 0, "demographics  menu");
          equal($("#SalesPerson > .nof-object > .nof-menu").length, 1, "sales person menu");
          equal($("#ModifiedDate > .nof-object > .nof-menu").length, 0, "modified date menu");
          equal($("#AccountNumber > .nof-object > .nof-menu").length, 0, "account number menu");
          equal($("#Addresses > .nof-object > .nof-menu").length, 0, "addresses menu");
          equal($("#Contacts > .nof-object > .nof-menu").length, 0, "contacts menu");
          return equal($("#SalesTerritory > .nof-object > .nof-menu").length, 1, "sales territory menu");
        });
        return waitForChange((function() {
          return $("#SalesPerson > .nof-object > .nof-menu > .nof-menuitems > .nof-submenu > .nof-submenuitems > .nof-action").length >= 3;
        }), function() {
          equal($("#SalesPerson > .nof-object > .nof-menu > .nof-menuitems > .nof-submenu").filter(function() {
            return $(this).css('display') === 'block';
          }).length, 1, "sales person sub menu");
          equal($("#SalesTerritory > .nof-object > .nof-menu > .nof-menuitems > .nof-submenu").filter(function() {
            return $(this).css('display') === 'block';
          }).length, 0, "sales territory sub menu");
          equal($("#SalesPerson > .nof-object > .nof-menu > .nof-menuitems > .nof-submenu > .nof-submenuitems > .nof-action").length, 3, "sales person sub menu items");
          return start();
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("maximize/minimize object", function() {
    expect(8);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#SalesPerson .nof-maximize').click();
      return waitForChange((function() {
        return $('#SalesPerson .nof-property').length >= 10;
      }), function() {
        equal($('#SalesPerson .nof-maximize').css('display'), 'none', "sales person max display");
        notEqual($('#SalesPerson .nof-minimize').css('display'), 'none', "sales person min display");
        equal($('#SalesPerson .nof-property').length, 10, "sales person properties");
        $('#SalesPerson .nof-minimize').click();
        return waitForChange((function() {
          return $('#SalesPerson .nof-property').length === 0;
        }), function() {
          notEqual($('#SalesPerson .nof-maximize').css('display'), 'none', "sales person max display");
          equal($('#SalesPerson .nof-minimize').css('display'), 'none', "sales person min display");
          equal($('#SalesPerson .nof-property').length, 0, "sales no person properties");
          return start();
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("maximize/minimize nested object", function() {
    expect(11);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#SalesPerson .nof-maximize').click();
      return waitForChange((function() {
        return $('#SalesPerson .nof-property').length >= 10;
      }), function() {
        equal($('#SalesPerson .nof-maximize').css('display'), 'none', "sales person max display");
        notEqual($('#SalesPerson .nof-minimize').css('display'), 'none', "sales person min display");
        equal($('#SalesPerson .nof-property').length, 10, "sales person properties");
        $('#Employee .nof-maximize').click();
        return waitForChange((function() {
          return $('#Employee .nof-property').length >= 17;
        }), function() {
          equal($('#Employee .nof-maximize').css('display'), 'none', "employee max display");
          notEqual($('#Employee .nof-minimize').css('display'), 'none', "employee min display");
          equal($('#Employee .nof-property').length, 17, "employee properties");
          $('#Employee .nof-minimize').click();
          return waitForChange((function() {
            return $('#Employee .nof-property').length === 0;
          }), function() {
            notEqual($('#Employee .nof-maximize').css('display'), 'none', "employee max display");
            equal($('#Employee .nof-minimize').css('display'), 'none', "employee min display");
            equal($('#Employee .nof-property').length, 0, "employee no person properties");
            return start();
          });
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("list/table/summary collection", function() {
    expect(14);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#Addresses .nof-list').click();
      return waitForChange((function() {
        return $('#Addresses tr').length > 0;
      }), function() {
        notEqual($('#Addresses .nof-summary').css('display'), 'none', "addresses summary display");
        equal($('#Addresses .nof-list').css('display'), 'none', "addresses list display");
        notEqual($('#Addresses .nof-table').css('display'), 'none', "addresses table display");
        ok($('#Addresses tr').length > 0, "addresses list display");
        $('#Addresses .nof-table').click();
        return waitForChange((function() {
          return $('#Addresses tr').length > 1;
        }), function() {
          notEqual($('#Addresses .nof-summary').css('display'), 'none', "addresses summary display");
          notEqual($('#Addresses .nof-list').css('display'), 'none', "addresses list display");
          equal($('#Addresses .nof-table').css('display'), 'none', "addresses table display");
          ok($('#Addresses tr').length > 1, "addresses table display");
          $('#Addresses .nof-summary').click();
          return waitForChange((function() {
            return $('#Addresses tr').length === 0;
          }), function() {
            equal($('#Addresses .nof-summary').css('display'), 'none', "addresses summary display");
            notEqual($('#Addresses .nof-list').css('display'), 'none', "addresses list display");
            notEqual($('#Addresses .nof-table').css('display'), 'none', "addresses table display");
            ok($('#Addresses tr').length === 0, "addresses summary display");
            return start();
          });
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("list/table/summary nested collection", function() {
    expect(16);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#SalesTerritory .nof-maximize').click();
      return waitForChange((function() {
        return ($('#StateProvince .nof-list').length > 0) && ($('#StateProvince .nof-list').css('display') !== 'none');
      }), function() {
        $('#StateProvince .nof-list').click();
        return waitForChange((function() {
          return ($('#StateProvince .nof-list').css('display') === 'none') && ($('#StateProvince div.nof-collection-list > table > tbody >  tr:first > td').length > 0);
        }), function() {
          notEqual($('#StateProvince .nof-summary').css('display'), 'none', "stateprovince summary display");
          equal($('#StateProvince .nof-list').css('display'), 'none', "stateprovince list display");
          notEqual($('#StateProvince .nof-table').css('display'), 'none', "stateprovince table display");
          ok($('#StateProvince div.nof-collection-list > table > tbody > tr').length > 0, "stateprovince list display tr");
          equal($('#StateProvince div.nof-collection-list > table > tbody > tr:first > td').length, 1, "stateprovince list display td");
          $('#StateProvince .nof-table').click();
          return waitForChange((function() {
            return $('#StateProvince div.nof-collection-table > table > tbody > tr:nth(1) > td').length > 6;
          }), function() {
            notEqual($('#StateProvince .nof-summary').css('display'), 'none', "stateprovince summary display");
            notEqual($('#StateProvince .nof-list').css('display'), 'none', "stateprovince list display");
            equal($('#StateProvince .nof-table').css('display'), 'none', "stateprovince table display");
            ok($('#StateProvince div.nof-collection-table > table > tbody > tr').length > 1, "stateprovince table display tr");
            equal($('#StateProvince div.nof-collection-table > table > tbody > tr:nth(1) > td').length, 7, "stateprovince table display td");
            $('#StateProvince .nof-summary').click();
            return waitForChange((function() {
              return $('#StateProvince tr').length === 0;
            }), function() {
              equal($('#StateProvince .nof-summary').css('display'), 'none', "stateprovince summary display");
              notEqual($('#StateProvince .nof-list').css('display'), 'none', "stateprovince list display");
              notEqual($('#StateProvince .nof-table').css('display'), 'none', "stateprovince table display");
              equal($('#StateProvince tr').length, 0, "stateprovince summary display");
              return start();
            });
          });
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("reference link", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      var title;
      equal($(".nof-objectview").length, 1, "object view");
      title = $('#SalesPerson a').text();
      $('#SalesPerson a').click();
      return waitForChange((function() {
        return $('.nof-objectview > .nof-object').text() === title;
      }), function() {
        equal($(".nof-objectview").length, 1, "object view");
        equal($('.nof-objectview > .nof-object').text(), title, "object title");
        return start();
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("reference link nested", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#SalesPerson .nof-maximize').click();
      return waitForChange((function() {
        return $('#Employee a').text() !== "";
      }), function() {
        var title;
        title = $('#Employee a').text();
        $('#Employee a').click();
        return waitForChange((function() {
          return $('.nof-objectview > .nof-object').text() === title;
        }), function() {
          equal($(".nof-objectview").length, 1, "object view");
          equal($('.nof-objectview > .nof-object').text(), title, "object title");
          return start();
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("list link", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#Addresses .nof-list').click();
      return waitForChange((function() {
        return ($('#Addresses .nof-list').css('display') === 'none') && ($('.nof-collection-list .nof-object:first  a').text());
      }), function() {
        var link, title;
        link = $('.nof-collection-list .nof-object:first  a');
        title = link.text();
        link.click();
        return waitForChange((function() {
          return $('.nof-objectview > .nof-object').text() === title;
        }), function() {
          equal($(".nof-objectview").length, 1, "object view");
          equal($('.nof-objectview > .nof-object').text(), title, "object title");
          return start();
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("list link nested", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#SalesTerritory .nof-maximize').click();
      return waitForChange((function() {
        return ($('#StateProvince .nof-list').length > 0) && $('#SalesTerritory .nof-maximize').css('display') === 'none';
      }), function() {
        $('#StateProvince .nof-list').click();
        return waitForChange((function() {
          return ($('#StateProvince tr').length > 0) && ($('#StateProvince a:first').text() !== "");
        }), function() {
          var title;
          title = $('#StateProvince a:first').text();
          $('#StateProvince a:first').click();
          return waitForChange((function() {
            return $('.nof-objectview > .nof-object').text() === title;
          }), function() {
            equal($(".nof-objectview").length, 1, "object view");
            equal($('.nof-objectview > .nof-object').text(), title, "object title");
            return start();
          });
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("table link", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#Addresses .nof-table').click();
      return waitForChange((function() {
        return $('.nof-collection-table .nof-object:first  a').text() !== "";
      }), function() {
        var link, title;
        link = $('.nof-collection-table .nof-object:first  a');
        title = link.text();
        link.click();
        return waitForChange((function() {
          return $('.nof-objectview > .nof-object').text() === title;
        }), function() {
          equal($(".nof-objectview").length, 1, "object view");
          equal($('.nof-objectview > .nof-object').text(), title, "object title");
          return start();
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("table link nested", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#SalesTerritory .nof-maximize').click();
      return waitForChange((function() {
        return ($('#StateProvince .nof-table').length > 0) && $('#SalesTerritory .nof-maximize').css('display') === 'none';
      }), function() {
        $('#StateProvince .nof-table').click();
        return waitForChange((function() {
          return ($('#StateProvince tr').length > 0) && ($('#StateProvince a:first').text());
        }), function() {
          var link, title;
          link = $('#StateProvince a:first');
          title = link.text();
          link.click();
          return waitForChange((function() {
            return $('.nof-objectview > .nof-object').text() === title;
          }), function() {
            equal($(".nof-objectview").length, 1, "object view");
            equal($('.nof-objectview > .nof-object').text(), title, "object title");
            return start();
          });
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("table ref link", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#Addresses .nof-table').click();
      return waitForChange((function() {
        return $('.nof-collection-table .nof-object:last  a').text() !== "";
      }), function() {
        var link, title;
        link = $('.nof-collection-table .nof-object:last  a');
        title = link.text();
        link.click();
        return waitForChange((function() {
          return $('.nof-objectview > .nof-object').text() === title;
        }), function() {
          equal($(".nof-objectview").length, 1, "object view");
          equal($('.nof-objectview > .nof-object').text(), title, "object title");
          return start();
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("table ref link nested", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      $('#SalesTerritory .nof-maximize').click();
      return waitForChange((function() {
        return ($('#StateProvince .nof-table').length > 0) && ($('#SalesTerritory .nof-maximize').css('display') === 'none');
      }), function() {
        $('#StateProvince .nof-table').click();
        return waitForChange((function() {
          return $('#StateProvince a:last').text() !== "";
        }), function() {
          var link, title;
          link = $('#StateProvince a:last');
          title = link.text();
          link.click();
          return waitForChange((function() {
            return $('.nof-objectview > .nof-object').text() === title;
          }), function() {
            equal($(".nof-objectview").length, 1, "object view");
            equal($('.nof-objectview > .nof-object').text(), title, "object title");
            return start();
          });
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("successful scalar change and save", function() {
    expect(4);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      equal($(".nof-objectedit").length, 0, "no object edit");
      $('.nof-edit').click();
      return waitForChange((function() {
        return $(".nof-save").length > 0;
      }), function() {
        var input, newName, oldName;
        input = $("#Name input");
        oldName = input.val();
        newName = oldName + "saved";
        input.val(newName);
        $('.nof-save').click();
        return waitForChange((function() {
          return $(".nof-objectview").length > 0;
        }), function() {
          equal($("#Name > div.nof-value").text(), newName, "test changed name");
          return start();
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("successful reference change and save", function() {
    expect(7);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      equal($(".nof-objectedit").length, 0, "no object edit");
      $('.nof-edit').click();
      return waitForChange((function() {
        return $(".nof-save").length > 0;
      }), function() {
        equal($("#SalesPerson > .nof-object > a").length, 1, "sales person link");
        $("#SalesPerson button.nof-remove").click();
        return waitForChange((function() {
          return $("#SalesPerson > .nof-object > a").length === 0 && $("#SalesPerson button:contains('Random Sales Person')").length === 1;
        }), function() {
          equal($("#SalesPerson > .nof-object > a").length, 0, "no sales person link");
          $("#SalesPerson button:contains('Random Sales Person')").click();
          return waitForChange((function() {
            return $("#SalesPerson > .nof-object > a").length > 0;
          }), function() {
            var newName;
            equal($("#SalesPerson > .nof-object > a").length, 1, "sales person link");
            newName = $("#SalesPerson > .nof-object > a").text();
            $('.nof-save').click();
            return waitForChange((function() {
              return $(".nof-objectview").length > 0;
            }), function() {
              equal($("#SalesPerson > .nof-object > a").text(), newName, "test changed sales person");
              return start();
            });
          });
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

  asyncTest("Mandatory field indication in object edit", function() {
    expect(6);
    waitForChange((function() {
      return $(".nof-objectview").length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      equal($(".nof-objectedit").length, 0, "no object edit");
      equal($("span.nof-mandatory-field-indicator").length, 0, "No mandatory field indicators in object View");
      $('.nof-edit').click();
      return waitForChange((function() {
        return $(".nof-save").length > 0;
      }), function() {
        equal($("#Name span.nof-mandatory-field-indicator").text(), "*", "Name field has mandatory indicator");
        equal($("#Color span.nof-mandatory-field-indicator").length, 0, "Color field has no mandatory indicator");
        return start();
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomProduct > div > button").click();
  });

  asyncTest("attempt save with empty mandatory field", function() {
    expect(6);
    waitForChange((function() {
      return $("#main").children().length > 0;
    }), function() {
      equal($(".nof-objectview").length, 1, "object view");
      equal($(".nof-objectedit").length, 0, "no object edit");
      $('.nof-edit').click();
      return waitForChange((function() {
        return $(".nof-save").length > 0;
      }), function() {
        var input;
        input = $("#Name input");
        input.val("");
        $('.nof-save').click();
        return waitForChange((function() {
          return $("span.field-validation-error").length > 0;
        }), function() {
          equal($(".nof-objectedit").length, 1, "still edit view");
          equal($(".nof-objectview").length, 0, "not object view");
          equal($("span.field-validation-error").text(), "Mandatory", "Mandatory word next to field");
          return start();
        });
      });
    });
    equal($(".nof-objectview").length, 0, "no object view");
    return $("form#RandomStore > div > button").click();
  });

}).call(this);
