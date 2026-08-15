<?php
// Dedicated endpoint for "progress". Using a real file (not index.php?action=progress)
// avoids the Hostinger/LiteSpeed redirect that downgrades POST to GET -> 405.
$_GET["action"] = "progress";
require __DIR__ . "/index.php";
