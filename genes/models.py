from django.db import models


class Gene(models.Model):
    """Represents a gene and its expression values"""
    rev_ann = models.CharField(max_length=15, unique=True, default='')
    # db_specific_name = models.CharField(max_length=10)
    # name = models.CharField(max_length=8)
    Jan_expr = models.FloatField(default=0)
    GTE_expr = models.FloatField(default=0)
    TCGAN_expr = models.FloatField(default=0)

    def __unicode__(self):
        return self.rev_ann
    
class Database(models.Model):
    """Represents database, functions mainly as a collection of genes"""
    name = models.CharField(max_length=30)
    genes = models.ManyToManyField(Gene)
