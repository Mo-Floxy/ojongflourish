from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health(request):
    """Small endpoint used to confirm the API is up during development."""
    return Response({"status": "ok", "service": "marketnest"})
