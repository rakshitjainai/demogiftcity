<?php
// Dedicated endpoint for "ping". Using a real file (not index.php?action=ping)
// avoids the Hostinger/LiteSpeed redirect that downgrades POST to GET -> 405.
$_GET["action"] = "ping";
require __DIR__ . "/index.php";
