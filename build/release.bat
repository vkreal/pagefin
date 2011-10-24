CD C:\

DEL /S/Q C:\xkool-stagering\src\static\dojo-src
RD /S/Q C:\xkool-stagering\src\static\dojo-src

DEL /S/Q C:\xkool-stagering\src\static\core
RD /S/Q C:\xkool-stagering\src\static\core

DEL /S/Q C:\xkool-stagering\src\static\google
RD /S/Q C:\xkool-stagering\src\static\google

CD C:\
@rem xcopy /e C:\xkool-stagering\src\static\release C:\xkool-stagering\src\static\dojo-src\

MKDIR C:\xkool-stagering\src\static\dojo-src\dojo\
MKDIR C:\xkool-stagering\src\static\dojo-src\dijit\themes\soria
MKDIR C:\xkool-stagering\src\static\dojo-src\dojox\layout\resources

CD C:\
xcopy /e C:\xkool-stagering\src\static\release\dojox\layout\resources\icons C:\xkool-stagering\src\static\dojo-src\dojox\layout\resources\icons\
CD C:\
xcopy /e C:\xkool-stagering\src\static\release\dojox\widget\Standby C:\xkool-stagering\src\static\dojo-src\dojox\widget\Standby\

CD C:\
xcopy /e C:\xkool-stagering\src\static\release\dojo\nls C:\xkool-stagering\src\static\dojo-src\dojo\nls\
CD C:\
copy C:\xkool-stagering\src\static\release\dojo\dojo.js C:\xkool-stagering\src\static\dojo-src\dojo\dojo.js
CD C:\
copy C:\xkool-stagering\src\static\release\dojo\pagefin.js C:\xkool-stagering\src\static\dojo-src\dojo\pagefin.js
CD C:\
copy C:\xkool-stagering\src\static\release\dojo\facebook.js C:\xkool-stagering\src\static\dojo-src\dojo\facebook.js
CD C:\
xcopy C:\xkool-stagering\src\static\release\dojo\resources C:\xkool-stagering\src\static\dojo-src\dojo\resources\
CD C:\
xcopy /e C:\xkool-stagering\src\static\release\dijit\themes\soria\images C:\xkool-stagering\src\static\dojo-src\dijit\themes\soria\images\
CD C:\
xcopy /e C:\xkool-stagering\src\static\release\dijit\themes\a11y C:\xkool-stagering\src\static\dojo-src\dijit\themes\a11y\

CD C:\
copy C:\xkool-stagering\src\static\release\dijit\themes\soria\soria.css C:\xkool-stagering\src\static\dojo-src\dijit\themes\soria\soria.css

DEL /S/Q C:\xkool-stagering\src\static\release
RD /S/Q C:\xkool-stagering\src\static\release

@rem upload

cd C:\Program Files (x86)\Google\google_appengine
appcfg.py update C:\xkool-stagering\src