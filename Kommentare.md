# Erreichter Stand

Die geplante Anwendung wurde zu diesem Stand, bis auf ein paar kleine fehlende Features, komplett wie geplant umgesetzt. </br>Das **Login/Registrierungs-Feature** erlaubt es Nutzern, Projekte zu Erstellen und zu Verwalten, sowie eine Übersicht über diese auf dem Dashboard einzusehen. Das **Einladung** von potentiellen Reviewern ist über die URL des jeweiligen Projekts möglich und durch die eingeführte Funktion **anonymer Accounts** müssen diese keine Anmeldung durchführen. In dem Fall besitzen sie dann jedoch auch keinen Zugriff auf ein eigenes Dashboard.

Auf dem **Editorscreen**, dem Herzstück der Anwendung, können mehrere PDFs hochgeladen werden. Diese werden durch ein visuell gestütztes **Versionierungssystem** in einen Zusammenhang gebracht. Somit kann der Nutzer gut nachvollziehen, wie die verschiedenen Versionen zusammenhängen und die Entwicklungsstruktur des zu bewertenden Dokuments einsehen.</br>Einmal erstellt können Nutzer auf den PDFs **Anmerkungen** hinterlassen, welche in der jeweiligen Folie als Punkt dargestellt werden, an den je ein bestimmter Thread verknüpft ist.</br>
Unter diesen **Threads** kann im folgenden über die Anmerkungen zu den PDFs diskutiert werden. Durch ein **Live-Updaten** der Threads und Threadkommentare wird eine gewisse Nähe der Reviewer erzeugt und das **Liken** der Threads bietet dem Author die Möglichkeit, die Relevanz der Anmerkungen einordnen zu können.</br>
Die **Navigation** durch die Anwendung wird mit Hilfe einer Photoshop-ähnlichen Steuerung in PDF-Viewer und Versionsanzeige deutlich erleichtert und auch die Navigation durch die einzelnen Folien läuft durch die **Timeline** sehr flüssig und einfach.</br>
Eine **grafische Unterstützung** des Nutzers findet vor allem durch das ändern von Farben beim Auswählen bestimmter Elemente statt. Außerdem werden wichtige Informationen, wie Benutzer- und Präsentationsname dynamisch dargestellt.

Ausbaufähig ist derzeit vor allem, das mit direkten Anfragen an den Appwrite-Server auf Dokumente von anderen Nutzern zugegriffen werden kann. Dies liegt hauptsächlich an Appwrites unflexiblen **Permission-System**. Eine Lösung dafür wäre, alle Datenbanken nur für Administratoren zugänglich zu machen und dann unter Zuhilfenahme der Appwrite-Funktionen alle Berechtigungschecks selbst zu implementieren. Vermutlich sollte dann auch irgendeine Form von Verschlüsselung eingebaut werden, damit Administratoren (u.a. aus Datenschutzgründen) keinen Zugriff auf die PDFs der Nutzer haben.

Auch das **Entfernen und Bearbeiten** von Objekten (Präsentationen, Versionen, Kommentare, etc.) sind nur in eingeschränkten Umfang umgesetzt. Teils liegt das an den Permissions (der Autor der Präsentation kann die zugehörigen Kommentare nicht entfernen; dies wäre aber für das Löschen von Präsentationen nötig). Außerdem hat uns die Zeit dafür gefehlt.

Außerdem fehlt uns an vielen Stellen nutzerfreundliches **Error-Reporting**. Auch hierfür hat die Zeit nicht gereicht.

# Arbeitsteilung

Neben kleineren Änderungen und Bugfixes, die sich in den Commit-Logs nachverfolgen lassen, sind die größeren Features folgenden Personen zu verdanken:

|Wer|hat was getan?|
|--|--|
| Lee-Ann Seegets |Screens für das Login, das Erstellen von Accounts, Dashboard.|
| Marcelo Mutzbauer|PDF Rendering und Viewer mit PDF.JS, grundlegende Appwrite-Integration, Screen Navigation|
| Maximilian Schmerle|Thread-System, verzweigte Versionierung mit vis-network|
| Philipp Hohenthanner|HTML für das grundlegende UI-Gerüst, Login|
