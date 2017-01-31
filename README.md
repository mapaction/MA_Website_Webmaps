Webmaps for MapAction's main website
====================================
Webmaps for the MapAction's main website.

Directory structure
-------------------
The directory structure has been created to mimic that of a wordpress plugin. This is to simplify the development and deployment processes by ensuring that relative links stay consistant.


Deploying
---------
To deploy to the flywheel staging server (http://staging.petite-rose.flywheelsites.com) open a bash shell and run:
```
git pull
./deploy/deploy_webmaps.sh
```
You will need a suitable flywheel account to do this.

The script called without any parameters will deploy to the staging server. If the keyword "production" is added as a parameter the webmap will be deployed to the production server, eg:
```
git pull
./deploy/deploy_webmaps.sh production
```

Alternatively to deploy to live; first deploy to staging, then use staging->live feature in flywheel's web interface. However please note that this can overwrite all the content from staging->live (not just the webmap), therefore might not always be appropriate.


Embedding in a wordpress page
-----------------------------
Currently the webmaps are embedded into a wordpress page by including the following code:
```
<!-- BEGIN WEB MAP SCRIPT INSERT --><link rel="stylesheet" href="https://js.arcgis.com/3.18/dijit/themes/claro/claro.css"><link rel="stylesheet" href="https://js.arcgis.com/3.18/esri/css/esri.css"><link rel="stylesheet" href="/wp-content/plugins/ma-webmaps/css/webmap.css"><script>
  var dojoConfig = {
      parseOnLoad: false,
      async: true,
      tlmSiblingOfDojo: false,
      packages: [{
          name: "fcl",
          location: "/wp-content/plugins/ma-webmaps/js/fcl"
      }]
  };
  </script><script src="https://js.arcgis.com/3.18/"></script><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script><script src="/wp-content/plugins/ma-webmaps/js/mapaction-overview-webmap.js"></script><div id="map" style="max-height:500px" ></div><!-- END WEB MAP SCRIPT INSERT -->
```

This is not ideal as it does not use wordpress's mechanisums for managing loading javascript files.



END -