
-- make sure we can load the whole database with our scripts containing large inserts
SET GLOBAL net_buffer_length=1048576;
SET GLOBAL max_allowed_packet=573741824;
SET GLOBAL connect_timeout=600;