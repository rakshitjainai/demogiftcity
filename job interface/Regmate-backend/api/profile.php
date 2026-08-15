<?php
// Dedicated endpoint for "profile". Using a real file (not index.php?action=profile)
// avoids the Hostinger/LiteSpeed redirect that downgrades POST to GET -> 405.
$_GET["action"] = "profile";
require __DIR__ . "/index.php";
