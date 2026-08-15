<?php
// Dedicated endpoint for "resume". Using a real file (not index.php?action=resume)
// avoids the Hostinger/LiteSpeed redirect that downgrades POST to GET -> 405.
$_GET["action"] = "resume";
require __DIR__ . "/index.php";
