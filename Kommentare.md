# Erreichter Stand

Die geplant Anwendung wurde zu diesem Stand, bis auf ein paar kleine fehlende Features komplett wie geplant umgesetzt. </br>Das **Login/Registrierungs-Feature** erlaubt Nutzern ihre Projekte zu Estellen und zu Verwalten, sowie eine Übersicht über diese auf dem Dashboard zu erhalten. Eine **Einladung** von Reviewern ist über die URL des jeweiligen Projekts möglich und durch die eingeführte Funktion von **anonymen Accounts** müssen Reviewer keine Anmeldung durchführen. Jedoch besitzen sie dann auch keinen Zugriff auf ein eigenes Dashboard.

Auf dem **Editorscreen**, dem Herzstück der Anwendung können in erster Linie mehrere PDFs hochgeladen werden. Diese werden durch ein **Versionierungssystem** in einen Zusammenhang gebracht, welcher visuell gestützt ist. Somit kann der Nutzer gut nachvollziehen, wie die verschiedenen Versionen zusammenhängen und was die Entwicklungsstruktur des zu bewertenden Dokuments ist.</br>Einmal erstellt können Nutzer auf den PDFs **Anmerkungen** hinterlassen, welche grafisch gestützt als Punkt und als Thread dargestellt und verknüpft werden.</br>
Unter diesen **Threads** kann im folgenden über die Anmerkungen zu den PDFs diskutiert werden. Durch ein **Live-Updaten** der Threads und Threadkommentare wird eine gewisse Nähe der Reviewer erzeugt und das **Liken** der Threads führt zu der Möglichkeit des Einordnens der Thread-Wichtigkeit für den Autor.</br>
Die **Navigation** durch die Anwendung wird mit Hilfe von einer Photoshop ähnlichen Steuerung in PDF-Viewer und Versionsanzeige deutlich erleichtert und auch die Navigation durch die einzelnen Folien läuft durch die **Timeline** sehr flüssig und einfach.</br>
Eine **grafische Unterstützung** des Nutzers findet vor allem durch das ändern von Farben, wenn bestimmte Elemente ausgewählt sind statt und außerdem werden wichtige Informationen, wie Benutzer- und Präsentationsname dynamisch dargestellt.

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
