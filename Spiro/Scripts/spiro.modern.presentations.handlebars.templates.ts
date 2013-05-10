// ABOUT THIS FILE:
// spiro.modern.presentations.handlebars.templates contains the definitions for all the Handlebars templates
// that generate all the html rendered in the browser (other than the static html contained in the main
// 'Modern' page itself).


/// <reference path="typings/handlebars/handlebars.d.ts" />

module Spiro.Modern.HandlebarsTemplating {


    var listTemplate = "<div class ='list-view'>" +
                       "<div class='title'>{{collectionSize}}-{{collectionPlural}}{{> cancel}}{{> table}}</div>" +
                       "<div class='items' />" +
                       "</div>";


    var serviceLinkTemplate = "<div class='service bg-color-{{backgroundColor}} clickable-area'>" +
                                "<a href='{{serviceUrl}}' class='fg-color-{{foregroundColor}}'><span></span>{{serviceName}}</a>" +
                                "</div>";

    var actionTemplate = "<div class='action-button clickable-area'><a class='action' href=''><span></span>{{actionName}}</a></div>";

    var referencePropertyTemplate = "<div class='property'>" + 
                                    "<div class='property-name'>{{propertyName}}:</div>" +
                                    "<div class='property-reference bg-color-{{backgroundColor}} clickable-area' >" +
                                    "<a href='{{propertyUrl}}'><span></span>{{propertyValue}}</a>" +
                                    "</div>" +
                                    "</div>";

    var referencePropertyEditTemplate = "<div class='property'>" +
                                       "<div class='property-name'>{{propertyName}}</div>" +
                                       "<div class='property-value input-control text'>" +
                                       "<input type='hidden' value='{{propertyUrl}}' />" + 
                                       "<input type='text'  value='{{propertyValue}}'  placeholder='{{propertyValue}}' />" +
                                       "</div>" +
                                       "<div class='error'>{{propertyError}}</div>" +
                                       "</div>";


    var scalarPropertyEditTemplate = "<div class='property'>" +
                                    "<div class='property-name'>{{propertyName}}</div>" +
                                    "<div class='property-value input-control text'>" +
                                    "<input type='text'  value='{{propertyValue}}'  placeholder='{{propertyValue}}' />" + 
                                    "</div>" +
                                    "<div class='error'>{{propertyError}}</div>" +
                                    "</div>";

    var boolPropertyTemplate = "<div class='property'>" +
                              "<div class='property-name'>{{propertyName}}</div>" +
                              "<div class='property-value input-control text'>" +
                              "<input type='checkbox' value='{{propertyValue}}'/>" +
                              "{{propertyError}}" +
                              "</div>" +
                              "</div>";

    var datePropertyTemplate = "<div class='property'>" +
                                "<div class='property-name'>{{propertyName}}</div>" +
                                "<div class='property-value input-control text'>" +
                                "<input type='date' value='{{propertyValue}}'/>" +
                                "{{propertyError}}" +
                                "</div>" +
                                "</div>";



    var scalarPropertyTemplate = "<div class='property'>" +
                                "<div class='property-name bg-color-{{backgroundColor}}'>{{propertyName}}:</div>" +
                                "<div class='property-value'>{{propertyValue}}</div>" +
                                "</div>";

    var collectionPropertyTemplate = "<div class='property'>" +
                                    "<div class='property-name'>{{collectionName}}:</div>" +
                                    "<div class='property-collection clickable-area'>" +
                                    "<a href='{{collectionUrl}}'><span></span><i class='icon-plus' />{{collectionSize}}-{{collectionPlural}}</a>" +
                                    "</div>" +
                                    "</div>";

    var choicePropertyTemplate = "<option value='{{ChoiceValue}}'>{{ChoiceName}}</option>";

    var choicesPropertyTemplate = "<div class='property'>" +
                                    "<div class='property-name'>{{propertyName}}</div>" +
                                    "<div class='property-value input-control text'>" +
                                    "<select></select>" +
                                    "{{propertyError}}" +
                                    "</div>" +
                                    "</div>";

    var choiceParameterTemplate = "<option value='{{ChoiceValue}}'>{{ChoiceName}}</option>";

    var choicesParameterTemplate = "<div class='parameter'>" + 
                                    "<div class='parameter-name'>{{parameterName}}</div>" + 
                                    "<div class='parameter-value input-control text'>" + 
                                    "<select></select>" + 
                                    "{{parameterError}}" + 
                                    "</div>" +
                                    "</div>";

    var boolParameterTemplate = "<div class='parameter'>" +
                                "<div class='parameter-name'>{{parameterName}}</div>" +
                                "<div class='parameter-value input-control text'>" +
                                "<input type='checkbox' value='{{parameterValue}}'/>" +
                                "{{parameterError}}" +
                                "</div>" +
                                "</div>";

    var dateParameterTemplate = "<div class='parameter'>" +
                                "<div class='parameter-name'>{{parameterName}}</div>" +
                                "<div class='parameter-value input-control text'>" +
                                "<input type='date' value='{{parameterValue}}'/>" +
                                "{{parameterError}}" +
                                "</div>" +
                                "</div>";

    var scalarParameterTemplate = "<div class='parameter'>" +
                                    "<div class='parameter-name'>{{parameterName}}</div>" +
                                    "<div class='parameter-value input-control text'>" +
                                    "<input type='text' placeholder='{{parameterValue}}'/>" +
                                    "<div class='error'>{{parameterError}}</div>" +
                                    "</div>" +
                                    "</div>";

    var referenceParameterTemplate = "<div class='parameter'>" +
                                       "<div class ='parameter-name'>{{parameterName}}</div>" +
                                       "<div class ='parameter-value input-control text'>" +
                                       "Reference param not implemented" +
                                       "{{parameterError}}" +
                                       "</div>" +
                                       "</div>";

    var actionDialogQueryTemplate = "<div class='action-dialog'>" +
                                   "<div class='title'>{{title}}{{> cancel}}</div>" +
                                   "<div class='parameters'>" +
                                   "{{error}}" +
                                   "</div>" +
                                   "<input class='go' type='submit' value='Go' style='float: right' />" +
                                   "<input class='show' type='submit' value='Show' style='float: right' />" +
                                   "</div>";

    var actionDialogOtherTemplate = "<div class='action-dialog'>" +
                                    "<div class='title'>{{title}}{{> cancel}}</div>" +
                                    "<div class='parameters'>" +
                                    "{{error}}" +
                                    "</div>" +
                                    "<input class='go' type='submit' value='Do' style='float: right' />" +
                                    "</div>";

    var listItemTemplate = "<div class='list-item bg-color-{{backgroundColor}} clickable-area'>" +
                           "<a href='{{collectionItemUrl}}'><span></span>{{collectionItemTitle}}</a>" +
                           "</div>";

    var tableTemplate = "<div class='table-view'>" +
                        "<div class='title'>" +
                        "{{collectionSize}}-{{collectionPlural}}" +
                        "{{> cancel}}{{> list}}</div>" +
                        "<div class='items'/>" +
                        "</div>";

    var tableRowTemplate = "<div class='properties'></div>";
    var tableCellTemplate = "<div class='cell' data-id='{{propertyId}}'>{{propertyValue}}</div>";

    var tableHeaderTemplate = "<div class='cell'>{{propertyValue}}</div>";

    var nestedObjectTemplate = "<div class='nested-object bg-color-{{backgroundColor}}'>" +
                               "<div class='title'>{{title}}" +
                               "{{> cancel}}{{> expand}}" +
                               "</div>" +
                               "<div class='properties'></div>" +
                               "</div>";

    var propertiesEditTemplate = "<div class='object-properties'>" +
                                 "{{> cancel}}" +
                                "<input class = 'save' type = 'submit' value = 'Save'/>" +
                                "<div class='properties edit bg-color-{{backgroundColor}}'/>" +
                                "</div>";

    var propertiesTemplate = "<div class='object-properties'>" +
                            "<div class ='properties bg-color-{{backgroundColor}}'/>" +
                            "</div>";

    //  <%--Outer div could be removed  -  but then ts will need to be changed--%>
    var actionsTemplate = "<div><div class='actions'/></div>";

    var cancelPartial = "<a class='cancel icon-cancel'/>";

    var expandPartial = "<a class='expand icon-enter' / >";

    var listPartial = "<a class='list icon-minus'/>";

    var tablePartial = "<a class='table icon-plus'/>";

    Handlebars.registerPartial("cancel", cancelPartial);
    Handlebars.registerPartial("expand", expandPartial);
    Handlebars.registerPartial("list", listPartial);
    Handlebars.registerPartial("table", tablePartial);

    export var templates = {
      
        serviceLinkTemplate: Handlebars.compile(serviceLinkTemplate),
        actionTemplate: Handlebars.compile(actionTemplate),
        referencePropertyTemplate: Handlebars.compile(referencePropertyTemplate),

        referencePropertyEditTemplate: Handlebars.compile(referencePropertyEditTemplate),

        scalarPropertyEditTemplate: Handlebars.compile(scalarPropertyEditTemplate),
        scalarPropertyTemplate: Handlebars.compile(scalarPropertyTemplate),
        boolPropertyTemplate: Handlebars.compile(boolPropertyTemplate),
        datePropertyTemplate: Handlebars.compile(datePropertyTemplate),
        collectionPropertyTemplate: Handlebars.compile(collectionPropertyTemplate),

        choicePropertyTemplate: Handlebars.compile(choicePropertyTemplate),
        choicesPropertyTemplate: Handlebars.compile(choicesPropertyTemplate),

        choiceParameterTemplate: Handlebars.compile(choiceParameterTemplate),
        choicesParameterTemplate: Handlebars.compile(choicesParameterTemplate),
        boolParameterTemplate: Handlebars.compile(boolParameterTemplate),
        dateParameterTemplate: Handlebars.compile(dateParameterTemplate),
        scalarParameterTemplate: Handlebars.compile(scalarParameterTemplate),
        referenceParameterTemplate: Handlebars.compile(referenceParameterTemplate),
        actionDialogQueryTemplate: Handlebars.compile(actionDialogQueryTemplate),
        actionDialogOtherTemplate: Handlebars.compile(actionDialogOtherTemplate),

        listTemplate: Handlebars.compile(listTemplate),
        listItemTemplate: Handlebars.compile(listItemTemplate),
        tableTemplate: Handlebars.compile(tableTemplate),
        tableRowTemplate: Handlebars.compile(tableRowTemplate),
        tableCellTemplate: Handlebars.compile(tableCellTemplate),

        nestedObjectTemplate: Handlebars.compile(nestedObjectTemplate),

        propertiesEditTemplate: Handlebars.compile(propertiesEditTemplate),
        propertiesTemplate: Handlebars.compile(propertiesTemplate),
        actionsTemplate: Handlebars.compile(actionsTemplate)
    }

 
}