from flask_restx import Namespace

from . import crud, study, wlist

ns = Namespace("words", description="Words operations")

__all__ = ["ns", "crud", "study", "wlist"]
