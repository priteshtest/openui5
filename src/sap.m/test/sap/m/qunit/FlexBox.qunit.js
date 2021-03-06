/*global document, jQuery, sap, QUnit*/
(function ($) {
	"use strict";

	(function setTitle(sTitle){
		document.title = sTitle;
		$(function(){
			$("#qunit-header").text(sTitle);
		});
	})("QUnit Page for FlexBox - sap.m");

	jQuery.sap.require("sap.ui.qunit.qunit-css");

	if (!jQuery.support.flexBoxLayout && !jQuery.support.newFlexBoxLayout && !jQuery.support.ie10FlexBoxLayout) {
		test("Dummy Test", function() {
			ok(true, "At least one test needs to run to avoid test timeouts!");
		});
		return;
	}

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var sVendorPrefix = "";

	if (jQuery.support.flexBoxPrefixed) {
		if (sap.ui.Device.browser.webkit) {
			sVendorPrefix = "-webkit-";
		} else if (sap.ui.Device.browser.mozilla) {
			sVendorPrefix = "-moz-";
		} else if (sap.ui.Device.browser.msie) {
			sVendorPrefix = "-ms-";
		}
	}

	// Helper function to create the flexboxes for the tests
	var getFlexBoxWithItems = function(oBoxConfig, vItemTemplates, vItemConfigs) {
		var box = new sap.m.FlexBox(oBoxConfig),
			item = null,
			i = 0;

		// Fill item templates with default HTML control if only an integer is given
		if (typeof vItemTemplates === "number") {
			var j = vItemTemplates;
			vItemTemplates = [];
			while (j) {
				vItemTemplates.push(sap.ui.core.HTML);
				j--;
			}
		}

		// Fill item configuration with default content if only an integer is given
		if (typeof vItemConfigs === "number") {
			var k = vItemConfigs;
			vItemConfigs = [];
			while (k) {
				vItemConfigs.push({
					content: "<div class='items'>" + k + "</div>"
				});
				k--;
			}
			vItemConfigs.reverse();
		}

		while (i < vItemTemplates.length) {
			item = new vItemTemplates[i](vItemConfigs[i] ? vItemConfigs[i] : {});
			box.addItem(item);
			i++;
		}

		return box;
	};

	QUnit.module("Visibility", {
		setup: function() {
			this.oBoxConfig = {
				id: "flexbox",
				visible: false
			},
			this.vItemTemplates = 3,
			this.vItemConfigs = [
			                     {
			                    	content: "<div class='items'>1</div>"
			                     },
			                     {
			                    	content: "<div class='items'>2</div>"
			                     },
			                     {
			                    	content: "<div class='items'>3</div>",
			                    	visible: false
			                     }
			],
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			this.fixture = jQuery.sap.byId(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("FlexBox visible:false", function() {
		ok(!jQuery(".sapMFlexBox", this.fixture).length, "Flex Box should not be rendered initially");
	});

	QUnit.test("FlexBox visible:true - Item 3 visible:false", function() {
		this.oBox.setVisible(true);
		sap.ui.getCore().applyChanges();
		ok(jQuery(".sapMFlexBox", this.fixture).length, "Flex Box should now be rendered");
		equal(jQuery(".sapMFlexBox > .sapMFlexItem:not(.sapUiHiddenPlaceholder)", this.fixture).length, 2, "Only two items should be rendered");
	});

	QUnit.test("Item 3 visible:true", function() {
		this.oBox.setVisible(true);
		this.oBox.getItems()[2].setVisible(true);
		sap.ui.getCore().applyChanges();
		equal(jQuery(".sapMFlexBox > .sapMFlexItem:not(.sapUiHiddenPlaceholder)", this.fixture).length, 3, "Three items should now be rendered");
	});

	QUnit.module("Render Type", {
		setup: function() {
			this.oBoxConfig = {
				renderType: "List"
			},
			this.vItemTemplates = [
			                       sap.m.Image,
			                       sap.ui.core.HTML,
			                       sap.ui.core.HTML
			],
			this.vItemConfigs = [
			                     {},
			                     {
			                    	content: "<div class='items'>2</div>",
			                    	layoutData: new sap.m.FlexItemData({
			                    		growFactor: 2,
			                    		baseSize: "58%"
			                    	})
			                     },
			                     {
			                    	content: "<div class='items'>3</div>"
			                     }
			],
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("List", function() {
		equal(this.oBox.$().get(0).tagName, "UL", "Flex Box should be rendered as UL");
		equal(this.oBox.$().find(".sapMFlexItem:first-child").get(0).tagName, "LI", "First item of Flex Box should be rendered as LI");
		equal(this.oBox.$().find(".sapMFlexItem:nth-child(2)").get(0).tagName, "LI", "Second item of Flex Box should be rendered as LI");
	});

	QUnit.test("Div", function() {
		this.oBox.setRenderType("Div");
		sap.ui.getCore().applyChanges();
		equal(this.oBox.$().get(0).tagName, "DIV", "Flex Box should now be rendered as DIV");
		equal(this.oBox.$().find(".sapMFlexItem:first-child").get(0).tagName, "DIV", "First item of Flex Box should be rendered as DIV");
		equal(this.oBox.$().find(".sapMFlexItem:nth-child(2)").get(0).tagName, "DIV", "Second item of Flex Box should be rendered as DIV");
	});

	QUnit.test("Bare", function() {
		this.oBox.setRenderType("Bare");
		sap.ui.getCore().applyChanges();
		equal(this.oBox.getItems()[0].$().get(0).tagName, "IMG", "First item of Flex Box should now be rendered as IMG");
		if(!sap.ui.Device.browser.phantomJS && !sap.ui.Device.browser.internet_explorer) {
			equal(this.oBox.getItems()[1].getDomRef().style.flexGrow, "2", "Inline style for grow factor is set on second item");
			equal(this.oBox.getItems()[1].getDomRef().style.flexBasis, "58%", "Inline style for base size is set on second item");
		}
	});

	QUnit.module("Inline vs. block display", {
		setup: function() {
			this.oBoxConfig = {
				displayInline: true
			},
			this.vItemTemplates = 3,
			this.vItemConfigs = 3,
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Inline", function() {
		this.oBox.setDisplayInline(true);
		if (jQuery.support.newFlexBoxLayout) {
			equal(this.oBox.$().css('display'), sVendorPrefix + "inline-flex", "Flex Box display property should be set to inline");
		} else if (jQuery.support.ie10FlexBoxLayout) {
			equal(this.oBox.$().css('display'), sVendorPrefix + "inline-flexbox", "Flex Box display property should be set to inline");
		} else {
			equal(this.oBox.$().css('display'), sVendorPrefix + "inline-box", "Flex Box display property should be set to inline");
		}
	});

	QUnit.test("Block", function() {
		this.oBox.setDisplayInline(false);
		if (jQuery.support.newFlexBoxLayout) {
			equal(this.oBox.$().css('display'), sVendorPrefix + "flex", "Flex Box display property should be set to block");
		} else if (jQuery.support.ie10FlexBoxLayout) {
			equal(this.oBox.$().css('display'), sVendorPrefix + "flexbox", "Flex Box display property should be set to block");
		} else {
			equal(this.oBox.$().css('display'), sVendorPrefix + "box", "Flex Box display property should be set to block");
		}
	});

	QUnit.module("Fit Container", {
		setup: function() {
			this.oBoxConfig = {
				displayInline: true
			},
			this.vItemTemplates = 3,
			this.vItemConfigs = 3,
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Height 100%", function() {
		jQuery.sap.byId(DOM_RENDER_LOCATION).css("height", "123px");
		this.oBox.setFitContainer(true);
		equal(this.oBox.$().css('height'), "123px", "Flex Box height property should be set to 100%");
		jQuery.sap.byId(DOM_RENDER_LOCATION).css("height", "");
	});

	QUnit.module("Width and height", {
		setup: function() {
			this.oBoxConfig = {
				displayInline: true
			},
			this.vItemTemplates = 3,
			this.vItemConfigs = 3,
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Set explicit dimensions", function() {
		this.oBox.setWidth("388px");
		this.oBox.setHeight("398px");
		sap.ui.getCore().applyChanges();
		equal(this.oBox.$().css('width'), "388px", "Flex Box width property should be set correctly");
		equal(this.oBox.$().css('height'), "398px", "Flex Box height property should be set correctly");
	});

	QUnit.module("Background Design", {
		setup: function() {
			this.oBoxConfig = {
				displayInline: true
			},
			this.vItemTemplates = 3,
			this.vItemConfigs = [
			                     {
			                    	content: "<div class='items'>1</div>"
			                     },
			                     {
			                    	content: "<div class='items'>2</div>"
			                     },
			                     {
			                    	content: "<div class='items'>3</div>",
			                    	layoutData: new sap.m.FlexItemData({})
			                     }
			],
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("FlexBox Solid", function() {
		this.oBox.setBackgroundDesign("Solid");
		ok(this.oBox.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is set");
		ok(!this.oBox.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is not set");
		ok(!this.oBox.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is not set");
	});

	QUnit.test("FlexBox Transparent", function() {
		this.oBox.setBackgroundDesign("Transparent");
		ok(this.oBox.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is set");
		ok(!this.oBox.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is not set");
		ok(!this.oBox.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is not set");
	});

	QUnit.test("FlexBox Translucent", function() {
		this.oBox.setBackgroundDesign("Translucent");
		ok(this.oBox.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is set");
		ok(!this.oBox.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is not set");
		ok(!this.oBox.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is not set");
	});

	QUnit.test("Flex item Solid", function() {
		var oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
		oItem3LayoutData.setBackgroundDesign("Solid");
		ok(oItem3LayoutData.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is set");
		ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is not set");
		ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is not set");
	});

	QUnit.test("Flex item Transparent", function() {
		var oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
		oItem3LayoutData.setBackgroundDesign("Transparent");
		ok(oItem3LayoutData.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is set");
		ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is not set");
		ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is not set");
	});

	QUnit.test("Flex item Translucent", function() {
		var oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
		oItem3LayoutData.setBackgroundDesign("Translucent");
		ok(oItem3LayoutData.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is set");
		ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is not set");
		ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is not set");
	});

	QUnit.module("Direction", {
		setup: function() {
			this.oBoxConfig = {

			},
			this.vItemTemplates = 3,
			this.vItemConfigs = 3,
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef();
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef();
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Row Reverse", function() {
		this.oBox.setDirection("RowReverse");
		ok((this.oItem2DomRef.getBoundingClientRect().left - this.oItem1DomRef.getBoundingClientRect().left) < 0, "Item 1 should be placed to the right of Item 2");
		ok((this.oItem3DomRef.getBoundingClientRect().left - this.oItem2DomRef.getBoundingClientRect().left) < 0, "Item 2 should be placed to the right of Item 3");
	});

	QUnit.test("Column", function() {
		this.oBox.setDirection("Column");
		ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) > 0, "Item 1 should be placed above Item 2");
		ok((this.oItem3DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().top) > 0, "Item 2 should be placed above Item 3");
	});

	QUnit.test("Column Reverse", function() {
		this.oBox.setDirection("ColumnReverse");
		ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) < 0, "Item 1 should be placed below Item 2");
		ok((this.oItem3DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().top) < 0, "Item 2 should be placed below Item 3");
	});

	QUnit.test("Row", function() {
		this.oBox.setDirection("Row");
		ok((this.oItem2DomRef.getBoundingClientRect().left - this.oItem1DomRef.getBoundingClientRect().left) > 0, "Item 1 should be placed to the left of Item 2");
		ok((this.oItem3DomRef.getBoundingClientRect().left - this.oItem2DomRef.getBoundingClientRect().left) > 0, "Item 2 should be placed to the left of Item 3");
	});

	QUnit.module("Re-ordering", {
		setup: function() {
			this.oBoxConfig = {

			},
			this.vItemTemplates = 3,
			this.vItemConfigs = [
			                     {
			                    	content: "<div class='items'>1</div>",
			                    	layoutData: new sap.m.FlexItemData({order: 1})
			                     },
			                     {
			                    	content: "<div class='items'>2</div>",
			                    	layoutData: new sap.m.FlexItemData({order: 2})
			                     },
			                     {
			                    	content: "<div class='items'>3</div>",
			                    	layoutData: new sap.m.FlexItemData({order: 3})
			                     }
			],
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			this.oItem1LayoutData = this.oBox.getItems()[0].getLayoutData();
			this.oItem2LayoutData = this.oBox.getItems()[1].getLayoutData();
			this.oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
			sap.ui.getCore().applyChanges();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef();
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef();
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("3 - 1 - 2", function() {
		this.oItem1LayoutData.setOrder(3);
		this.oItem2LayoutData.setOrder(1);
		this.oItem3LayoutData.setOrder(2);
		ok((this.oItem2DomRef.getBoundingClientRect().left - this.oItem3DomRef.getBoundingClientRect().left) < 0, "Item 3 should be placed to the right of Item 2");
		ok((this.oItem3DomRef.getBoundingClientRect().left - this.oItem1DomRef.getBoundingClientRect().left) < 0, "Item 1 should be placed to the right of Item 3");
	});

	QUnit.module("Positioning", {
		setup: function() {
			this.oBoxConfig = {
				width: "388px",
				height: "398px"
			},
			this.vItemTemplates = 3,
			this.vItemConfigs = [
			                     {
			                    	content: "<div class='items'>1</div>",
			                    	layoutData: new sap.m.FlexItemData({})
			                     },
			                     {
			                    	content: "<div class='items'>2</div>"
			                     },
			                     {
			                    	content: "<div class='items'>3</div>"
			                     }
			],
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			this.oItem1LayoutData = this.oBox.getItems()[0].getLayoutData();
			sap.ui.getCore().applyChanges();
			this.oBoxDomRef = this.oBox.getDomRef();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef().parentNode;
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef().parentNode;
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef().parentNode;
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Justify Content/Align Items: Center/Center", function() {
		this.oBox.setJustifyContent("Center");
		this.oBox.setAlignItems("Center");
		ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 130) <= 1, "Item 1 should be placed at the horizontal center");
		ok(Math.round(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 173) <= 1, "Item 1 should be placed at the vertical center");
	});

	QUnit.test("Justify Content/Align Items: End/End", function() {
		this.oBox.setJustifyContent("End");
		this.oBox.setAlignItems("End");
		ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 259) <= 1, "Item 1 should be placed at the horizontal end");
		ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 346) <= 2, "Item 1 should be placed at the vertical end");
	});

	QUnit.test("Justify Content/Align Items: Space Between/Baseline", function() {
		this.oItem1DomRef.style.fontSize = "40px";
		this.oBox.setJustifyContent("SpaceBetween");
		this.oBox.setAlignItems("Baseline");
		ok((this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left) === 0, "Item 1 should be placed at the horizontal start");
		ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 179) <= 1, "Item 2 should be placed at the horizontal center");
		ok(Math.abs(this.oItem3DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 345) <= 1, "Item 3 should be placed at the horizontal end");
		if (jQuery.support.newFlexBoxLayout || jQuery.support.ie10FlexBoxLayout) {	// Baseline is not supported for align-items by older browsers
			ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 22) <= 1, "Item 2 should be pushed down to align with Item 1 baseline");
		}
		this.oItem1DomRef.style.fontSize = "";
	});

	QUnit.test("Justify Content/Align Items: Space Around/Stretch", function() {
		this.oBox.setJustifyContent("SpaceAround");
		this.oBox.setAlignItems("Stretch");
		ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 43) <= 1, "Item 1 should be placed at the horizontal start");
		ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 173) <= 1, "Item 2 should be placed at the horizontal center");
		ok(Math.abs(this.oItem3DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 302) <= 1, "Item 3 should be placed at the horizontal end");
		ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
		ok((this.oItem1DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) === 0, "Item 1 should stretch to the vertical end");
	});

	QUnit.test("Justify Content/Align Items: Start/Start", function() {
		this.oBox.setJustifyContent("Start");
		this.oBox.setAlignItems("Start");
		ok((this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left) === 0, "Item 1 should be placed at the horizontal start");
		ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
	});

	if (jQuery.support.newFlexBoxLayout || jQuery.support.ie10FlexBoxLayout) {	// align-self is not supported by older browsers
		QUnit.test("Align Self: Start", function(){
			this.oBox.setAlignItems("Stretch");
			this.oItem1LayoutData.setAlignSelf("Start");
			ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
			ok(Math.abs(this.oBoxDomRef.getBoundingClientRect().bottom - this.oItem1DomRef.getBoundingClientRect().bottom - 346) <= 2, "Item 1 should not be stretched");
		});

		QUnit.test("Align Self: Center", function(){
			this.oItem1LayoutData.setAlignSelf("Center");
			ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 173) <= 1, "Item 1 should be placed at the vertical center");
		});

		QUnit.test("Align Self: End", function(){
			this.oItem1LayoutData.setAlignSelf("End");
			ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 346) <= 2, "Item 1 should be placed at the vertical end");
		});

		QUnit.test("Align Self: Baseline", function(){
			this.oItem2DomRef.style.fontSize = "40px";
			this.oItem1LayoutData.setAlignSelf("Baseline");
			ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
			ok(Math.abs(this.oBoxDomRef.getBoundingClientRect().bottom - this.oItem1DomRef.getBoundingClientRect().bottom - 346) <= 2, "Item 1 should not be stretched");
			this.oItem2DomRef.style.fontSize = "";
		});

		QUnit.test("Align Self: Stretch", function(){
			this.oItem1LayoutData.setAlignSelf("Stretch");
			ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
			ok((this.oItem1DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) === 0, "Item 1 should stretch to the vertical end");
			this.oBox.setAlignItems("Start");
			this.oItem1LayoutData.setAlignSelf("Auto");
		});
	}

	if (jQuery.support.newFlexBoxLayout || jQuery.support.ie10FlexBoxLayout) {	// multi-line mode is not supported by older browsers
		QUnit.module("Multi-line", {
			setup: function() {
				this.oBoxConfig = {
				},
				this.vItemTemplates = 4,
				this.vItemConfigs = 4,
				this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
				this.oBox.setWidth("388px");
				this.oBox.setHeight("398px");
				this.oBox.placeAt(DOM_RENDER_LOCATION);
				sap.ui.getCore().applyChanges();
				this.oBoxDomRef = this.oBox.getDomRef();
				this.oItem1DomRef = this.oBox.getItems()[0].getDomRef().parentNode;
				this.oItem2DomRef = this.oBox.getItems()[1].getDomRef().parentNode;
				this.oItem3DomRef = this.oBox.getItems()[2].getDomRef().parentNode;
				this.oItem4DomRef = this.oBox.getItems()[3].getDomRef().parentNode;
				this.oItem1DomRef.style.width = "100%";
				this.oItem2DomRef.style.width = "50%";
				this.oItem3DomRef.style.width = "50%";
				this.oItem1DomRef.style.minHeight = "100px";
				this.oItem2DomRef.style.minHeight = "75px";
				this.oItem3DomRef.style.minHeight = "75px";
				this.oItem4DomRef.style.minHeight = "50px";
			},
			teardown: function() {
				this.oBox.destroy();
				this.oBox = null;
			}
		});

		QUnit.test("Wrapping: No Wrap", function() {
			this.oBox.setWrap("NoWrap");
			ok((this.oItem1DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().top) === 0, "Item 1 should be on the same line as Item 2");
			ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem3DomRef.getBoundingClientRect().top) === 0, "Item 2 should be on the same line as Item 3");
			ok((this.oItem3DomRef.getBoundingClientRect().top - this.oItem4DomRef.getBoundingClientRect().top) === 0, "Item 3 should be on the same line as Item 4");
		});

		QUnit.test("Wrapping: Wrap", function() {
			this.oBox.setWrap("Wrap");
			ok((this.oItem4DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) > 0, "Item 4 should be in a line below Item 2");
			ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) > 0, "Item 2 should be in a line below Item 1");
			ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem3DomRef.getBoundingClientRect().top) === 0, "Item 2 should be on the same line as Item 3");
		});

		QUnit.test("Wrapping: Wrap Reverse", function() {
			this.oBox.setWrap("WrapReverse");
			ok((this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().top) < 0, "Item 4 should be in a line above Item 2");
			ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) < 0, "Item 2 should be in a line above Item 1");
			ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem3DomRef.getBoundingClientRect().top) === 0, "Item 2 should be on the same line as Item 3");
		});

		QUnit.test("Align Content: Start", function() {
			this.oBox.setWrap("Wrap");
			this.oBox.setAlignContent("Start");
			ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
			ok(Math.round(this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().bottom) === 0, "Item 2 should be directly below Item 1");
			ok(Math.round(this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().bottom) === 0, "Item 4 should be directly below Item 2");
		});

		QUnit.test("Align Content: Center", function() {
			this.oBox.setWrap("Wrap");
			this.oBox.setAlignContent("Center");
			ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 86) <= 2, "Item 1 should be placed towards the vertical center");
			ok(Math.round(this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().bottom) === 0, "Item 2 should be directly below Item 1");
			ok(Math.round(this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().bottom) === 0, "Item 4 should be directly below Item 2");
		});

		QUnit.test("Align Content: End", function() {
			this.oBox.setWrap("Wrap");
			this.oBox.setAlignContent("End");
			ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) <= 1, "Item 4 should be placed at the vertical end");
			ok(Math.round(this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().bottom) === 0, "Item 2 should be directly above Item 4");
			ok(Math.round(this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().bottom) === 0, "Item 1 should be directly above Item 2");
		});

		QUnit.test("Align Content: Space Between", function() {
			this.oBox.setWrap("Wrap");
			this.oBox.setAlignContent("SpaceBetween");
			ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
			ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 186) <= 2, "Item 2 should be placed at the vertical center");
			ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) <= 1, "Item 4 should be placed at the vertical end");
		});

		if (!jQuery.support.ie10FlexBoxLayout) {		// IE 10 doesn't support Space Around
			QUnit.test("Align Content: Space Around", function() {
				this.oBox.setWrap("Wrap");
				this.oBox.setAlignContent("SpaceAround");
				ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 28) <= 1, "Item 1 should be placed below the vertical start");
				ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 186) <= 2, "Item 2 should be placed at the vertical center");
				ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom + 28) <= 1, "Item 4 should be placed above the vertical end");
			});
		}

		QUnit.test("Align Content: Stretch", function() {
			this.oBox.setWrap("Wrap");
			this.oBox.setAlignContent("Stretch");
			ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) <= 1, "Item 1 should be placed at the vertical start");
			ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().bottom) <= 1, "Item 2 should be placed directly below Item 1");
			ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().bottom) <= 1, "Item 4 should be placed directly below Item 2");
			ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) <= 1, "Item 4 should be placed at the vertical end");
		});
	}

	QUnit.module("Flexibility", {
		setup: function() {
			this.oBoxConfig = {
			},
			this.vItemTemplates = 3,
			this.vItemConfigs = [
			                     {
			                    	content: "<div class='items'>1</div>",
			                    	layoutData: new sap.m.FlexItemData({})
			                     },
			                     {
			                    	content: "<div class='items'>2</div>",
			                    	layoutData: new sap.m.FlexItemData({})
			                     },
			                     {
			                    	content: "<div class='items'>3</div>",
			                    	layoutData: new sap.m.FlexItemData({})
			                     }
			],
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.setWidth("388px");
			this.oBox.setHeight("398px");
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			this.oItem1LayoutData = this.oBox.getItems()[0].getLayoutData();
			this.oItem2LayoutData = this.oBox.getItems()[1].getLayoutData();
			this.oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
			sap.ui.getCore().applyChanges();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef().parentNode;
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef().parentNode;
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef().parentNode;
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Growing", function() {
		this.oItem1LayoutData.setGrowFactor(1);
		this.oItem2LayoutData.setGrowFactor(2);
		this.oItem3LayoutData.setGrowFactor(3);
		ok(Math.abs(this.oItem1DomRef.offsetWidth - 86) <= 1, "Width of Item 1 should be 86 (is " + this.oItem1DomRef.offsetWidth + ")");
		ok(Math.abs(this.oItem2DomRef.offsetWidth - 129) <= 1, "Width of Item 2 should be 129 (is " + this.oItem2DomRef.offsetWidth + ")");
		ok(Math.abs(this.oItem3DomRef.offsetWidth - 173) <= 1, "Width of Item 3 should be 173 (is " + this.oItem3DomRef.offsetWidth + ")");
	});

	QUnit.test("Shrinking", function() {
		this.oItem1LayoutData.setShrinkFactor(1);
		this.oItem2LayoutData.setShrinkFactor(2);
		this.oItem3LayoutData.setShrinkFactor(3);
		this.oItem1DomRef.style.width = "100%";
		this.oItem2DomRef.style.width = "100%";
		this.oItem3DomRef.style.width = "100%";
		if (sap.ui.Device.browser.internet_explorer || sap.ui.Device.browser.phantomJS || sap.ui.Device.browser.safari) {
			// IE 10-11, PhantomJS and Safari miscalculate the width of the flex items when box-sizing: border-box
			ok(Math.abs(this.oItem1DomRef.offsetWidth - 247) <= 1, "Width of Item 1 should be 247 (is " + this.oItem1DomRef.offsetWidth + ")");
			ok(Math.abs(this.oItem2DomRef.offsetWidth - 107) <= 1, "Width of Item 2 should be 107 (is " + this.oItem2DomRef.offsetWidth + ")");
			ok(Math.abs(this.oItem3DomRef.offsetWidth - 34) <= 1, "Width of Item 3 should be 34 (is " + this.oItem3DomRef.offsetWidth + ")");
		} else {
			ok(Math.abs(this.oItem1DomRef.offsetWidth - 244) <= 1, "Width of Item 1 should be 244 (is " + this.oItem1DomRef.offsetWidth + ")");
			ok(Math.abs(this.oItem2DomRef.offsetWidth - 101) <= 1, "Width of Item 2 should be 101 (is " + this.oItem2DomRef.offsetWidth + ")");
			ok(Math.abs(this.oItem3DomRef.offsetWidth - 43) <= 1, "Width of Item 3 should be 43 (is " + this.oItem3DomRef.offsetWidth + ")");
		}
	});

	QUnit.test("Base Size", function() {
		this.oItem1LayoutData.setBaseSize("20%");
		this.oItem2LayoutData.setBaseSize("30%");
		this.oItem3LayoutData.setBaseSize("50%");
		ok(Math.abs(this.oItem1DomRef.offsetWidth - 78) <= 1, "Width of Item 1 should be 78 (is " + this.oItem1DomRef.offsetWidth + ")");
		ok(Math.abs(this.oItem2DomRef.offsetWidth - 116) <= 1, "Width of Item 2 should be 116 (is " + this.oItem2DomRef.offsetWidth + ")");
		ok(Math.abs(this.oItem3DomRef.offsetWidth - 194) <= 1, "Width of Item 3 should be 194 (is " + this.oItem3DomRef.offsetWidth + ")");
	});

	QUnit.test("Min Height", function() {
		this.oBox.setAlignItems("Start");
		this.oItem1LayoutData.setMinHeight("200px");
		ok(Math.abs(this.oItem1DomRef.offsetHeight - 200) <= 1, "Height of Item 1 should be 200 (is " + this.oItem1DomRef.offsetHeight + ")");
	});

	QUnit.test("Max Height", function() {
		this.oItem1LayoutData.setMaxHeight("60px");
		ok(Math.abs(this.oItem1DomRef.offsetHeight - 60) <= 1, "Height of Item 1 should be 60 (is " + this.oItem1DomRef.offsetHeight + ")");
	});

	QUnit.test("Min Width", function() {
		this.oItem1LayoutData.setMinWidth("200px");
		ok(Math.abs(this.oItem1DomRef.offsetWidth - 200) <= 1, "Width of Item 1 should be 200 (is " + this.oItem1DomRef.offsetWidth + ")");
	});

	QUnit.test("Max Width", function() {
		this.oItem1LayoutData.setGrowFactor(1);
		this.oItem1LayoutData.setMaxWidth("60px");
		ok(Math.abs(this.oItem1DomRef.offsetWidth - 60) <= 1, "Width of Item 1 should be 60 (is " + this.oItem1DomRef.offsetWidth + ")");
	});

	QUnit.module("Item Aggregation", {
		setup: function() {
			this.oBoxConfig = {
			},
			this.vItemTemplates = 3,
			this.vItemConfigs = 3,
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oItem1 = this.oBox.getItems()[0];
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Add Item", function() {
		this.oItem5 = new sap.ui.core.HTML("item5", {
			content: "<div class='items'>5</div>"
		});
		this.oBox.addItem(this.oItem5);
		sap.ui.getCore().applyChanges();
		ok(this.oItem5.getDomRef(), "Item 5 should be rendered");
	});

	QUnit.test("Insert Item", function() {
		this.oItem6 = new sap.ui.core.HTML("item6", {
			content: "<div class='items'>6</div>"
		});
		this.oBox.insertItem(this.oItem6, 2);
		sap.ui.getCore().applyChanges();
		var oFlexItem6 = this.oItem6.getDomRef().parentNode;
		ok(this.oItem6.getDomRef(), "Item 6 should be rendered");
		equal(Array.prototype.indexOf.call(oFlexItem6.parentNode.children, oFlexItem6), 2, "Item 6 should be rendered as the third element");
	});

	QUnit.test("Remove Item", function() {
		ok((this.oItem1.getDomRef().parentElement.parentElement === this.oBox.getDomRef()), "Item 1 is present");
		this.oBox.removeItem(this.oItem1);
		sap.ui.getCore().applyChanges();
		ok((this.oItem1.getDomRef().parentElement.parentElement !== this.oBox.getDomRef()), "Item 1 should have been removed");
	});

	QUnit.test("Remove All Items", function() {
		this.oBox.removeAllItems();
		sap.ui.getCore().applyChanges();
		equal(this.oBox.getDomRef().children.length, 0, "All items should have been removed");
	});

	QUnit.module("Accessibility", {
		setup: function() {
			this.oBoxConfig = {
			},
			this.vItemTemplates = [
			                       sap.m.FlexBox,
			                       sap.m.FlexBox
			],
			this.vItemConfigs = [
			                     {},
			                     {}
			],
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("getAccessibilityInfo", function() {
		ok(!!this.oBox.getAccessibilityInfo, "FlexBox has a getAccessibilityInfo function");
		var oInfo = this.oBox.getAccessibilityInfo();
		ok(!!oInfo, "getAccessibilityInfo returns a info object");
		ok(oInfo.role === undefined || oInfo.editable === null, "AriaRole");
		ok(oInfo.type === undefined || oInfo.editable === null, "Type");
		ok(oInfo.description === undefined || oInfo.editable === null, "Description");
		ok(oInfo.focusable === undefined || oInfo.editable === null, "Focusable");
		ok(oInfo.enabled === undefined || oInfo.editable === null, "Enabled");
		ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		ok(oInfo.children && oInfo.children.length == 2, "Children");
	});
})(jQuery);