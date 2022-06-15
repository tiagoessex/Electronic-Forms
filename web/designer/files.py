
################################################################
#  
#  Form cloning => duplicate assets
#  Task: remove-all-empty-dirs => remove empty asset directories
#
################################################################

import errno
import shutil
import os.path 


def copyDirectory(src, dest):
   try:
      shutil.copytree(src, dest)
   except OSError as e:
      if e.errno == errno.ENOTDIR:
         shutil.copy(src, dest)
      else:
         print('Directory not copied. Error: %s' % e)

def removeDirectory(src):
   try:
      if (os.path.isdir(src)):
         shutil.rmtree(src)
   except OSError as e:
      print('Directory and contents not deleted. Error: %s' % e)