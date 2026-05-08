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
    payment_id,
    seller_product,
    seller_id,
    listings_image_id,
    listings_image,
    listings_review,
    user_list,
    user_id,
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
)

urlpatterns = [
        
        # listing paths
        path("listings/<int:id>/", listing_id.as_view()),
        path("listings/", listing_full.as_view()),
        path("listings/seller/<int:product_id>/", seller_product.as_view()),
        path("listings/seller/<int:id>/", seller_id.as_view()),
        path("listings/<int:product_id>/images/<int:id>/", listings_image_id.as_view()),
        path("listings/<int:product_id>/images/", listings_image.as_view()),
        path("listings/<int:product_id>/review/", listings_review.as_view()),
        path("listings/<int:product_id>/review/<int:review_id>/", listings_review.as_view()),
        
        # auth [everything under /api/auth]
        path("auth/register/", auth_register.as_view()),
        path("auth/login/", auth_login.as_view()),
        path("auth/logout/", auth_logout.as_view()),
        path("auth/refresh/", auth_refresh.as_view()),
        path("auth/profile/", auth_profile.as_view()),
        path("auth/password/", auth_password.as_view()),
        path("auth/42/", auth_42_redirect.as_view()),
        path("auth/42/callback/", auth_42_callback.as_view()),

        # orders path
        path("orders/<int:id>/", order_id.as_view()),
        path("orders/", order_create.as_view()),
        path("payment/<int:order_id>/", payment_id.as_view()),

        # user paths
        path("users/", user_list.as_view()),
        path("users/<int:id>/", user_id.as_view()),
]
