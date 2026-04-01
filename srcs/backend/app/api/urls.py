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
from .views import *

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
        # auth paths
        path("auth/register/", auth_register.as_view()),
        path("auth/register/<int:id>/", auth_register.as_view()),
        path("auth/login/", auth_login.as_view()),
        path("auth/login/<int:id>/", auth_login.as_view()),
        path("auth/profile/password/<int:id>/", auth_password.as_view()),
        path("auth/profile/", auth_profile.as_view()),
        path("auth/profile/<int:id>/", auth_profile.as_view()),
        path("auth/address/<int:id>", auth_address.as_view()),
        # order path
        path("orders/<int:id>/", order_id.as_view()),
        path("orders/", order_create.as_view()),
        path("payment/<int:order_id>/", payment_id.as_view()),
        # public path
        path("users/", user_list.as_view()),
        path("users/<int:id>/", user_id.as_view()),
]
