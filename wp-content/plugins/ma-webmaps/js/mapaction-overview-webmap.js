  require([
    "esri/map",
    "esri/InfoTemplate",
    "esri/symbols/PictureMarkerSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/config",
    "esri/request",
    "esri/SpatialReference",
    "esri/graphic",
    "fcl/FlareClusterLayer_v3",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/dom-class",
    "esri/dijit/Popup",
    "dojo/on",
    "dojo/_base/array",
    "dojo/domReady!"
  ], function(
    Map,
    InfoTemplate,
    PictureMarkerSymbol,
    UniqueValueRenderer,
    ClassBreaksRenderer,
    SimpleMarkerSymbol,
    esriConfig,
    esriRequest,
    SpatialReference,
    Color,
    FlareClusterLayer,
    domConstruct,
    query,
    domClass,
    Popup,
    on,
    array    
  ) {
  
  //Use CORS-enabled https URL to access the google spreadsheet  
  esriConfig.defaults.io.corsEnabledServers.push("spreadsheets.google.com");
  var clusterLayer;
  var map = new Map("map", {
    center: [40,2.5],
    zoom: 1,
    basemap: "gray-vector",
    wrapAround180: false,
    maxZoom: 10,
    minZoom: 1
  })
  
  map.on("load", mapLoaded);
  
  function mapLoaded(){
    //define the symbology renderer for a default marker  
    var defaultSymbol = new SimpleMarkerSymbol().setSize(36).setColor("#11468d").setOutline(null);  
    
    var renderer = new UniqueValueRenderer(defaultSymbol, "disastertype");
    
    initSingleFeatureRenderer(renderer);
  
    //init the layer, more options are available and explained in the cluster layer constructor
    clusterLayer = new FlareClusterLayer({
        id: "flare-cluster-layer",
        spatialReference: new esri.SpatialReference({ "wkid": 4326 }),
        displaySingleFlaresAtCount: 10,
        singleFlareTooltipProperty: "title",
        flareShowMode: "mouse",
        preClustered: false,
        clusterRatio: 60,
        idPropertyName: "id"      
    });
    
    initPopups(map);
    
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
    requestHandle.then(requestGSSSucceeded, requestGSSFailed);
  };
  
  
  function requestGSSSucceeded(response, io) {
    //loop through the items and add to the feature layer
    var features = [];
    var id = 0;
    var iconRoot = 'wp-content/plugins/ma-webmaps/images/'
    // Use relative path if running locally whilst debugging.
    if (location.hostname) {
        iconRoot = location.origin + '/' + iconRoot
    }

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
          "iconURL": iconRoot + item.gsx$iconfilename.$t,
          "x": Number(item.gsx$longitude.$t),
          "y": Number(item.gsx$latitude.$t)
        };
        features.push(feature);
      }
      id++;
    }); 
    clusterLayer.addData(features);   
  };

  
  function requestGSSFailed(error) {
    console.log('failed');
  };
  
  function createMDRLink(evt){
    var feature = map.infoWindow.getSelectedFeature();
    window.open(feature.attributes.mdr_link);
  };
  

/*   function getIconRootURL(iconRoot){
    var _path = 'wp-content/plugins/ma-webmaps/images/'
    // Use relative path if running locally whilst debugging.
    if (location.hostname) {
        _path = '/' + _path
    }
    iconRoot = _path
  } */
  
  function initSingleFeatureRenderer(renderer){
    var iconSize = 20;
    //var iconRoot = "";
    //getIconRootURL(iconRoot);
    
    var iconRoot = 'wp-content/plugins/ma-webmaps/images/'
    // Use relative path if running locally whilst debugging.
    if (location.hostname) {
        iconRoot = '/' + iconRoot
    }
    
      
    var iconLookup = {     
      'Agriculture':                                               iconRoot + 'agriculture.png',
      'CCCM':                                                      iconRoot + 'camp-coordination-and-camp-management.png',
      'Child protection':                                          iconRoot + 'child-protection.png',
      'Conflict':                                                  iconRoot + 'conflict.png',
      'Coordination':                                              iconRoot + 'coordination.png',
      'Covid-19':                                                  iconRoot + 'covid-19.png',
      'Cyclone':                                                   iconRoot + 'cyclone.png',
      'Early recovery':                                            iconRoot + 'early-recovery.png',
      'Earthquake':                                                iconRoot + 'earthquake.png',
      'Ebola':                                                     iconRoot + 'epidemic.png',
      'Economic':                                                  iconRoot + 'trade-and-market.png',
      'Education':                                                 iconRoot + 'education.png',
      'Emergency telecommunications':                              iconRoot + 'emergency-telecommunications.png',
      'Environment':                                               iconRoot + 'environment.png',
      'Fire':                                                      iconRoot + 'fire.png',
      'Flood':                                                     iconRoot + 'flood.png',
      'Food security':                                             iconRoot + 'food-security.png',
      'Health':                                                    iconRoot + 'health.png',
      'Landslide':                                                 iconRoot + 'landslide-mudslide.png',
      'Logistics':                                                 iconRoot + 'logistics.png',
      'Multi-cluster-sector':                                      iconRoot + 'multi-cluster-sector.png',
      'Munitions explosion':                                       iconRoot + 'mine.png',
      'Nutrition':                                                 iconRoot + 'nutrition.png',
      'Population displacement':                                   iconRoot + 'internally-displaced.png',
      'Post election violence':                                    iconRoot + 'election.png',
      'Protection':                                                iconRoot + 'protection.png',
      'Shelter':                                                   iconRoot + 'shelter.png',
      'Tsunami':                                                   iconRoot + 'tsunami.png',
      'Volcano':                                                   iconRoot + 'volcano.png',
      'WASH':                                                      iconRoot + 'water-sanitation-and-hygiene.png'       
    }

    for (var key in iconLookup) {
        renderer.addValue(key, PictureMarkerSymbol({"url": iconLookup[key], "width": iconSize, "height": iconSize, "type":"esriPMS"}));
    }
  };
  
  function initPopups(map){
    var popup = new Popup({
          titleInBody: false
    }, domConstruct.create("div"));

    domClass.add(popup.domNode, "myTheme");
    
    var mdrLink = domConstruct.create("a",{
      "innerHTML": "Map Catalogue", //text that appears in the popup for the link 
      "href": "javascript: void(0);"
    }, query(".actionList", map.infoWindow.domNode)[0]);
                
    //when the link is clicked register a function that will run 
    on(mdrLink, "click", createMDRLink);

    //define a popup template
    var template = new InfoTemplate({});
    template.setTitle("${title} - ${daterange}");
    template.setContent("${description}");
    
    clusterLayer.infoTemplate = template;
    map.infoWindow.resize(440,200);
  };
    
});
  
