from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
# Create your views here.

# notes to self:
# Look at StreamingHttpResponse for streaming/generating large CSV files
# Set content_type to tell browser to treat response as file attachment

def base(request):
    """View that serves the standard website"""

    # template = loader.get_template('genes/base.html' )
    # response = HttpResponse(template.render))    
    # response['age'] = 120 
    return render(request, 'genes/demo.html')
# <!-- <html> -->
# <!--   <head> -->
# <!--     <title>App</title> -->
# <!--     <\!-- <script type="text/javascript" src="{% static "js/base.js" %}"></script> -\-> -->
# <!--   </head> -->
# <!--   <body> -->
# <!--     <div> -->
# <!--       Hello -->
# <!--     </div> -->

# <!--   </body> -->

# <!-- </html> -->
