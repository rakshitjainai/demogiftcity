<?php
// Dedicated endpoint for "event". Using a real file (not index.php?action=event)
// avoids the Hostinger/LiteSpeed redirect that downgrades POST to GET -> 405.
$_GET["action"] = "event";
require __DIR__ . "/index.php";
