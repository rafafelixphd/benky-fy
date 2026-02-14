from flask_restx import Namespace

ns = Namespace("words", description="Words operations")

from . import crud, study, wlist


__all__ = ["ns", "crud", "study", "wlist"]
