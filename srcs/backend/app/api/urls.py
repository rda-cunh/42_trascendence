"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import (
    listing_id,
    listing_full,
    public_listing_id,
    public_listing_full,
    payment_id,
    seller_product,
    seller_id,
#    listings_image_id,
#    listings_image,
    listings_review,
    user_list,
    public_user_list,
    user_id,
    public_user_id,
    auth_register,
    auth_login,
    auth_logout,
    auth_refresh,
    auth_profile,
    auth_password,
    order_create,
    order_id,
    auth_42_redirect,
    auth_42_callback,
    chat_conversations,
    chat_messages,
    presence_ping,
    presence_query,
    admin_bans,
    manage_admins,
    manage_bans,
    grafana_auth,
    follow_action,
    follow_following,
    follow_followers,
    follow_counts,
    follow_feed,
)

urlpatterns = [
        
        # listing paths
        path("listings/<int:product_id>/", listing_id.as_view()),
        path("listings/", listing_full.as_view()),
        path("listings/seller/<int:product_id>/", seller_product.as_view()),
        path("listings/seller/<int:user_id>/", seller_id.as_view()),
#        path("listings/<int:product_id>/images/<int:image_id>/", listings_image_id.as_view()),
#        path("listings/<int:product_id>/images/", listings_image.as_view()),
        path("listings/<int:product_id>/review/", listings_review.as_view()),
        path("listings/<int:product_id>/review/<int:review_id>/", listings_review.as_view()),
        
        # auth paths [everything under /api/auth]
        path("auth/register/", auth_register.as_view()),
        path("auth/login/", auth_login.as_view()),
        path("auth/logout/", auth_logout.as_view()),
        path("auth/refresh/", auth_refresh.as_view()),
        path("auth/profile/", auth_profile.as_view()),
        path("auth/password/", auth_password.as_view()),
        path("auth/42/", auth_42_redirect.as_view()),
        path("auth/42/callback/", auth_42_callback.as_view()),

        # chat paths
        path("chat/conversations/", chat_conversations.as_view()),
        path("chat/conversations/<int:conversation_id>/messages/", chat_messages.as_view()),

        # presence paths
        path("presence/ping/", presence_ping.as_view()),
        path("presence/",      presence_query.as_view()),

        # follow paths
        path("follow/",                              follow_action.as_view()),
        path("follow/following/<int:user_id>/",      follow_following.as_view()),
        path("follow/followers/<int:user_id>/",      follow_followers.as_view()),
        path("follow/counts/<int:user_id>/",         follow_counts.as_view()),
        path("follow/feed/",                         follow_feed.as_view()),

        # orders paths
        path("orders/<int:order_id>/", order_id.as_view()),
        path("orders/", order_create.as_view()),
        path("payment/<int:order_id>/", payment_id.as_view()),

        # user paths
        path("users/", user_list.as_view()),
        path("users/<int:user_id>/", user_id.as_view()),

        # public paths
        path("public/listings/<int:product_id>/", public_listing_id.as_view()),
        path("public/listings/", public_listing_full.as_view()),
        path("public/users/", public_user_list.as_view()),
        path("public/users/<int:user_id>/", public_user_id.as_view()),

        # admin paths
        path("admin/bans/<int:user_id>/", manage_bans.as_view()),
        path("admin/bans/", admin_bans.as_view()),
        path("admin/manage/<int:user_id>/", manage_admins.as_view()),
        path("admin/grafana/", grafana_auth.as_view()),

]
