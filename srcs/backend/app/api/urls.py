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
from .views import listing_id, listing_full
from .views import user_id, user_create, user_session, user_profile
from .views import order_create, order_id

urlpatterns = [
        path("api/listings/<int:id>/", listing_id.as_view()),
        path("api/listings/", listing_full.as_view()),
        path("api/user/<int:id>/", user_id.as_view()),
        path("api/auth/register", user_create.as_view()),
        path("api/auth/login", user_session.as_view()),
        path("api/auth/profile", user_profile.as_view()),
        path("api/orders/", order_create.as_view()),
        path("api/orders/<int:id>/", order_id.as_view()),
]
