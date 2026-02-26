import os
import requests
from flask import Flask, jsonify

app = Flask(__name__)

# The internal URL of our data-service
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL")


@app.route('/api/user-data')
def get_user_data():
    try:
        # 1. Call the internal Data Layer
        response = requests.get(DATA_SERVICE_URL, timeout=5)
        response.raise_for_status()
        data = response.json()

        # 2. Apply "Business Logic" (Adding our verification flag)
        data["processed_by"] = "core-backend-v1"
        data["status"] = "verified"

        # 3. Return the enriched JSON
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": "Data Layer unreachable", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)