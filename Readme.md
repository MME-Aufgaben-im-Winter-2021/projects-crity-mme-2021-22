# Projekt Crity

Die aktuelle _Release_-Version dieses Projekts kann unter: https://crity.software-engineering.education aufgerufen werden.

```
Diese Anwendung erlaubt es, PDF-Präsentationen zu versionieren, und diese Versionen zu bewerten.
```

In diesem Repository finden Sie eine Vorlage für die Entwicklung Ihrer Anwendung im MME-Kurs. Das Repository gibt eine grobe Struktur für Ihre Arbeit vor. Dort wo nötig, können Sie von diesen Vorgaben abweichen. Besprechen Sie Änderungen, insbesondere solche am _Deployment-Workflow_ aber im Vorfeld mit uns. 

## Nutzeranleitung

### Erstellen eines Accounts

Durch Klick auf "Create an Account" auf der Login-Seite oder direkt [hier](https://crity.software-engineering.education/#create-account) kann man einen neuen Account anlegen. Es kann pro E-Mail nur ein Account angelegt werden.

### Anmelden
Mit der E-Mail-Adresse und dem Passwort kann man sich auf [der Login-Seite](https://crity.software-engineering.education/#login) anmelden.

Danach bleibt man angemeldet, bis man sich oben in der Navigationsleiste abmeldet.

### Dashboard
Nach der Anmeldung oder durch Klick auf das Logo gelangen angemeldete Nutzer auf das Dashboard. Dort können durch Klick auf den (+) Button neue Präsentationen erstellt werden. Jede Präsentation hat einen Titel und eine Beschreibung. Alle Präsentationen eines Nutzers werden im Dashboard angezeigt. Durch Klick auf den (...) Knopf der Präsentationen können
- Titel/Beschreibung bearbeitet werden
- Präsentationen gelöscht werden.

Durch Klick auf die Präsentation selbst gelangt man zum...

### Editor

Im Editor wird eine Präsentation angezeigt. Durch Kopieren der URL (z. B. über den Copy-Link Button in der Navigationsleiste) kann man diese mit Bewertern teilen.

Um den Editor einer Präsentation zu öffnen, braucht man nicht angemeldet zu sein.

Jede Präsentation besteht aus mehren Versionen. Jede Version ist geknüpft an eine PDF. Die Versionen werden in der Timeline angezeigt, die ein- und ausgeklappt werden kann.

Um eine Version (und somit eine PDF) hochzuladen, kann man auf den (Add Version)-Button klicken. Versionen werden als Knoten in einer Baumstruktur angezeigt. Diese Knoten werden selektiert werden. Der selektierte Knoten erhält die neue Präsentation als Kind. Ist kein Knoten selektiert, so wird die Präsentation als Wurzelknoten erstellt. Durch **Doppelklick** wird eine Version ausgewählt, und man kann sich durch Einklappen der Timeline betrachten. Derzeit kann jeder eine neue Version erstellen. Mit der linken Maustaste kann man die Ansicht verschieben, durch Drehen des Mausrads kann man scrollen.

Jede PDF besteht bekanntlich aus mehreren Seiten. Diese Seiten werden links in Form von Thumbnails angezeigt. Durch Klick auf ein Thumbnail wird die entsprechende Seite ausgewählt.

Die ausgewählte Seite wird in der Mitte angezeigt. Der Viewer erlaubt es, durch Drehen des Mausrads zu zoomen, und durch Drücken des Mausrads die Ansicht zu verschieben. Außerdem kann, falls die Schriften nicht gebakt wurden, Text selektiert werden (Dabei erscheint auch ein gelber Punkt, siehe unten).

Jede Seite besitzt eine Liste von Threads. Diese bestehen aus einer Position auf der Folie, einem Verfasser und einem Titel (Text). Einen Thread erstellt man indem man:
- Im Hauptbereich auf den gewünschten Punkt auf der Seite klickt.
- Rechts erscheint ein Kommentar-Editor. Dort kann man ein beliebiges Pseudonym für den Verfasser und den Titel des Threads eingeben.

Threads werden nach der Anzahl an Votes sortiert. Dies geschieht nach einem Page-Refresh.

Threads lassen sich ausklappen. Sobald man tut das tut:
- wird der Punkt, zu dem der Thread gehört, durch Änderung der Größe hervorgehoben,
- sieht man die Unterkommentare,
- kann man im Kommentar-Editor, der auftaucht, neue Unterkommentare hinzufügen.

## Übersicht über das Repository

Im Repository befinden sich zu Beginn die folgenden Ordner und Dateien:

- `/.github` In diesem Ordner ist der [Workflow](https://github.com/features/actions) zum automatischen Bauen und Veröffentlichen Ihrer Anwendung formuliert. Idealerweise sprechen Sie Änderungen an der Konfiguration mit uns ab.
- `/app` In diesem Ordner liegen Quellcode und weitere Inhalte Ihrer Anwendung. Hier befinden sich alle Ressourcen, **die Sie selber für das Projekt angefertigt haben**. Externe Bibliotheken werden nicht in diesem Ordner abgelegt.
- `.env` In dieser Datei werden [Umgebungsvariablen](https://en.wikipedia.org/wiki/Environment_variable) festgehalten, die während des Bauvorgangs der Software benötigt werden.
- `.eslintrc`, `.jsbeautifyrc` Diese Dateien unterstützen Sie bei der [sauberen Formatierung](https://www.npmjs.com/package/js-beautify) und [Formulierung des Quellcodes](https://eslint.org/).
- `.gitignore` Die [gitignore-Datei](https://git-scm.com/docs/gitignore) ist für den hier beschriebenen Aufbau und Build-Workflow vorkonfiguriert. Denken Sie daran, dass Änderungen am Aufbau des Repositories ggf. auch dazu führen, dass Sie weitere Dateien aus der Versionskontrolle ausschließen müssen.
- `Readme.md` Diese Datei: Hier finden Sie Informationen zum Repository. Ergänzen Sie diese Datei laufend mit Informationen zu Ihrer Anwendung.
- `LICENSE` Eine Lizenzdatei mit der [MIT-Lizenz](https://opensource.org/licenses/MIT). Ersetzen Sie die Datei, falls Sie Ihr Repository unter einer anderen Lizenz veröffentlichen möchten oder müssen.

### Weitere Werkzeuge 

- `npm run dev`: Startet einen lokalen Webserver, der den Inhalt des `app`-Verzeichnis bereitstellt. Die `index.html`-Datei wird automatisch im Browser geöffnet. Während der Server läuft, wird der `app`-Ordner auf Änderungen an den beinhalteten Dateien überwacht. Ändern sich die Inhalte, wird der Webserver automatisch neu gestartet. Der Vorgang ist in der Datei `start_dev_server.js` festgehalten.
- `npm run build`: Erstellt eine _Release_-Version der Anwendung. Dabei werden etwaige Abhängigkeiten\* über `npm install` installiert, die JavaScript-Dateien in `app/src` mittels _ESLint_ geprüft und der gesamte Inhalt des `app`-Ordners in einen neuen Ordner `deploy` kopiert. Der Bauvorgang ist im wesentlich in der Datei `build_for_deployment.js` festgehalten, der bei Bedarf angepasst werden kann. 

\*: **Achtung**: Externe Bibliotheken werden dadurch wahrscheinlich nicht an die Stellen kopiert, an denen sie im _Client_ benötigt werden. Falls Sie auf externe Inhalte angewiesen sind, die Sie nicht durch direkte Links in der HTML-Datei (Stichwort [Content delivery network](https://en.wikipedia.org/wiki/Content_delivery_network)) einbinden können, sprechen Sie das weitere Vorgehen bitte mit uns ab.


### Bau und Veröffentlichung

Über den im Repository vorhandenen _Workflow_ wird Ihre Anwendung bei jedem _Push_ in die `main`-Branch neu erstellt und veröffentlicht. Dabei passieren folgenden Dinge:

- Die Anwendung wird über den Befehl `npm run build` (siehe oben) auf den GitHub-Servern gebaut.
- Der Inhalt des so erstellten `deploy`-Ordners wird in die Branch `gh-pages` kopiert.
- Die neue Webseite steht dann direkt unter der URL Ihres Projektes zur Verfügung.