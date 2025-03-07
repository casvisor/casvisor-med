#!/bin/bash
if [ "${MYSQL_ROOT_PASSWORD}" = "" ] ;then MYSQL_ROOT_PASSWORD=123456 ;fi

service mariadb start

mysqladmin -u root password ${MYSQL_ROOT_PASSWORD}

/opt/guacamole/sbin/guacd -b 0.0.0.0 -L "$GUACD_LOG_LEVEL"

exec /server --createDatabase=true
