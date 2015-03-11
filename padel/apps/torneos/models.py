from django.db import models
from django.template.defaultfilters import slugify

from apps.users.models import Player, User

	
class Categoria(models.Model):

	name = models.CharField(max_length=50)

	def __unicode__(self):
		return self.name

class ClasificacionCategoria(models.Model):

	user = models.ForeignKey(User)
	name = models.CharField(max_length=100)

	def __unicode__(self):
		return self.name

class ClasificacionCategoria_Categoria(models.Model):

	clas_cat = models.ForeignKey(ClasificacionCategoria)
	category = models.ForeignKey(Categoria)
	orden = models.IntegerField()

	def __unicode__(self):
		return self.category.name

# class Division(models.Model):
# 	categoria = models.ForeignKey(Categoria)
# 	competicion = models.ForeignKey(Competicion)
# 	name = models.CharField(max_length=100, null=False,blank=False)
	
# 	def __unicode__(self):  # Python 3: def __str__(self):
# 		return self.name


class TipoCompeticion(models.Model):

	name = models.CharField(max_length=100, null=False,blank=False)
	slug = models.SlugField()
	min_jugadores = models.IntegerField(null=True, blank=True)
	max_jugadores = models.IntegerField(null=True, blank=True)
	min_equipos = models.IntegerField(null=True, blank=True)
	max_equipos = models.IntegerField(null=True, blank=True)
	num_cuenta = models.CharField(max_length=100, null=True, blank=True)
	fecha_sustitucion = models.DateField(null=True, blank=True)
	fecha_limite = models.DateField(null=True, blank=True)
	preferencia_horaria = models.TextField(null=True, blank=True)

	def __unicode__(self):  # Python 3: def __str__(self):
		return self.name

	def save(self, *args, **kwargs):
		'''
		Esta funcion nos ayuda a guardar el slug de acuerdo al titulo.
		'''
		if not self.id:
			self.slug = slugify(self.name)
		super(TipoCompeticion, self).save(*args, **kwargs)


class TipoInscripcion(models.Model):

	name = models.CharField(max_length=100)

	def __unicode__(self):
		return self.name
		

class Competicion(models.Model):
	"""
		Logo y precio ( agregar ), permitir_nivel, permitir_division
	"""
	categoria = models.ManyToManyField(Categoria)
	admin = models.ForeignKey(Player) # administrador del torneo
	tipoCompeticion = models.ForeignKey(TipoCompeticion) # tipo de competicion
	tipoInscripcion = models.ForeignKey(TipoInscripcion)

	name = models.CharField(max_length=50) # descripcion
	urlTag = models.CharField(max_length=50,unique=True) # url corta
	
	logo = models.ImageField(upload_to = 'competicion')	
	fecha_inicio = models.DateField()
	fecha_fin = models.DateField()
	
	price = models.FloatField()
	estado = models.BooleanField(default=True)
	

	def __unicode__(self):
		return self.name

