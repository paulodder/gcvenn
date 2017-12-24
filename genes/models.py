from django.db import models

class Gene(models.Model):
    """Represents a gene and its expression values"""
    univ_name = models.CharField(max_length=10, unique=True)
    # name = models.CharField(max_length=8)
    Jan_expr = models.FloatField(default=0)
    GTE_expr = models.FloatField(default=0)
    TCGAN_expr = models.FloatField(default=0)
    
