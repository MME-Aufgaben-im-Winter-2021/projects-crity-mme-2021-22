# Erreichter Stand

Die Anwendung sollte mit einer gewissen Einweisung des Benutzers im Alltag nutzbar sein. Für eine genauere Beschreibung der Sachen die *gehen*, siehe README.md.

Schlecht ist derzeit vor allem, das mit direkten Anfragen an den Appwrite-Server auf Dokumente von anderen Nutzern zugegriffen werden kann. Dies liegt vor allem an Appwrites unflexiblen **Permission-System**. Eine Lösung dafür wäre, alle Datenbanken nur für Administratoren zugänglich zu machen, und dann mittels Appwrite-Funktionen alle Berechtigungscheck selber zu implementieren. Vermutlich sollte dann auch irgendeine Form von Verschlüsselung eingebaut werden, damit Administratoren keinen Zugriff auf die PDFs haben...

Auch **Entfernen und Bearbeiten** von Objekten (Präsentationen, Versionen, Kommentare, etc.) sind nur in eingeschränkten Umfang umgesetzt. Teils liegt das an den Permissions (der Autor der Präsentation kann nicht die zugehörigen Kommentare entfernen; dies wäre aber für das Löschen von Präsentationen nötig). Außerdem hat uns die Zeit dafür gefehlt.

Außerdem fehlt uns an vielen Stellen nutzerfreundliches **Error-Reporting**. Auch hierfür hat die Zeit nicht gereicht.

# Arbeitsteilung

Neben kleineren Änderungen und Bugfixes, die sich in den Commit-Logs nachverfolgen lassen, sind die größeren Features folgenden Personen zu verdanken:

|Wer|hat was getan?|
|--|--|
| Lee-Ann Seegets |Screens für das Login, das Erstellen von Accounts, Dashboard.|
| Marcelo Mutzbauer|PDF Rendering und Viewer mit PDF.JS, grundlegende Appwrite-Integration, Screen Navigation|
| Maximilian Schmerle|Thread-System, verzweigte Versionierung mit vis-network|
| Philipp Hohenthanner|HTML für das grundlegende UI-Gerüst, Login|