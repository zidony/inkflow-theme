$jsDir = "src\assets\js"

# Create directories
New-Item -ItemType Directory -Force -Path "$jsDir\core"
New-Item -ItemType Directory -Force -Path "$jsDir\pages"

# Move and Rename
Move-Item -Path "$jsDir\components\utils.js" -Destination "$jsDir\core\utils.js"
Move-Item -Path "$jsDir\components\global.js" -Destination "$jsDir\core\global.js"
Move-Item -Path "$jsDir\components\theme.js" -Destination "$jsDir\core\theme.js"
Move-Item -Path "$jsDir\components\animations.js" -Destination "$jsDir\core\animations.js"

Move-Item -Path "$jsDir\components\page-login.js" -Destination "$jsDir\pages\login.js"
Move-Item -Path "$jsDir\components\page-profile.js" -Destination "$jsDir\pages\profile.js"
Move-Item -Path "$jsDir\components\archive.js" -Destination "$jsDir\pages\archive.js"
Move-Item -Path "$jsDir\components\album.js" -Destination "$jsDir\pages\album.js"
Move-Item -Path "$jsDir\components\links.js" -Destination "$jsDir\pages\links.js"
Move-Item -Path "$jsDir\components\post.js" -Destination "$jsDir\pages\post.js"
Move-Item -Path "$jsDir\components\parallax.js" -Destination "$jsDir\pages\parallax.js"

Write-Host "JS structure refactored successfully."
