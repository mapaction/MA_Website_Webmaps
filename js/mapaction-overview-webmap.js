  require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/InfoTemplate",
    "esri/dijit/PopupTemplate",
    "esri/symbols/PictureMarkerSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/config",
    "esri/request",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/graphic",
    "esri/Color",
    "esri/lang",
    "fcl/FlareClusterLayer_v3",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/dom-class",
    "esri/dijit/Popup",
    "esri/dijit/Legend",
    "dojo/on",
    "dojo/_base/array",
    "dojo/domReady!"
  ], function(
    Map,
    FeatureLayer,
    InfoTemplate,
    PopupTemplate,
    PictureMarkerSymbol,
    UniqueValueRenderer,
    ClassBreaksRenderer,
    SimpleMarkerSymbol,
    SimpleFillSymbol,
    SimpleLineSymbol,
    esriConfig,
    esriRequest,
    Point,
    SpatialReference,
    Graphic,
    Color,
    esriLang,
    FlareClusterLayer,
    domStyle,
    domConstruct,
    query,
    domClass,
    Popup,
    Legend,
    on,
    array    
  ) {
  
  //Use CORS-enabled https URL to access the google spreadsheet  
  esriConfig.defaults.io.corsEnabledServers.push("spreadsheets.google.com");
  var clusterLayer;
  var map = new Map("map", {
    center: [0,0],
    zoom: 3,
    basemap: "gray-vector",
    wrapAround180: false,
    maxZoom: 10,
    minZoom: 2
  })
  
  map.on("load", mapLoaded);
  
  function mapLoaded(){
  
    //define the symbology renderer for a default marker  
    var defaultSymbol = new SimpleMarkerSymbol().setSize(36).setColor("#106cb5").setOutline(null);  
    
    var renderer = new UniqueValueRenderer(defaultSymbol, "disastertype");
      
    renderer.addValue("Conflict", PictureMarkerSymbol({"url": "fcl/images/conflict_blue_40px.png", "width": 18, "height": 18, "type":"esriPMS"}));
    renderer.addValue("Cyclone", PictureMarkerSymbol({"url": "fcl/images/cyclone_blue_40px.png", "width": 18, "height": 18, "type":"esriPMS"}));
    renderer.addValue("Earthquake", PictureMarkerSymbol({"url": "fcl/images/earthquake_blue_40px.png", "width": 18, "height": 18, "type":"esriPMS"}));
    renderer.addValue("Earthquake, Tsunami", PictureMarkerSymbol({"url": "fcl/images/tsunami_blue_40px.png", "width": 18, "height": 18, "type":"esriPMS"}));
    renderer.addValue("Ebola", PictureMarkerSymbol({"url": "fcl/images/epidemic_blue_40px.png","width": 18,"height": 18,"type":"esriPMS"}));
    renderer.addValue("Floods", PictureMarkerSymbol({"url": "fcl/images/flood_blue_40px.png","width": 18,"height": 18,"type":"esriPMS"}));
    renderer.addValue("Food security", PictureMarkerSymbol({"url": "fcl/images/food_security_blue_40px.png","width": 18,"height": 18,"type":"esriPMS"}));
    renderer.addValue("Munitions explosion", PictureMarkerSymbol({"url": "fcl/images/munitions_blue_40px.png","width": 18,"height": 18,"type":"esriPMS"}));
    renderer.addValue("Population displacement", PictureMarkerSymbol({"url": "fcl/images/population_displacement_blue_40px.png","width": 18,"height": 18,"type":"esriPMS"}));
    renderer.addValue("Post election violence", PictureMarkerSymbol({"url": "fcl/images/post_conflict_blue_40px.png","width": 18,"height": 18,"type":"esriPMS"}));
    renderer.addValue("Tsunami", PictureMarkerSymbol({"url": "fcl/images/tsunami_blue_40px.png","width": 18,"height": 18,"type":"esriPMS"}));
    renderer.addValue("Volcano", PictureMarkerSymbol({"url": "fcl/images/volcano_blue_40px.png","width": 18,"height": 18,"type":"esriPMS"}));
   
    //init the layer, more options are available and explained in the cluster layer constructor
    clusterLayer = new FlareClusterLayer({
        id: "flare-cluster-layer",
        spatialReference: new esri.SpatialReference({ "wkid": 4326 }),
        displaySingleFlaresAtCount: 10,
        singleFlareTooltipProperty: "title",
        flareShowMode: "mouse",
        preClustered: false,
        clusterRatio: 10,
        idPropertyName: "id"      
    });
    
    var popup = new Popup({
          titleInBody: false
    }, domConstruct.create("div"));

    domClass.add(popup.domNode, "myTheme");
    
    var link = domConstruct.create("a",{
      "innerHTML": "Map Catalogue", //text that appears in the popup for the link 
      "href": "javascript: void(0);"
    }, query(".actionList", map.infoWindow.domNode)[0]);
                
    //when the link is clicked register a function that will run 
    on(link, "click", createLink);

    //define a popup template
    var template = new InfoTemplate({});
    template.setTitle("${title} - ${daterange}");
    template.setContent("${description}");
    
    clusterLayer.infoTemplate = template;
    map.infoWindow.resize(440,200);
    
    clusterLayer.setRenderer(renderer); //use standard setRenderer.
    map.addLayer(clusterLayer);
    requestGoogleSpreadsheet();
    
    
    
  };
  
  function requestGoogleSpreadsheet() {
    //get mission details from Google Spreadsheet
    var requestHandle = esriRequest({
       url: "https://spreadsheets.google.com/feeds/list/1_tUmBiTBC2KZ4LrftQl0MQ8m6tf0PpeuAbUaDw-WbNY/oopuhvi/public/values?alt=json",
       callbackParamName: "jsoncallback"
       });
    requestHandle.then(requestSucceeded, requestFailed);
  };
  
  function requestSucceeded(response, io) {
      //loop through the items and add to the feature layer
    var features = [];
    var id = 0;
    array.forEach(response.feed.entry, function(item) {
      if(item.gsx$activitysubcategory.$t == "Deployment")
      {
        var feature = {
          "id": id,
          "title": item.gsx$title.$t,
          "description": item.gsx$description.$t,
          "disastertype": item.gsx$disastertype.$t,
          "mdr_link": item.gsx$mdrurl.$t,
          "daterange": item.gsx$daterangestring.$t,
          "iconURL": item.gsx$iconfilename.$t,
          "x": Number(item.gsx$longitude.$t),
          "y": Number(item.gsx$latitude.$t)
        };
        features.push(feature);
      }
      id++;
    }); 
    clusterLayer.addData(features);   
  };

  function requestFailed(error) {
    console.log('failed');
  };
  
  function createLink(evt){
    var feature = map.infoWindow.getSelectedFeature();
    window.open(feature.attributes.mdr_link);
  };
  

    
});
  