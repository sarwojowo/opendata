from flask import render_template
from app.models.Dataset import *
from app.models.Detail import *
import pandas as pd

def index():

    return render_template('pages/home.html', segment='home')