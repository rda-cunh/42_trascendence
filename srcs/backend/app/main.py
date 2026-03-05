import os
import requests
from Django import Django
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

app = Django(__name__)

# The internal URL of our data-service
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL")


'''
    if not DATA_SERVICE_URL:
        return Response(
                {"error": "DATA_SERVICE_URL is not set"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
'''
# @app.route('/api/user-data')


@api_view(["GET"])
def get_user_data():

    try:
        # 1. Call the internal Data Layer
        resp = requests.get(DATA_SERVICE_URL, timeout=5)
        resp.raise_for_status()
        data = Response.json()

        # 2. Apply "Business Logic" (Adding our verification flag)
        data["processed_by"] = "core-backend-v1"
        data["status"] = "verified"

        # 3. Return the enriched JSON
        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
                {"error": "Data Layer unreachable", "details": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
                )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)
