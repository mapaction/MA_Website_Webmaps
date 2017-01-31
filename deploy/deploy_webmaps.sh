#!/bin/bash

DEPLOY_DIR=`dirname $0`
WP_ROOT=`readlink -f $DEPLOY_DIR/..`
# WP_ROOT="$ROOT"

HOST='sftp.flywheelsites.com'

if [[ 'production' == $1 ]]
then
  REMOTE_WP_ROOT='/org-mapaction/mapactionmain'
  echo using production values
else
  REMOTE_WP_ROOT='/org-mapaction/mapactionmain_staging'
  echo using staging values
fi

PATH_TO_PLUGIN_FOLDER='wp-content/plugins'
WEBMAP_PLUGIN_NAME='ma-webmaps'

NOW=`date +"%Y-%m-%d_%H-%M"`

echo -n "Please enter your username for $HOST: "
read USERNAME

sftp "$USERNAME@$HOST" <<END
    rename "$REMOTE_WP_ROOT/$PATH_TO_PLUGIN_FOLDER/$WEBMAP_PLUGIN_NAME" "$REMOTE_WP_ROOT/${WEBMAP_PLUGIN_NAME}_$NOW.bak"
    mkdir "$REMOTE_WP_ROOT/$PATH_TO_PLUGIN_FOLDER/$WEBMAP_PLUGIN_NAME"
    put -r "$WP_ROOT/$PATH_TO_PLUGIN_FOLDER/$WEBMAP_PLUGIN_NAME" "$REMOTE_WP_ROOT/$PATH_TO_PLUGIN_FOLDER"

END
