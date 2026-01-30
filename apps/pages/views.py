from django.views.generic import TemplateView


class HomeView(TemplateView):
    """
    Class-based view for the home page.
    Requires user authentication to access.
    """
    template_name = 'home.html'
