$cssDir = "src\assets\css"

# Create directories
New-Item -ItemType Directory -Force -Path "$cssDir\base"
New-Item -ItemType Directory -Force -Path "$cssDir\pages"
New-Item -ItemType Directory -Force -Path "$cssDir\utils"

# Move Base files
Move-Item -Path "$cssDir\variables.css" -Destination "$cssDir\base\variables.css"
Move-Item -Path "$cssDir\css-custom-properties-design-tokens.css" -Destination "$cssDir\base\design-tokens.css"
Move-Item -Path "$cssDir\base-reset-typography.css" -Destination "$cssDir\base\reset-typography.css"

# Move and Rename Page files
Move-Item -Path "$cssDir\category-list-page-specific-components.css" -Destination "$cssDir\pages\category.css"
Move-Item -Path "$cssDir\homepage-hero-candidate-for-home-css-extraction.css" -Destination "$cssDir\pages\home.css"
Move-Item -Path "$cssDir\archive-heatmap-timeline.css" -Destination "$cssDir\pages\archive.css"
Move-Item -Path "$cssDir\tag-list-page-specific-components.css" -Destination "$cssDir\pages\tag.css"
Move-Item -Path "$cssDir\page-hero-inner-pages.css" -Destination "$cssDir\pages\inner-hero.css"

# Move Utilities
Move-Item -Path "$cssDir\utilities.css" -Destination "$cssDir\utils\utilities.css"
Move-Item -Path "$cssDir\utilities-additions.css" -Destination "$cssDir\utils\utilities-additions.css"

# Move Section/Layout common to components
Move-Item -Path "$cssDir\section-common.css" -Destination "$cssDir\components\section-common.css"

# Rename Component files
Move-Item -Path "$cssDir\components\cards-base.css" -Destination "$cssDir\components\card-base.css"
Move-Item -Path "$cssDir\components\cards-category-card-candidate-for-home-css-extraction.css" -Destination "$cssDir\components\card-category.css"
Move-Item -Path "$cssDir\components\cards-featured-post-card-candidate-for-home-css-extraction.css" -Destination "$cssDir\components\card-featured.css"
Move-Item -Path "$cssDir\components\cards-post-card-grid-list.css" -Destination "$cssDir\components\card-post.css"
Move-Item -Path "$cssDir\components\cards-sidebar-card.css" -Destination "$cssDir\components\card-sidebar.css"
Move-Item -Path "$cssDir\components\link-list-link-cards.css" -Destination "$cssDir\components\card-link.css"
Move-Item -Path "$cssDir\components\auth-login-page.css" -Destination "$cssDir\pages\login.css"
Move-Item -Path "$cssDir\components\auth-profile-page.css" -Destination "$cssDir\pages\profile.css"
Move-Item -Path "$cssDir\components\post-detail-reactions-share-author-card-prev-next.css" -Destination "$cssDir\components\post-footer.css"
Move-Item -Path "$cssDir\components\post-detail-article-body-toc.css" -Destination "$cssDir\components\post-detail.css"

Write-Host "CSS structure refactored successfully."
